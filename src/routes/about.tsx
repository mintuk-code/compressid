import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DocPage, DocSection } from "@/components/site/doc";
import { readStats, type LocalStats } from "@/lib/compress/storage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang | CompressID" },
      { name: "description", content: "CompressID, alat kompres PDF yang berjalan di browser." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [stats, setStats] = useState<LocalStats>({ reduced: 0, downloaded: 0 });
  useEffect(() => {
    setStats(readStats());
  }, []);

  return (
    <DocPage
      title="Tentang CompressID"
      lede="Alat satu tugas: memperkecil PDF, langsung, tanpa akun."
    >
      <DocSection title="Janji produk">
        <p>Compress PDF online dengan cepat dan sederhana — tanpa login. File tidak meninggalkan perangkat Anda.</p>
      </DocSection>
      <DocSection title="Bagaimana kompresinya bekerja">
        <p>
          Rancangan awal memakai antrean server. Versi ini memindahkan seluruh proses ke browser agar bisa dijalankan sebagai situs statis. Web Worker menjaga halaman tetap responsif. pdf-lib merapikan struktur PDF. Bila itu belum cukup, pdf.js menggambar ulang halaman pada ketajaman yang lebih rendah lalu menyusun PDF baru.
        </p>
        <p>Hasil selalu dibandingkan dengan file asli. Bila tidak lebih kecil, CompressID mengatakannya.</p>
      </DocSection>
      <DocSection title="Di perangkat ini">
        <p>
          {stats.reduced} PDF berhasil dikecilkan. {stats.downloaded} kali unduh. Angka ini hanya hidup di browser Anda.
        </p>
      </DocSection>
      <DocSection title="Kredit">
        <p>Copyright © 2026 maminnass. Dukungan sukarela lewat Saweria, setelah hasil siap diunduh.</p>
      </DocSection>
    </DocPage>
  );
}
