import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Coffee, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SAWERIA, saweriaReady } from "@/lib/compress/config";
import { buttonStyles } from "@/components/ui/button";

const LINKS = [
  { to: "/compress-pdf", label: "Kompres PDF", match: (path: string) => path === "/" || path === "/compress-pdf" },
  { to: "/faq", label: "FAQ", match: (path: string) => path === "/faq" },
  { to: "/about", label: "Tentang", match: (path: string) => path === "/about" },
] as const;

function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("compressid-theme", next ? "dark" : "light");
  } catch {
    /* preferensi tema opsional */
  }
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a
        href="#konten"
        className="absolute left-4 top-4 z-50 -translate-y-24 rounded-control bg-stamp px-3 py-2 text-stamp-ink focus:translate-y-0"
      >
        Loncat ke konten
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl text-ink" onClick={() => setOpen(false)}>
            <span className="grid size-8 place-items-center rounded-control bg-ink text-sm text-bg" aria-hidden="true">
              ID
            </span>
            CompressID
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Utama">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-control px-3 py-2 text-sm font-medium",
                  link.match(pathname) ? "bg-stamp-soft text-ink" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-control text-ink hover:bg-bg-deep"
              onClick={toggleTheme}
              aria-label="Ganti mode terang atau gelap"
            >
              <Sun className="hidden size-5 dark:block" aria-hidden="true" />
              <Moon className="size-5 dark:hidden" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-control text-ink hover:bg-bg-deep sm:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
        {open ? (
          <nav id="menu-mobile" className="border-t border-line px-4 py-3 sm:hidden" aria-label="Utama">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center rounded-control px-3 text-base font-medium",
                  link.match(pathname) ? "bg-stamp-soft text-ink" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <div id="konten">{children}</div>
      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6">
          {saweriaReady() ? (
            <a
              className={cn(buttonStyles({ variant: "quiet", size: "md" }), "w-full sm:w-auto")}
              href={SAWERIA.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Coffee className="size-4" aria-hidden="true" />
              Dukung maminnass di Saweria
            </a>
          ) : null}
          <div className="flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright © 2026 maminnass</p>
            <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Kebijakan">
              <Link to="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">
                Privasi
              </Link>
              <Link to="/terms" className="inline-flex min-h-11 items-center hover:text-ink">
                Ketentuan
              </Link>
              <Link to="/faq" className="inline-flex min-h-11 items-center hover:text-ink">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
