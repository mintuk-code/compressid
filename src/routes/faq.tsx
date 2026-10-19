import { createFileRoute } from "@tanstack/react-router";
import { DocPage } from "@/components/site/doc";

const ITEMS = [
  {
    q: "Apakah file saya diunggah?",
    a: "Tidak. PDF dibaca dan diproses di browser perangkat Anda. Tidak ada antrean server dan tidak ada salinan di basis data.",
  },
  {
    q: "Apakah perlu akun?",
    a: "Tidak. Tidak ada daftar, masuk, atau dasbor. Buka situs, pilih PDF, kompres, unduh.",
  },
  {
    q: "Kenapa ukurannya tidak turun?",
    a: "Sebagian PDF sudah optimal. CompressID membandingkan hasil dengan file asli dan tidak mengklaim berhasil bila ukuran tidak berkurang.",
  },
  {
    q: "Apakah teks tetap bisa dipilih?",
    a: "Pada Recommended, bila optimasi struktur sudah cukup, teks tetap bisa dipilih. Strong dan Maximum sering menulis ulang halaman sebagai gambar, jadi teks bisa tidak bisa dipilih lagi.",
  },
  {
    q: "Berapa batas file?",
    a: "Satu PDF, maksimal 50 MB dan 300 halaman. Pemadatan gambar dibatasi sekitar 60 halaman agar ponsel tidak kehabisan memori. Lebih dari itu, hanya struktur yang dioptimalkan.",
  },
  {
    q: "PDF berpassword?",
    a: "Belum didukung. Lepas kata sandi di perangkat Anda, lalu unggah salinan yang bisa dibuka.",
  },
  {
    q: "Apakah ada watermark?",
    a: "Tidak. Hak cipta CompressID hanya tampil di situs. PDF Anda tidak diberi logo atau teks baru.",
  },
  {
    q: "Di mana hasil disimpan?",
    a: "Di memori tab, paling lama 60 menit, atau sampai Anda mengompres file lain. Riwayat yang tersimpan hanya ukuran dan nama file di browser, dan bisa dihapus.",
  },
  {
    q: "Apakah donasi wajib?",
    a: "Tidak. Tombol Saweria ada di bawah unduh. Popup muncul paling banyak sekali per sesi dan tidak menahan file.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | CompressID" },
      { name: "description", content: "Pertanyaan umum tentang kompresi PDF di CompressID." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <DocPage title="FAQ" lede="Jawaban singkat sebelum Anda mengompres.">
      <div className="space-y-3">
        {ITEMS.map((item) => (
          <details key={item.q} className="rounded-card border border-line bg-surface px-4 py-3">
            <summary className="min-h-11 list-none py-2 font-medium text-ink">{item.q}</summary>
            <p className="pb-2 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </DocPage>
  );
}
