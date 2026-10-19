import type { ReactNode } from "react";
import { Shell } from "@/components/site/shell";

export function DocPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        <p className="mt-3 text-lg text-muted">{lede}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </main>
    </Shell>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-muted">{children}</div>
    </section>
  );
}
