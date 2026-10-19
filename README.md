# CompressID

Alat web untuk memperkecil satu file PDF. Bahasa antarmuka: Indonesia. Tanpa akun.

Versi ini mengikuti PRD CompressID V1, dengan satu penyesuaian wajib: **seluruh proses berjalan di browser**. Tidak ada backend, antrean, atau basis data. Server hanya menyajikan berkas statis. Riwayat ukuran disimpan di `localStorage` perangkat pengguna, bukan di server. Hasil kompresi hanya hidup di memori tab dan dihapus dalam 60 menit.

## Fitur

- Seret-letakkan atau pilih satu PDF (maksimum 50 MB, 300 halaman)
- Tiga profil: Recommended, Strong, Maximum
- Ukuran target opsional (usaha terbaik, misalnya 5 MB)
- Abu-abu dan hapus metadata
- Proses di Web Worker agar halaman tidak macet
- Ukuran awal, ukuran akhir, selisih, dan persen pengurangan
- Pratinjau halaman pertama dan penampil PDF
- Unduh `nama-compressed.pdf`
- Tombol Saweria di bawah unduh, plus popup sekali per sesi yang tidak menahan file
- Mode gelap
- Riwayat lokal yang bisa dihapus
- Halaman FAQ, privasi, ketentuan, dan tentang
- Siap dipasang sebagai PWA lewat manifest aplikasi

## Menjalankan

```bash
npm install
npm run dev
```

Buka situs yang ditampilkan terminal. Untuk build produksi:

```bash
npm run build
```

## Di mana URL Saweria diubah

Satu tempat: `src/lib/compress/config.ts` (`SAWERIA.url`). Kosongkan URL untuk menyembunyikan tombol donasi.

## Privasi yang perlu diketahui

File PDF tidak diunggah. Jangan mengandalkan klaim “100% aman”: dokumen tetap ada di perangkat yang dipakai untuk membuka situs.

## Mesin kompresi

- **Struktur** (`pdf-lib`): menulis ulang objek PDF. Teks biasanya tetap bisa dipilih.
- **Gambar** (`pdf.js` + `pdf-lib`): menurunkan ketajaman gambar bila itu membuat file lebih kecil. Teks bisa tidak bisa dipilih. Dibatasi sekitar 60 halaman agar memori perangkat tetap aman.

Bila hasil tidak lebih kecil dari asli, aplikasi tidak mengklaim kompresi berhasil.

## Berkas PWA

- `public/manifest.json`
- `public/service-worker.js` — network-only dan **tidak** menyimpan byte PDF. Pemasangan ke layar utama memakai manifest yang disajikan bersama aplikasi.

## Lisensi tampilan

Copyright © 2026 maminnass. Hak atas PDF pengguna tetap pada pemilik dokumen.
