import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { LIMITS } from "@/lib/compress/config";
import { errorText } from "@/lib/compress/messages";
import type { CompressPayload, ProgressMsg, WorkerOut, WorkerResult } from "@/lib/compress/types";

export type CompressOptions = Omit<CompressPayload, "type" | "buffer" | "deadline" | "pdfWorkerUrl">;

export function compressInWorker(
  buffer: ArrayBuffer,
  options: CompressOptions,
  onProgress: (progress: ProgressMsg) => void,
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/compress.worker.ts", import.meta.url), {
      type: "module",
    });
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("PROCESSING_TIMEOUT"));
    }, LIMITS.timeoutMs + 8_000);

    const finish = () => {
      window.clearTimeout(timer);
      worker.terminate();
    };

    worker.onmessage = (event: MessageEvent<WorkerOut>) => {
      const message = event.data;
      if (!message || typeof message !== "object" || !("type" in message)) return;
      if (message.type === "progress") {
        onProgress(message);
        return;
      }
      if (message.type === "result") {
        finish();
        resolve(message);
        return;
      }
      if (message.type === "error") {
        finish();
        reject(new Error(message.code || "COMPRESSION_FAILED"));
      }
    };

    worker.onerror = () => {
      finish();
      reject(new Error("COMPRESSION_FAILED"));
    };

    const payload: CompressPayload = {
      type: "compress",
      buffer,
      deadline: Date.now() + LIMITS.timeoutMs,
      pdfWorkerUrl: new URL(pdfWorkerUrl, window.location.href).href,
      ...options,
    };
    worker.postMessage(payload, [buffer]);
  });
}

export function messageOf(error: unknown): string {
  if (error instanceof Error) return errorText(error.message);
  return errorText(undefined);
}
