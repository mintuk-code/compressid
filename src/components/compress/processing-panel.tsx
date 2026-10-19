export function ProcessingPanel({ fraction, label }: { fraction: number; label: string }) {
  const percent = Math.round(fraction * 100);
  const known = fraction > 0.02;
  return (
    <div className="py-6">
      <p className="font-display text-2xl text-ink">Sedang mengompres</p>
      <p className="mt-2 text-muted" aria-live="polite">
        {label || "Menyiapkan…"}
      </p>
      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-bg-deep"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={known ? percent : undefined}
        aria-label="Progres kompresi"
      >
        {known ? (
          <div className="h-full rounded-full bg-stamp" style={{ width: `${percent}%` }} />
        ) : (
          <div className="compress-indeterminate h-full w-1/3 rounded-full bg-stamp" />
        )}
      </div>
      <p className="mt-4 text-sm text-muted">Jangan tutup tab ini. Proses berjalan di perangkat Anda, bukan di server.</p>
    </div>
  );
}
