import { LIMITS } from "@/lib/compress/config";
import { ERROR_TEXT } from "@/lib/compress/messages";

const BLOCKED_TYPES = new Set([
  "text/html",
  "application/xhtml+xml",
  "image/svg+xml",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "application/x-msdownload",
  "application/x-executable",
  "application/x-dosexec",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-shockwave-flash",
]);

const DANGEROUS_EXT = /\.(exe|js|mjs|html?|svg|hta|bat|cmd|scr|com|msi|dll|ps1|vbs|jar|apk|sh)(?=\.|$)/i;

const ACTIVE_TOKENS = [
  "/JavaScript",
  "/JS",
  "/Launch",
  "/SubmitForm",
  "/ImportData",
  "/EmbeddedFile",
  "/RichMedia",
  "/GoToR",
  "/GoToE",
  "/XFA",
].map((token) => Uint8Array.from(token, (char) => char.charCodeAt(0)));

const HTML_TOKENS = ["<script", "<iframe", "<svg", "<html", "<?php"].map((token) =>
  Uint8Array.from(token, (char) => char.charCodeAt(0)),
);

function isPdfDelim(byte: number | undefined): boolean {
  if (byte === undefined) return true;
  return (
    byte === 0 ||
    byte === 9 ||
    byte === 10 ||
    byte === 12 ||
    byte === 13 ||
    byte === 32 ||
    byte === 37 ||
    byte === 40 ||
    byte === 41 ||
    byte === 47 ||
    byte === 60 ||
    byte === 62 ||
    byte === 91 ||
    byte === 93 ||
    byte === 123 ||
    byte === 125
  );
}

function sameAscii(found: number, expected: number, ignoreCase: boolean): boolean {
  if (found === expected) return true;
  if (!ignoreCase || expected < 97 || expected > 122) return false;
  return found === expected - 32;
}

function hasToken(bytes: Uint8Array, token: Uint8Array, delimited: boolean, ignoreCase: boolean): boolean {
  const last = bytes.length - token.length;
  for (let index = 0; index <= last; index += 1) {
    if (delimited && !isPdfDelim(index === 0 ? undefined : bytes[index - 1])) continue;
    let matched = true;
    for (let offset = 0; offset < token.length; offset += 1) {
      if (!sameAscii(bytes[index + offset] ?? 0, token[offset] ?? 0, ignoreCase)) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;
    if (!delimited || isPdfDelim(bytes[index + token.length])) return true;
  }
  return false;
}

function isSafePrefix(bytes: Uint8Array, headerAt: number): boolean {
  let index = 0;
  if (
    headerAt >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    index = 3;
  }
  for (; index < headerAt; index += 1) {
    const byte = bytes[index];
    if (byte !== 9 && byte !== 10 && byte !== 12 && byte !== 13 && byte !== 32) return false;
  }
  return true;
}

/** Offset of %PDF-, or -1. A short BOM or whitespace before the header is allowed. */
export function pdfStart(bytes: Uint8Array): number {
  const limit = Math.min(bytes.length, 1024) - 5;
  for (let index = 0; index <= limit; index += 1) {
    if (
      bytes[index] === 0x25 &&
      bytes[index + 1] === 0x50 &&
      bytes[index + 2] === 0x44 &&
      bytes[index + 3] === 0x46 &&
      bytes[index + 4] === 0x2d &&
      isSafePrefix(bytes, index)
    ) {
      return index;
    }
  }
  return -1;
}

export function hasPdfHeader(bytes: Uint8Array): boolean {
  return pdfStart(bytes) >= 0;
}

/** PDF dengan skrip, lampiran, atau HTML terselubung. Bukan pemindai virus. */
export function hasActivePdfContent(bytes: Uint8Array): boolean {
  for (const token of ACTIVE_TOKENS) {
    if (hasToken(bytes, token, true, false)) return true;
  }
  for (const token of HTML_TOKENS) {
    if (hasToken(bytes, token, false, true)) return true;
  }
  return false;
}

export function validateFileMeta(file: File): string | null {
  if (file.size <= 0) return ERROR_TEXT.INVALID_PDF;
  if (file.size > LIMITS.maxBytes) return ERROR_TEXT.FILE_TOO_LARGE;
  const name = file.name.toLowerCase().replace(/^.*[/\\]/, "");
  if (!name.endsWith(".pdf") || name.endsWith(".pdf.") || DANGEROUS_EXT.test(name)) {
    return ERROR_TEXT.INVALID_TYPE;
  }
  const type = file.type.toLowerCase();
  if (BLOCKED_TYPES.has(type)) return ERROR_TEXT.INVALID_TYPE;
  if (type && type !== "application/pdf" && type !== "application/x-pdf" && type !== "application/octet-stream") {
    return ERROR_TEXT.INVALID_TYPE;
  }
  return null;
}

export async function inspectPdf(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfHeader(bytes)) return ERROR_TEXT.INVALID_PDF;
  if (hasActivePdfContent(bytes)) return ERROR_TEXT.UNSAFE_PDF;
  return null;
}
