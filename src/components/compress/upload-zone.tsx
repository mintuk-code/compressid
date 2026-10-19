import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIMITS } from "@/lib/compress/config";
import { formatBytes } from "@/lib/compress/format";

export function UploadZone({ onFile }: { onFile: (file: File, count: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hot, setHot] = useState(false);

  function take(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    onFile(file, list?.length ?? 1);
  }

  return (
    <div
      className={`rounded-card border border-dashed px-4 py-10 text-center transition-colors sm:px-8 ${
        hot ? "border-stamp bg-stamp-soft" : "border-line bg-bg"
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setHot(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setHot(true);
      }}
      onDragLeave={() => setHot(false)}
      onDrop={(event) => {
        event.preventDefault();
        setHot(false);
        take(event.dataTransfer.files);
      }}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-control bg-stamp-soft text-stamp">
        <FileUp className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-2xl text-ink">Letakkan PDF di sini</p>
      <p className="mt-2 text-muted">atau pilih dari perangkat Anda</p>
      <div className="mt-5">
        <Button onClick={() => inputRef.current?.click()}>Pilih PDF</Button>
      </div>
      <p className="mt-4 text-sm text-muted">
        PDF saja · 1 file · maksimal {formatBytes(LIMITS.maxBytes)}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        tabIndex={-1}
        className="sr-only"
        aria-label="Pilih file PDF"
        onChange={(event) => {
          take(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
