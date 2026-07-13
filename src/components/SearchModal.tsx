import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchSuggestions } from "@/data/searchSuggestions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    return searchSuggestions.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
    className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 p-6 backdrop-blur-sm"
    onClick={(e) => {
        if (e.target === e.currentTarget) {
        onClose();
        }
    }}
    >
      <div
        ref={modalRef}
        className="mt-24 w-full max-w-2xl rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-2xl">

        <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-5">
          <h2 className="text-xl font-semibold">
            🔍 Pesquisar no DigitalTech
          </h2>

          <button onClick={onClose}>
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
              <h3 className="mb-3 text-sm font-semibold">
                Pesquisas populares
              </h3>

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
                <p>Nenhum resultado.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((item) => (
                    <li key={item}>
                      <button
                        className="w-full rounded-lg p-3 text-left transition hover:bg-white/5"
                      >
                        {item}
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
