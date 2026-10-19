import type { CompressMethod, Tone } from "@/lib/compress/types";

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const digits = index === 0 ? 0 : value >= 10 ? 1 : 2;
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
  return `${formatted} ${units[index]}`;
}

export function formatPercent(value: number): string {
  return `${numberFormat.format(value)}%`;
}

export function formatDuration(ms: number): string {
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${numberFormat.format(seconds)} dtk`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} mnt ${rest} dtk`;
}

export function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function safeDisplayName(original: string): string {
  const base = (original.split(/[/\\]/).pop() ?? "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/[<>:"'|?*]/g, "").trim();
  return (base || "dokumen.pdf").slice(0, 80);
}

export function outputName(original: string): string {
  const base = safeDisplayName(original).replace(/\.pdf$/i, "").replace(/^\.+/g, "").trim();
  return `${(base || "dokumen").slice(0, 60)}-compressed.pdf`;
}

export function parseTargetMb(raw: string): { ok: true; bytes: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, bytes: null };
  const value = Number(trimmed.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0 || value > 50) return { ok: false };
  return { ok: true, bytes: Math.round(value * 1024 * 1024) };
}

export function summarize(inputBytes: number, outputBytes: number): {
  delta: number;
  reduction: number;
  tone: Tone;
} {
  const delta = inputBytes - outputBytes;
  const reduction = inputBytes > 0 ? (delta / inputBytes) * 100 : 0;
  const tone: Tone =
    delta > inputBytes * 0.03 ? "reduced" : delta > 0 ? "minimal" : delta < 0 ? "grew" : "optimal";
  return { delta, reduction, tone };
}

export function resultHeadline(tone: Tone): string {
  if (tone === "reduced") return "Kompresi selesai";
  if (tone === "minimal") return "Hanya berkurang sedikit";
  if (tone === "grew") return "Hasil lebih besar dari file asli";
  return "PDF sudah cukup optimal";
}

export function resultNote(tone: Tone, method: CompressMethod): string {
  if (tone === "grew") {
    return "Perubahan ini tidak memperkecil file. Anda tetap bisa mengunduh hasilnya, atau mencoba profil lain.";
  }
  if (tone === "optimal") {
    return "PDF ini sudah cukup optimal, sehingga ukurannya hampir tidak bisa dikurangi.";
  }
  if (tone === "minimal") {
    return "PDF tidak banyak dapat dikurangi. Hasil terbaik tetap bisa diunduh.";
  }
  if (method === "raster") {
    return "Gambar di dalam PDF diturunkan ketajamannya agar ukuran berkurang. Periksa pratinjau sebelum mengirim.";
  }
  return "Struktur PDF dirapikan tanpa mengubah isi halaman. Teks tetap bisa dipilih.";
}

export function methodLabel(method: CompressMethod, textPreserved: boolean): string {
  if (method === "raster" || !textPreserved) return "Halaman dioptimalkan sebagai gambar";
  if (method === "structure") return "Struktur dioptimalkan, teks tetap bisa dipilih";
  return "File asli dipertahankan";
}
