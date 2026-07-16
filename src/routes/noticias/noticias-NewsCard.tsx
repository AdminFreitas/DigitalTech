import { Link } from "@tanstack/react-router";
import type { Noticia } from "./dados";

// Cores rotacionam entre as 3 cores da marca — evita manter um mapa manual
// por categoria toda vez que uma categoria nova for adicionada em dados.ts.
const ACCENTS = ["var(--primary-cyan)", "var(--secondary-jade)", "var(--accent-amber)"];
function corCategoria(categoria: string) {
  let hash = 0;
  for (let i = 0; i < categoria.length; i++) hash = (hash * 31 + categoria.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export function NewsCardGrande({ n }: { n: Noticia }) {
  const cor = corCategoria(n.categoria);
  return (
    <Link
      to="/noticias/$slug"
      params={{ slug: n.slug }}
      className="group block rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-card)] hover:border-[color:var(--primary-cyan)]/30 transition-all"
    >
      <div className="h-48 w-full overflow-hidden bg-[var(--bg-secondary)]">
        <img
          src={n.coverImage}
          alt={n.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 15%, transparent)` }}
          >
            {n.categoriaLabel}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{n.fonte}</span>
        </div>
        <h2 className="font-display font-bold text-[var(--text-primary)] text-[17px] leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors line-clamp-2">
          {n.titulo}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">{n.resumo}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={n.dataISO}>{n.data}</time>
          <span>·</span>
          <span>{n.tempoLeitura} min de leitura</span>
        </div>
      </div>
    </Link>
  );
}

export function NewsCardPequeno({ n }: { n: Noticia }) {
  const cor = corCategoria(n.categoria);
  return (
    <Link
      to="/noticias/$slug"
      params={{ slug: n.slug }}
      className="group flex gap-3 p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] hover:border-[color:var(--primary-cyan)]/30 transition-all"
    >
      <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
        <img
          src={n.coverImage}
          alt={n.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="min-w-0">
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 15%, transparent)` }}
        >
          {n.categoriaLabel}
        </span>
        <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[color:var(--primary-cyan)] transition-colors line-clamp-2 leading-snug">
          {n.titulo}
        </h3>
        <time dateTime={n.dataISO} className="text-xs text-[var(--text-muted)] mt-1 block">
          {n.data}
        </time>
      </div>
    </Link>
  );
}
