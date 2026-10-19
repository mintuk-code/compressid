import { createFileRoute } from "@tanstack/react-router";
import { Compressor } from "@/components/compress/compressor";
import { HomeExtra } from "@/components/site/home-extra";
import { Shell } from "@/components/site/shell";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CompressID",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
  description: "Kompres PDF secara online di browser, tanpa login dan tanpa mengunggah file.",
  inLanguage: "id",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compress PDF Online Gratis | CompressID" },
      {
        name: "description",
        content:
          "Kompres PDF secara online untuk mengurangi ukuran file dengan cepat. Pilih tingkat kompresi, proses PDF di browser, lalu unduh hasilnya.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Shell>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6">
          <p className="text-sm font-medium tracking-wide text-stamp">Gratis · Tanpa login · Tanpa unggah</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">Compress PDF Online</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Perkecil PDF dalam hitungan detik. File diproses di browser Anda dan tidak dikirim ke server.
          </p>
        </section>
        <div id="alat" className="mx-auto mt-8 w-full max-w-3xl px-4 sm:px-6">
          <Compressor />
        </div>
        <HomeExtra />
      </main>
    </Shell>
  );
}
