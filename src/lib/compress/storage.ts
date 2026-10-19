import { LIMITS } from "@/lib/compress/config";
import { safeDisplayName } from "@/lib/compress/format";
import { ERROR_TEXT } from "@/lib/compress/messages";
import type { HistoryEntry } from "@/lib/compress/types";

const HISTORY_KEY = "compressid-history";
const RATE_KEY = "compressid-rate";
const STATS_KEY = "compressid-stats";
export const SAWERIA_POPUP_KEY = "compressid-saweria-popup";

export type LocalStats = {
  reduced: number;
  downloaded: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kuota penyimpanan perangkat penuh — riwayat bukan syarat kompresi */
  }
}

export function readHistory(): HistoryEntry[] {
  const now = Date.now();
  return readJson<HistoryEntry[]>(HISTORY_KEY, []).flatMap((item) => {
    if (!item || typeof item.at !== "number" || now - item.at >= LIMITS.historyTtlMs) return [];
    if (typeof item.name !== "string") return [];
    return [{ ...item, name: safeDisplayName(item.name) }];
  });
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...readHistory()].slice(0, LIMITS.historyMax);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function reserveRateSlot(): string | null {
  const now = Date.now();
  const recent = readJson<number[]>(RATE_KEY, []).filter((stamp) => now - stamp < LIMITS.rateWindowMs);
  if (recent.length >= LIMITS.rateLimit) return ERROR_TEXT.RATE_LIMITED;
  recent.push(now);
  writeJson(RATE_KEY, recent.slice(-LIMITS.rateLimit));
  return null;
}

export function readStats(): LocalStats {
  const stats = readJson<Partial<LocalStats>>(STATS_KEY, {});
  return {
    reduced: typeof stats.reduced === "number" ? stats.reduced : 0,
    downloaded: typeof stats.downloaded === "number" ? stats.downloaded : 0,
  };
}

export function bumpStats(kind: keyof LocalStats) {
  const stats = readStats();
  stats[kind] += 1;
  writeJson(STATS_KEY, stats);
}
