import { createFileRoute } from "@tanstack/react-router";
import { DocPage, DocSection } from "@/components/site/doc";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Ketentuan | CompressID" },
      { name: "description", content: "Ketentuan pemakaian CompressID." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <DocPage title="Ketentuan" lede="Pakai alat ini untuk dokumen yang memang berhak Anda proses.">
      <DocSection title="Pemakaian yang wajar">
        <p>Jangan memakai CompressID untuk dokumen yang melanggar hukum, untuk membuka kunci PDF berpassword, atau untuk menyembunyikan malware. Alat ini hanya memperkecil PDF.</p>
      </DocSection>
      <DocSection title="Tidak ada jaminan ukuran">
        <p>Tidak semua PDF bisa menjadi lebih kecil. Target ukuran adalah usaha terbaik. Periksa pratinjau sebelum Anda mengirim hasilnya ke portal lamaran, kampus, atau klien.</p>
      </DocSection>
      <DocSection title="Kepemilikan dokumen">
        <p>Hak atas isi PDF tetap pada pemiliknya. CompressID tidak menambahkan watermark dan tidak mengklaim lisensi atas dokumen Anda.</p>
      </DocSection>
      <DocSection title="Layanan">
        <p>Alat ini disediakan apa adanya, tanpa akun dan tanpa biaya. Donasi Saweria bersifat sukarela dan bukan syarat unduh. Batas tanggung jawab mengikuti hukum yang berlaku dan perlu ditinjau secara hukum sebelum pemakaian komersial yang luas.</p>
      </DocSection>
    </DocPage>
  );
}
