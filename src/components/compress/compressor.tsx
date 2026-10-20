import { useEffect, useRef, useState } from "react";
import { FileCard, SettingsPanel } from "@/components/compress/settings-panel";
import { ProcessingPanel } from "@/components/compress/processing-panel";
import { ResultPanel } from "@/components/compress/result-panel";
import { UploadZone } from "@/components/compress/upload-zone";
import { Button } from "@/components/ui/button";
import { LIMITS, SAWERIA, saweriaReady } from "@/lib/compress/config";
import { compressInWorker, messageOf } from "@/lib/compress/engine";
import { formatBytes, formatPercent, formatWhen, outputName, parseTargetMb, safeDisplayName, summarize } from "@/lib/compress/format";
import { ERROR_TEXT } from "@/lib/compress/messages";
import {
  bumpStats,
  clearHistory,
  pushHistory,
  readHistory,
  reserveRateSlot,
  SAWERIA_POPUP_KEY,
} from "@/lib/compress/storage";
import type { HistoryEntry, ProfileId, ResultStats } from "@/lib/compress/types";
import { hasActivePdfContent, hasPdfHeader, inspectPdf, validateFileMeta } from "@/lib/compress/validate";

type Phase = "pick" | "ready" | "processing" | "result";

function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function Compressor() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileId>("recommended");
  const [target, setTarget] = useState("");
  const [grayscale, setGrayscale] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [progress, setProgress] = useState({ fraction: 0, label: "Menyiapkan…" });
  const [stats, setStats] = useState<ResultStats | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [filename, setFilename] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [popup, setPopup] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const urls = useRef<{ file?: string; thumb?: string }>({});
  const lock = useRef(false);
  const requestId = useRef(0);

  useEffect(() => {
    setHistory(readHistory());
    return () => {
      if (urls.current.file) URL.revokeObjectURL(urls.current.file);
      if (urls.current.thumb) URL.revokeObjectURL(urls.current.thumb);
    };
  }, []);

  useEffect(() => {
    if (phase !== "processing") return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result" || expired) return;
    const timer = window.setTimeout(() => {
      if (urls.current.file) URL.revokeObjectURL(urls.current.file);
      if (urls.current.thumb) URL.revokeObjectURL(urls.current.thumb);
      urls.current = {};
      setFileUrl(null);
      setThumbUrl(null);
      setExpired(true);
      setBanner(ERROR_TEXT.DOWNLOAD_EXPIRED);
    }, LIMITS.fileTtlMs);
    return () => window.clearTimeout(timer);
  }, [phase, expired, filename]);

  function revoke() {
    if (urls.current.file) URL.revokeObjectURL(urls.current.file);
    if (urls.current.thumb) URL.revokeObjectURL(urls.current.thumb);
    urls.current = {};
  }

  function resetToPick() {
    revoke();
    setFile(null);
    setStats(null);
    setFileUrl(null);
    setThumbUrl(null);
    setExpired(false);
    setPopup(false);
    setBanner(null);
    setNote(null);
    setPhase("pick");
  }

  async function acceptFile(next: File, count = 1) {
    const id = ++requestId.current;
    const meta = validateFileMeta(next);
    if (meta) {
      setBanner(meta);
      setNote(null);
      return;
    }
    let inspected: string | null = null;
    try {
      inspected = await inspectPdf(next);
    } catch {
      inspected = ERROR_TEXT.INVALID_PDF;
    }
    if (id !== requestId.current) return;
    if (inspected) {
      setBanner(inspected);
      setNote(null);
      return;
    }
    revoke();
    setFile(next);
    setStats(null);
    setFileUrl(null);
    setThumbUrl(null);
    setExpired(false);
    setPopup(false);
    setBanner(null);
    setNote(count > 1 ? "Hanya satu PDF yang diproses. File pertama yang dipakai." : null);
    setPhase("ready");
  }

  async function compress() {
    if (!file || lock.current) return;
    const parsed = parseTargetMb(target);
    if (!parsed.ok) {
      setBanner("Ukuran target tidak valid. Isi angka dalam MB, misalnya 5.");
      return;
    }
    const limited = reserveRateSlot();
    if (limited) {
      setBanner(limited);
      return;
    }
    lock.current = true;
    setBanner(null);
    setNote(null);
    setExpired(false);
    setProgress({ fraction: 0, label: "Menyiapkan…" });
    setPhase("processing");
    const started = performance.now();
    try {
      const buffer = await file.arrayBuffer();
      const result = await compressInWorker(
        buffer,
        {
          profile,
          targetBytes: parsed.bytes,
          grayscale,
          removeMetadata,
        },
        (message) => setProgress({ fraction: message.fraction, label: message.label }),
      );
      const out = new Uint8Array(result.buffer);
      if (!hasPdfHeader(out) || hasActivePdfContent(out)) {
        setBanner(ERROR_TEXT.UNSAFE_PDF);
        setPhase("ready");
        return;
      }
      revoke();
      const nextFileUrl = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      const nextThumbUrl = result.thumb
        ? URL.createObjectURL(new Blob([result.thumb], { type: "image/jpeg" }))
        : null;
      urls.current = { file: nextFileUrl, thumb: nextThumbUrl ?? undefined };
      setFilename(outputName(file.name));
      setFileUrl(nextFileUrl);
      setThumbUrl(nextThumbUrl);
      setStats(result.stats);
      setDurationMs(Math.round(performance.now() - started));
      setPhase("result");
      if (summarize(result.stats.inputBytes, result.stats.outputBytes).delta > 0) bumpStats("reduced");
      setHistory(
        pushHistory({
          id: newId(),
          at: Date.now(),
          name: safeDisplayName(file.name),
          inputBytes: result.stats.inputBytes,
          outputBytes: result.stats.outputBytes,
          profile,
          pages: result.stats.pages,
          method: result.stats.method,
        }),
      );
    } catch (error) {
      setBanner(messageOf(error));
      setPhase("ready");
    } finally {
      lock.current = false;
    }
  }

  function download() {
    if (expired || !fileUrl) {
      setBanner(ERROR_TEXT.DOWNLOAD_EXPIRED);
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = filename;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    bumpStats("downloaded");
    if (!saweriaReady() || !SAWERIA.popupEnabled) return;
    try {
      if (sessionStorage.getItem(SAWERIA_POPUP_KEY)) return;
      sessionStorage.setItem(SAWERIA_POPUP_KEY, "1");
      setPopup(true);
    } catch {
      /* popup opsional */
    }
  }

  return (
    <div>
      <section className="panel p-4 sm:p-6" aria-busy={phase === "processing"}>
        {banner ? (
          <p className="mb-4 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {banner}
          </p>
        ) : null}
        {note ? <p className="mb-4 rounded-control bg-warn-soft px-4 py-3 text-sm text-warn">{note}</p> : null}
        {phase === "pick" ? <UploadZone onFile={(next, count) => void acceptFile(next, count)} /> : null}
        {phase === "ready" && file ? (
          <>
            <FileCard name={safeDisplayName(file.name)} size={file.size} onReplace={resetToPick} />
            <SettingsPanel
              profile={profile}
              onProfile={setProfile}
              target={target}
              onTarget={setTarget}
              grayscale={grayscale}
              onGrayscale={setGrayscale}
              removeMetadata={removeMetadata}
              onRemoveMetadata={setRemoveMetadata}
            />
            <Button className="mt-5" size="lg" onClick={() => void compress()}>
              Kompres PDF
            </Button>
          </>
        ) : null}
        {phase === "processing" ? <ProcessingPanel fraction={progress.fraction} label={progress.label} /> : null}
        {phase === "result" && stats ? (
          <ResultPanel
            stats={stats}
            durationMs={durationMs}
            fileUrl={fileUrl}
            thumbUrl={thumbUrl}
            filename={filename}
            expired={expired}
            onDownload={download}
            onAgain={resetToPick}
            popup={popup}
            onClosePopup={() => setPopup(false)}
          />
        ) : null}
      </section>
      <p className="mt-3 text-center text-sm text-muted">Gratis · tanpa login · file tidak diunggah ke server</p>
      <HistoryList
        items={history}
        onClear={() => {
          clearHistory();
          setHistory([]);
        }}
      />
    </div>
  );
}

function HistoryList({ items, onClear }: { items: HistoryEntry[]; onClear: () => void }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">Riwayat di perangkat ini</h2>
        {items.length > 0 ? (
          <Button variant="ghost" onClick={onClear}>
            Hapus riwayat
          </Button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted">
        Hanya angka ukuran dan nama file, tersimpan di browser Anda. Isi PDF tidak disimpan.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line px-4 py-6 text-sm text-muted">
          Belum ada kompresi di perangkat ini.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-card border border-line">
          {items.map((item) => {
            const summary = summarize(item.inputBytes, item.outputBytes);
            return (
              <li key={item.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item.name}</p>
                  <p className="text-sm text-muted">
                    {formatWhen(item.at)} · {item.pages} halaman · {item.profile}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-ink">
                  {formatBytes(item.inputBytes)} → {formatBytes(item.outputBytes)} (
                  {formatPercent(Math.max(0, summary.reduction))})
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
