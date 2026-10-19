const STEPS = [
  { title: "Unggah", body: "Pilih atau jatuhkan satu file PDF. File tidak dikirim ke server." },
  { title: "Kompres", body: "Pilih Recommended, Strong, atau Maximum. Proses berjalan di latar belakang." },
  { title: "Unduh", body: "Periksa pratinjau, lalu simpan PDF baru. Donasi Saweria tidak menghalangi unduhan." },
];

export function HomeExtra() {
  return (
    <div className="mx-auto mt-14 w-full max-w-3xl space-y-12 px-4 sm:px-6">
      <section>
        <h2 className="font-display text-3xl text-ink">Cara kerjanya</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-card border border-line bg-surface p-4">
              <p className="text-sm font-medium text-stamp">0{index + 1}</p>
              <h3 className="mt-2 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3 text-muted">
        <h2 className="font-display text-3xl text-ink">Apa itu kompresi PDF?</h2>
        <p>
          Kompresi PDF membuat salinan yang lebih ringan dengan merapikan struktur file atau menurunkan ketajaman gambar di dalamnya. Teks, untuk profil yang menjaga struktur, tetap bisa dipilih.
        </p>
      </section>

      <section className="space-y-3 text-muted">
        <h2 className="font-display text-3xl text-ink">Kenapa sebuah PDF tetap besar?</h2>
        <p>
          Foto beresolusi tinggi, hasil pindai, dan font yang tertanam utuh sering jadi penyebabnya. PDF yang sudah dioptimalkan sebelumnya memang tidak banyak bisa dikurangi — CompressID akan mengatakannya, bukan memaksakan angka.
        </p>
      </section>

      <section className="space-y-3 text-muted">
        <h2 className="font-display text-3xl text-ink">Kualitas dan ukuran</h2>
        <p>
          Recommended menjaga keseimbangan. Strong dan Maximum menulis ulang halaman sebagai gambar bila itu membuat file lebih kecil, jadi teks mungkin tidak lagi bisa dipilih. Selalu lihat pratinjau sebelum mengirim lamaran atau laporan.
        </p>
      </section>

      <section className="space-y-3 text-muted">
        <h2 className="font-display text-3xl text-ink">Mengecilkan PDF ke 5 MB</h2>
        <p>
          Isi ukuran target 5, lalu mulai dari Recommended. Jika target belum tercapai, coba Strong atau Maximum. Target adalah usaha terbaik: sebagian dokumen tidak bisa mencapai batas itu tanpa rusak tampilannya.
        </p>
      </section>
    </div>
  );
}
