import { createFileRoute } from "@tanstack/react-router";
import { Compressor } from "@/components/compress/compressor";
import { Shell } from "@/components/site/shell";

export const Route = createFileRoute("/compress-pdf")({
  head: () => ({
    meta: [
      { title: "Kompres PDF | CompressID" },
      {
        name: "description",
        content: "Unggah satu PDF, pilih tingkat kompresi, pratinjau hasil, lalu unduh. Tanpa login.",
      },
    ],
  }),
  component: CompressPage,
});

function CompressPage() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl text-ink">Kompres PDF</h1>
        <p className="mt-3 text-lg text-muted">Satu file, tiga tingkat, pratinjau sebelum unduh.</p>
        <div className="mt-8">
          <Compressor />
        </div>
      </main>
    </Shell>
  );
}
