import { useEffect, useRef, useState } from "react";
import { Check, Coffee, X } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { SAWERIA, saweriaReady } from "@/lib/compress/config";
import {
  formatBytes,
  formatDuration,
  formatPercent,
  methodLabel,
  resultHeadline,
  resultNote,
  summarize,
} from "@/lib/compress/format";
import type { ResultStats } from "@/lib/compress/types";

export function ResultPanel({
  stats,
  durationMs,
  fileUrl,
  thumbUrl,
  filename,
  expired,
  onDownload,
  onAgain,
  popup,
  onClosePopup,
}: {
  stats: ResultStats;
  durationMs: number;
  fileUrl: string | null;
  thumbUrl: string | null;
  filename: string;
  expired: boolean;
  onDownload: () => void;
  onAgain: () => void;
  popup: boolean;
  onClosePopup: () => void;
}) {
  const [preview, setPreview] = useState(false);
  const summary = summarize(stats.inputBytes, stats.outputBytes);
  const savedLabel =
    summary.delta >= 0 ? formatBytes(summary.delta) : `Bertambah ${formatBytes(Math.abs(summary.delta))}`;

  return (
    <div>
      <p className="text-sm font-medium text-stamp">{summary.tone === "grew" ? "Perlu dicek" : "Selesai"}</p>
      <h2 className="mt-1 font-display text-3xl text-ink">{resultHeadline(summary.tone)}</h2>
      <p className="mt-2 text-muted">{resultNote(summary.tone, stats.method)}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Ukuran awal" value={formatBytes(stats.inputBytes)} />
        <Stat label="Ukuran akhir" value={formatBytes(stats.outputBytes)} />
        <Stat label="Selisih" value={savedLabel} />
        <Stat label="Pengurangan" value={formatPercent(Math.max(0, summary.reduction))} />
      </dl>

      <p className="mt-4 text-sm text-muted">
        {methodLabel(stats.method, stats.textPreserved)}
        {" · "}
        {stats.pages} halaman
        {" · "}
        {formatDuration(durationMs)}
        {stats.grayscale ? " · abu-abu" : ""}
      </p>

      {stats.targetBytes != null ? (
        <div className="mt-4 rounded-control bg-bg px-4 py-3 text-sm text-ink">
          <p className="font-medium">
            Target {formatBytes(stats.targetBytes)}{" "}
            {stats.targetStatus === "met" ? "tercapai" : "belum tercapai"}
          </p>
          {stats.targetStatus === "unmet" ? (
            <p className="mt-1 text-muted">Ini hasil terbaik yang masih layak pada profil ini.</p>
          ) : null}
          {stats.attemptBytes.length > 0 ? (
            <ol className="mt-2 space-y-1 tabular-nums text-muted">
              {stats.attemptBytes.map((bytes, index) => (
                <li key={`${bytes}-${index}`} className="flex items-center gap-2">
                  <span>
                    Percobaan {index + 1} → {formatBytes(bytes)}
                  </span>
                  {bytes <= (stats.targetBytes ?? 0) ? <Check className="size-4 text-stamp" aria-label="Mencapai target" /> : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt="Pratinjau halaman pertama hasil kompresi"
          className="mt-5 max-h-80 w-full rounded-control border border-line object-contain object-top bg-bg"
        />
      ) : null}

      <div className="mt-5 grid gap-2">
        <Button variant="line" size="lg" onClick={() => setPreview(true)} disabled={expired || !fileUrl}>
          Pratinjau PDF
        </Button>
        <Button size="lg" onClick={onDownload} disabled={expired || !fileUrl}>
          {summary.tone === "optimal" || summary.tone === "grew" ? "Unduh PDF" : "Unduh PDF terkompresi"}
        </Button>
        {saweriaReady() ? (
          <a
            className={buttonStyles({ variant: "quiet", size: "lg" })}
            href={SAWERIA.url}
            target="_blank"
            rel="noreferrer"
          >
            <Coffee className="size-4" aria-hidden="true" />
            Dukung maminnass di Saweria
          </a>
        ) : null}
        <Button variant="ghost" size="lg" onClick={onAgain}>
          Kompres PDF lain
        </Button>
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        {expired
          ? "Hasil sudah dihapus dari memori tab ini."
          : `Berkas “${filename}” hanya ada di tab ini dan dihapus otomatis dalam 60 menit.`}
      </p>

      {preview && fileUrl ? (
        <PreviewDialog url={fileUrl} onClose={() => setPreview(false)} />
      ) : null}
      {popup && saweriaReady() ? <SaweriaDialog onClose={onClosePopup} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control bg-bg px-3 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function PreviewDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="scrim fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        className="panel flex max-h-[90dvh] w-full max-w-4xl flex-col p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 id="preview-title" className="font-display text-2xl text-ink">
            Pratinjau PDF
          </h3>
          <button
            ref={closeRef}
            type="button"
            className="grid size-11 place-items-center rounded-control hover:bg-bg-deep"
            onClick={onClose}
            aria-label="Tutup pratinjau"
          >
            <X className="size-5" />
          </button>
        </div>
        <iframe title="Pratinjau PDF" src={url} className="mt-3 h-[70dvh] w-full rounded-control border border-line bg-bg" />
        <a className={`${buttonStyles({ variant: "line", size: "lg" })} mt-3`} href={url} target="_blank" rel="noreferrer">
          Buka di tab baru
        </a>
      </div>
    </div>
  );
}

function SaweriaDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="scrim fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="saweria-title" className="panel w-full max-w-md p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 id="saweria-title" className="font-display text-2xl text-ink">
            Bantu dukung CompressID
          </h3>
          <button
            ref={closeRef}
            type="button"
            className="grid size-11 place-items-center rounded-control hover:bg-bg-deep"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-muted">
          Donasi sukarela lewat Saweria. Unduhan Anda tidak ditahan dan tidak bergantung pada dukungan ini.
        </p>
        <div className="mt-4 grid gap-2">
          <a className={buttonStyles({ variant: "primary", size: "lg" })} href={SAWERIA.url} target="_blank" rel="noreferrer">
            <Coffee className="size-4" aria-hidden="true" />
            Buka Saweria
          </a>
          <Button variant="ghost" size="lg" onClick={onClose}>
            Nanti saja
          </Button>
        </div>
      </div>
    </div>
  );
}
