import { ChevronDown, FileText } from "lucide-react";
import { PROFILES } from "@/lib/compress/config";
import { formatBytes } from "@/lib/compress/format";
import type { ProfileId } from "@/lib/compress/types";
import { Button } from "@/components/ui/button";

export function FileCard({
  name,
  size,
  onReplace,
}: {
  name: string;
  size: number;
  onReplace: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-control border border-line bg-bg px-3 py-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-control bg-stamp-soft text-stamp">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{name}</p>
        <p className="text-sm tabular-nums text-muted">{formatBytes(size)}</p>
      </div>
      <Button variant="ghost" onClick={onReplace}>
        Ganti
      </Button>
    </div>
  );
}

export function SettingsPanel({
  profile,
  onProfile,
  target,
  onTarget,
  grayscale,
  onGrayscale,
  removeMetadata,
  onRemoveMetadata,
}: {
  profile: ProfileId;
  onProfile: (profile: ProfileId) => void;
  target: string;
  onTarget: (value: string) => void;
  grayscale: boolean;
  onGrayscale: (value: boolean) => void;
  removeMetadata: boolean;
  onRemoveMetadata: (value: boolean) => void;
}) {
  return (
    <div className="mt-5 space-y-5">
      <fieldset>
        <legend className="text-sm font-medium text-ink">Tingkat kompresi</legend>
        <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Tingkat kompresi">
          {PROFILES.map((item) => {
            const active = item.id === profile;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onProfile(item.id)}
                className={`rounded-control border px-4 py-3 text-left transition-colors ${
                  active ? "border-stamp bg-stamp-soft" : "border-line bg-surface hover:border-stamp"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className="text-sm text-muted">{item.tag}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{item.detail}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="target-size" className="text-sm font-medium text-ink">
          Ukuran target (opsional)
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="target-size"
            inputMode="decimal"
            value={target}
            onChange={(event) => onTarget(event.target.value)}
            placeholder="5"
            className="h-11 w-28 rounded-control border border-line bg-bg px-3 text-ink outline-none focus-visible:outline-2 focus-visible:outline-stamp"
          />
          <span className="text-sm text-muted">MB</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Usaha terbaik, bukan jaminan. Berguna untuk batas unggah portal, misalnya 5 MB.
        </p>
      </div>

      <details className="group rounded-control border border-line">
        <summary className="flex min-h-11 list-none items-center justify-between px-4 font-medium text-ink">
          Pengaturan lanjutan
          <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-3 border-t border-line px-4 py-3">
          <Switch
            id="grayscale"
            checked={grayscale}
            onChange={onGrayscale}
            label="Ubah menjadi abu-abu"
            detail="Bisa memperkecil file, tetapi warna dokumen hilang."
          />
          <Switch
            id="metadata"
            checked={removeMetadata}
            onChange={onRemoveMetadata}
            label="Hapus metadata"
            detail="Membuang judul, penulis, dan kata kunci yang tersimpan di PDF."
          />
        </div>
      </details>
    </div>
  );
}

function Switch({
  id,
  checked,
  onChange,
  label,
  detail,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="font-medium text-ink">
          {label}
        </label>
        <p className="text-sm text-muted">{detail}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-1 h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${checked ? "bg-stamp" : "bg-line"}`}
      >
        <span
          className={`block size-5 rounded-full bg-surface transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
