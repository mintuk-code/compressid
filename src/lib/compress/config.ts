import type { ProfileId } from "@/lib/compress/types";

export const LIMITS = {
  maxBytes: 50 * 1024 * 1024,
  maxPages: 300,
  rasterMaxPages: 60,
  timeoutMs: 120_000,
  fileTtlMs: 60 * 60 * 1000,
  rateLimit: 12,
  rateWindowMs: 60 * 60 * 1000,
  historyMax: 20,
  historyTtlMs: 30 * 24 * 60 * 60 * 1000,
};

/** Satu-satunya tempat URL donasi diubah. Kosongkan `url` untuk menyembunyikan CTA. */
export const SAWERIA = {
  enabled: true,
  url: "https://saweria.co/maminnass",
  popupEnabled: true,
};

export const PROFILES: {
  id: ProfileId;
  label: string;
  tag: string;
  detail: string;
}[] = [
  {
    id: "recommended",
    label: "Recommended",
    tag: "Keseimbangan terbaik",
    detail: "Menjaga keterbacaan. Teks tetap bisa dipilih bila ukuran sudah turun cukup.",
  },
  {
    id: "strong",
    label: "Strong",
    tag: "File lebih kecil",
    detail: "Menurunkan ketajaman gambar. Cocok untuk lampiran yang kena batas ukuran.",
  },
  {
    id: "maximum",
    label: "Maximum",
    tag: "File paling kecil",
    detail: "Pengurangan paling agresif. Periksa pratinjau sebelum mengirim.",
  },
];

export function saweriaReady(): boolean {
  return SAWERIA.enabled && SAWERIA.url.trim().length > 0;
}
