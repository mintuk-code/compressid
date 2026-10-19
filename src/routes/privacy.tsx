import { createFileRoute } from "@tanstack/react-router";
import { DocPage, DocSection } from "@/components/site/doc";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privasi | CompressID" },
      { name: "description", content: "Bagaimana CompressID memperlakukan file PDF Anda." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <DocPage
      title="Privasi"
      lede="CompressID memproses PDF di perangkat Anda. Penjelasan ini menggantikan model unggah-server pada rancangan awal."
    >
      <DocSection title="Untuk apa file diproses">
        <p>PDF hanya dipakai untuk membuat salinan yang lebih kecil, di tab browser yang sedang Anda buka.</p>
      </DocSection>
      <DocSection title="Yang tidak kami terima">
        <p>Isi dokumen, teks yang diekstrak, dan file itu sendiri tidak dikirim ke server CompressID. Tidak ada akun, jadi tidak ada profil pengguna.</p>
      </DocSection>
      <DocSection title="Yang tersimpan di perangkat">
        <p>Preferensi tema, riwayat ukuran (nama file, ukuran awal, ukuran akhir, profil, jumlah halaman), penghitung lokal, dan batas laju sederhana. Semua ada di localStorage browser Anda dan bisa dihapus dari bagian riwayat atau lewat pengaturan situs browser.</p>
        <p>Hasil kompresi berupa tautan memori tab. Tautan dicabut saat Anda mengompres file lain, meninggalkan halaman, atau setelah 60 menit.</p>
      </DocSection>
      <DocSection title="Pihak lain">
        <p>Huruf dimuat dari Google Fonts. Jika Anda menekan tombol Saweria, browser membuka situs Saweria di tab baru — itu di luar CompressID.</p>
      </DocSection>
      <DocSection title="Keamanan">
        <p>Kami tidak menyebut proses ini “100% aman”. File tetap ada di perangkat Anda seperti file lain yang Anda buka. Jangan mengompres dokumen di komputer yang tidak Anda percayai.</p>
      </DocSection>
    </DocPage>
  );
}
