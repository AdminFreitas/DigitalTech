import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { pesquisar } from "@/lib/pesquisa";
import { searchSuggestions } from "@/data/searchSuggestions";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CORES_TIPO: Record<string, string> = {
  Artigo: "text-[color:var(--primary-cyan)] bg-[color:var(--primary-cyan)]/10",
  Notícia: "text-[color:var(--secondary-jade)] bg-[color:var(--secondary-jade)]/10",
  Ferramenta: "text-[color:var(--accent-amber)] bg-[color:var(--accent-amber)]/10",
};

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => pesquisar(query), [query]);

  if (!open) return null;

  const irPara = (url: string) => {
    setQuery("");
    onClose();
    navigate({ to: url });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mt-24 w-full max-w-2xl rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-5">
          <h2 className="text-xl font-semibold">🔍 Pesquisar no DigitalTech</h2>
          <button onClick={onClose} aria-label="Fechar busca">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 opacity-60" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você procura?"
              className="w-full rounded-xl border border-[var(--glass-border)] bg-transparent py-3 pl-12 pr-4 outline-none"
            />
          </div>

          {!query && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">Pesquisas populares</h3>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.slice(0, 8).map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-sm hover:border-cyan-400"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && (
            <div className="mt-6">
              {results.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Nenhum resultado para "{query}".
                </p>
              ) : (
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li key={r.url}>
                      <button
                        onClick={() => irPara(r.url)}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-white/5"
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CORES_TIPO[r.tipo]}`}
                        >
                          {r.tipo}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                            {r.titulo}
                          </span>
                          <span className="block truncate text-xs text-[var(--text-secondary)]">
                            {r.resumo}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
