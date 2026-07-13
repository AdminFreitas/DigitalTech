import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      ref.current.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/noticias", label: "Notícias" },
    { href: "/artigos", label: "Artigos" },
    { href: "/ferramentas", label: "Ferramentas" },
    { href: "/#categorias", label: "Categorias" },
    { href: "/#faq", label: "FAQ" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500 data-[scrolled=true]:bg-[rgba(11,16,32,0.78)] data-[scrolled=true]:backdrop-blur-xl data-[scrolled=true]:border-b data-[scrolled=true]:border-[var(--glass-border)]"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            digitaltech<span className="text-[#00D4FF]">.</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[13px] text-[var(--text-secondary)]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="transition-colors duration-300 hover:text-[var(--text-primary)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Pesquisar"
          title="Pesquisar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] transition-all duration-300 hover:border-[color:var(--primary-cyan)] hover:text-[var(--text-primary)]"
        >
          <Search className="h-5 w-5" />
        </button>
        </div>

        <button
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border)] text-[var(--text-secondary)]"
        >
          <span className="sr-only">Menu</span>

          <div className="space-y-1">
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--glass-border)] bg-[rgba(11,16,32,0.95)] backdrop-blur-xl">
          <ul className="mx-auto max-w-6xl px-6 py-4 space-y-3 text-[15px]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  );
}

