import { LIMITS } from "@/lib/compress/config";
import { ERROR_TEXT } from "@/lib/compress/messages";

export function validateFileMeta(file: File): string | null {
  if (file.size <= 0) return ERROR_TEXT.INVALID_PDF;
  if (file.size > LIMITS.maxBytes) return ERROR_TEXT.FILE_TOO_LARGE;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const pdfName = name.endsWith(".pdf");
  const pdfType = type === "application/pdf" || type === "application/x-pdf" || type === "";
  if (!pdfName && type && !pdfType) return ERROR_TEXT.INVALID_TYPE;
  if (!pdfName && !pdfType) return ERROR_TEXT.INVALID_TYPE;
  return null;
}

export async function hasPdfMagic(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return (
    head.length >= 5 &&
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46 &&
    head[4] === 0x2d
  );
}
