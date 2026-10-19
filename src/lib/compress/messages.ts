export const ERROR_TEXT: Record<string, string> = {
  INVALID_TYPE: "File tidak didukung. Unggah PDF.",
  FILE_TOO_LARGE: "File terlalu besar. Maksimum 50 MB.",
  INVALID_PDF: "PDF tidak valid atau rusak. Buka atau perbaiki PDF, lalu unggah ulang.",
  PASSWORD_PROTECTED: "PDF memakai kata sandi dan belum dapat diproses.",
  PROCESSING_TIMEOUT: "Proses terlalu lama. Coba PDF yang lebih kecil.",
  COMPRESSION_FAILED: "PDF tidak dapat dikompres. Coba profil lain atau unggah ulang.",
  DOWNLOAD_EXPIRED: "File hasil sudah kedaluwarsa. Jalankan kompresi lagi.",
  RATE_LIMITED: "Terlalu banyak permintaan di perangkat ini. Coba lagi beberapa saat kemudian.",
  PAGE_LIMIT: "PDF terlalu panjang untuk diproses di browser. Maksimum 300 halaman.",
};

export function errorText(code: string | undefined): string {
  if (code && ERROR_TEXT[code]) return ERROR_TEXT[code];
  return ERROR_TEXT.COMPRESSION_FAILED;
}
