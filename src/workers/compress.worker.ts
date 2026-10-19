import * as pdfjs from "pdfjs-dist";
import { EncryptedPDFError, PDFDocument } from "pdf-lib";
import { LIMITS } from "../lib/compress/config";
import { ERROR_TEXT } from "../lib/compress/messages";
import { hasActivePdfContent, hasPdfHeader } from "../lib/compress/validate";
import type { CompressMethod, CompressPayload, ResultStats, WorkerResult } from "../lib/compress/types";

if (typeof window === "undefined") {
  (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
}

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<CompressPayload>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

type Bytes = Uint8Array<ArrayBufferLike>;
type RasterSettings = { scale: number; quality: number; maxEdge: number };
type RenderedPage = { jpeg: Bytes; widthPt: number; heightPt: number };
type Opened = { doc: pdfjs.PDFDocumentProxy; close: () => Promise<void> };

function fail(code: string): Error {
  return new Error(code);
}

function assertTime(deadline: number) {
  if (Date.now() > deadline) throw fail("PROCESSING_TIMEOUT");
}

function postProgress(fraction: number, label: string) {
  scope.postMessage({
    type: "progress",
    fraction: Math.max(0, Math.min(1, fraction)),
    label,
  });
}

function isEncrypted(error: unknown): boolean {
  if (error instanceof EncryptedPDFError) return true;
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  return name === "PasswordException" || /encrypt|password/i.test(`${name} ${message}`);
}

function knownCode(error: unknown): string | null {
  if (error instanceof Error && ERROR_TEXT[error.message]) return error.message;
  return null;
}

async function structuralOptimize(bytes: Bytes, removeMetadata: boolean): Promise<Bytes> {
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    updateMetadata: false,
    throwOnInvalidObject: false,
  });
  if (doc.getPageCount() < 1) throw fail("INVALID_PDF");
  if (removeMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  }
  return doc.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 40 });
}

async function openPdf(bytes: Bytes): Promise<Opened> {
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    disableFontFace: true,
    useSystemFonts: false,
    useWasm: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
    disableStream: true,
    isOffscreenCanvasSupported: true,
    stopAtErrors: true,
    verbosity: 0,
    canvasMaxAreaInBytes: 16_777_216,
  });
  try {
    const doc = await task.promise;
    return {
      doc,
      close: () => task.destroy(),
    };
  } catch (error) {
    await task.destroy().catch(() => undefined);
    if (isEncrypted(error)) throw fail("PASSWORD_PROTECTED");
    throw fail("INVALID_PDF");
  }
}

function profilePlan(profile: CompressPayload["profile"], hasTarget: boolean): RasterSettings[] {
  const presets: Record<CompressPayload["profile"], RasterSettings> = {
    recommended: { scale: 1.7, quality: 0.72, maxEdge: 1700 },
    strong: { scale: 1.25, quality: 0.52, maxEdge: 1400 },
    maximum: { scale: 0.95, quality: 0.36, maxEdge: 1100 },
  };
  const first = presets[profile];
  if (!hasTarget) return [first];
  return [
    first,
    {
      scale: first.scale * 0.8,
      quality: Math.max(0.28, first.quality - 0.16),
      maxEdge: Math.round(first.maxEdge * 0.85),
    },
    { scale: first.scale * 0.66, quality: 0.26, maxEdge: 980 },
  ];
}

function applyGrayscale(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
    data[index] = gray;
    data[index + 1] = gray;
    data[index + 2] = gray;
  }
  ctx.putImageData(image, 0, 0);
}

async function renderJpeg(page: pdfjs.PDFPageProxy, settings: RasterSettings, grayscale: boolean): Promise<RenderedPage> {
  const base = page.getViewport({ scale: 1 });
  if (base.width < 1 || base.height < 1) throw fail("INVALID_PDF");
  let width = base.width * settings.scale;
  let height = base.height * settings.scale;
  const edge = Math.max(width, height);
  if (edge > settings.maxEdge) {
    const factor = settings.maxEdge / edge;
    width *= factor;
    height *= factor;
  }
  const maxPixels = 2_000_000;
  if (width * height > maxPixels) {
    const factor = Math.sqrt(maxPixels / (width * height));
    width *= factor;
    height *= factor;
  }
  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d", { alpha: false, willReadFrequently: grayscale });
  if (!context) throw fail("COMPRESSION_FAILED");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  await page
    .render({
      canvas: canvas as unknown as HTMLCanvasElement,
      viewport,
      annotationMode: pdfjs.AnnotationMode.ENABLE,
      background: "#ffffff",
    })
    .promise;
  if (grayscale) applyGrayscale(context, width, height);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: settings.quality });
  const jpeg = new Uint8Array(await blob.arrayBuffer());
  if (jpeg.byteLength < 32) throw fail("COMPRESSION_FAILED");
  page.cleanup();
  return { jpeg, widthPt: base.width, heightPt: base.height };
}

async function buildRasterPdf(pages: RenderedPage[], removeMetadata: boolean): Promise<Bytes> {
  const doc = await PDFDocument.create();
  if (removeMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  }
  for (const page of pages) {
    const image = await doc.embedJpg(page.jpeg);
    const next = doc.addPage([page.widthPt, page.heightPt]);
    next.drawImage(image, { x: 0, y: 0, width: page.widthPt, height: page.heightPt });
  }
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

function toBuffer(bytes: Bytes): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function run(payload: CompressPayload): Promise<WorkerResult> {
  pdfjs.GlobalWorkerOptions.workerSrc = payload.pdfWorkerUrl;
  const original = new Uint8Array(payload.buffer);
  if (!hasPdfHeader(original)) throw fail("INVALID_PDF");
  if (hasActivePdfContent(original)) throw fail("UNSAFE_PDF");

  postProgress(0.05, "Memeriksa PDF…");
  assertTime(payload.deadline);

  let structural: Bytes | null = null;
  try {
    postProgress(0.12, "Mengoptimalkan struktur…");
    structural = await structuralOptimize(original.slice(), payload.removeMetadata);
  } catch (error) {
    if (knownCode(error) === "INVALID_PDF") structural = null;
    else if (!isEncrypted(error)) structural = null;
  }

  assertTime(payload.deadline);
  const opened = await openPdf(original);
  const pdf = opened.doc;
  try {
    const pageCount = pdf.numPages;
    if (pageCount < 1) throw fail("INVALID_PDF");
    if (pageCount > LIMITS.maxPages) throw fail("PAGE_LIMIT");

    const attemptBytes: number[] = [];
    const best: { bytes: Bytes; method: CompressMethod } = { bytes: original, method: "original" };

    const consider = (bytes: Bytes, method: CompressMethod) => {
      attemptBytes.push(bytes.byteLength);
      const preferGray = payload.grayscale && method === "raster";
      if (preferGray) {
        if (best.method !== "raster" || bytes.byteLength < best.bytes.byteLength) {
          best.bytes = bytes;
          best.method = method;
        }
        return;
      }
      if (bytes.byteLength < best.bytes.byteLength) {
        best.bytes = bytes;
        best.method = method;
      }
    };

    if (structural) consider(structural, "structure");

    const structuralReduction = structural ? 1 - structural.byteLength / original.byteLength : 0;
    const structureHitsTarget =
      payload.targetBytes != null && structural != null && structural.byteLength <= payload.targetBytes;
    const wantRaster =
      pageCount <= LIMITS.rasterMaxPages &&
      (payload.grayscale ||
        payload.profile !== "recommended" ||
        (payload.targetBytes != null && !structureHitsTarget) ||
        structuralReduction < 0.05);

    if (!wantRaster && pageCount > LIMITS.rasterMaxPages && payload.profile !== "recommended") {
      postProgress(0.4, "Terlalu banyak halaman untuk pemadatan gambar. Struktur saja yang dioptimalkan.");
    }

    if (wantRaster) {
      const plans = profilePlan(payload.profile, payload.targetBytes != null);
      for (let attempt = 0; attempt < plans.length; attempt += 1) {
        assertTime(payload.deadline);
        const settings = plans[attempt];
        const rendered: RenderedPage[] = [];
        try {
          for (let index = 1; index <= pageCount; index += 1) {
            assertTime(payload.deadline);
            const span = 0.7 / plans.length;
            const start = 0.18 + attempt * span;
            postProgress(start + (span * index) / pageCount, `Mengompres halaman ${index} dari ${pageCount}…`);
            const page = await pdf.getPage(index);
            rendered.push(await renderJpeg(page, settings, payload.grayscale));
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          postProgress(0.9, "Menyusun PDF…");
          const raster = await buildRasterPdf(rendered, payload.removeMetadata);
          consider(raster, "raster");
          if (payload.targetBytes == null) break;
          if (raster.byteLength <= payload.targetBytes) break;
        } catch (error) {
          const code = knownCode(error);
          if (code === "PROCESSING_TIMEOUT" || code === "PASSWORD_PROTECTED" || code === "PAGE_LIMIT") throw error;
          if (!structural && attempt === plans.length - 1 && best.method === "original") {
            throw error instanceof Error ? error : fail("COMPRESSION_FAILED");
          }
        }
      }
    }

    postProgress(0.94, "Membuat pratinjau…");
    let thumb: Bytes | null = null;
    try {
      const preview = await openPdf(best.bytes.slice());
      try {
        const page = await preview.doc.getPage(1);
        const shot = await renderJpeg(
          page,
          { scale: 1.15, quality: 0.82, maxEdge: 960 },
          best.method === "raster" && payload.grayscale,
        );
        thumb = shot.jpeg;
      } finally {
        await preview.close();
      }
    } catch {
      thumb = null;
    }

    let targetStatus: ResultStats["targetStatus"] = "none";
    if (payload.targetBytes != null) {
      targetStatus = best.bytes.byteLength <= payload.targetBytes ? "met" : "unmet";
    }

    const stats: ResultStats = {
      inputBytes: original.byteLength,
      outputBytes: best.bytes.byteLength,
      pages: pageCount,
      profile: payload.profile,
      method: best.method,
      textPreserved: best.method !== "raster",
      targetBytes: payload.targetBytes,
      targetStatus,
      attemptBytes,
      grayscale: payload.grayscale && best.method === "raster",
    };

    postProgress(1, "Selesai");
    const buffer = toBuffer(best.bytes);
    const thumbBuffer = thumb ? toBuffer(thumb) : null;
    return { type: "result", buffer, thumb: thumbBuffer, stats };
  } finally {
    await opened.close().catch(() => undefined);
  }
}

scope.onmessage = (event) => {
  void (async () => {
    try {
      const result = await run(event.data);
      const transfer: Transferable[] = [result.buffer];
      if (result.thumb) transfer.push(result.thumb);
      scope.postMessage(result, transfer);
    } catch (error) {
      const code = knownCode(error) ?? (isEncrypted(error) ? "PASSWORD_PROTECTED" : "COMPRESSION_FAILED");
      scope.postMessage({ type: "error", code });
    }
  })();
};
