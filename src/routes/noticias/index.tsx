import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { NewsCardPequeno } from "@/components/noticias/NewsCard";
import { NOTICIAS, CATEGORIAS } from "@/components/noticias/dados";

export const Route = createFileRoute("/noticias/")({
  head: () => ({
    meta: [
      { title: "Notícias — DIGITALTECH" },
      {
        name: "description",
        content: "Cobertura de tecnologia, IA, engenharia e segurança, com fonte sempre indicada.",
      },
    ],
  }),
  component: NoticiasPage,
});

function NoticiasPage() {
  const [cat, setCat] = useState("todas");

  const destaquePrincipal = NOTICIAS.find((n) => n.destaque) ?? NOTICIAS[0];
  const destaquesSecundarios = NOTICIAS.filter((n) => n.slug !== destaquePrincipal?.slug).slice(0, 3);

  const outras = NOTICIAS.filter(
    (n) => n.slug !== destaquePrincipal?.slug && (cat === "todas" || n.categoria === cat)
  ).sort((a, b) => b.dataISO.localeCompare(a.dataISO));

  if (!destaquePrincipal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        Nenhuma notícia cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* HERO: 1 card grande + 3 menores (2 no mobile, o 3º só aparece em telas maiores) */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-[var(--header-clearance)] pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link
            to="/noticias/$slug"
            params={{ slug: destaquePrincipal.slug }}
            className="group relative lg:col-span-2 rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-card)] block min-h-[300px] lg:min-h-[440px]"
          >
            <img
              src={destaquePrincipal.coverImage}
              alt={destaquePrincipal.titulo}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-[color:var(--primary-cyan)] bg-[color:var(--primary-cyan)]/10 border border-[color:var(--primary-cyan)]/30">
                {destaquePrincipal.categoriaLabel}
              </span>
              <h1 className="font-display text-white font-bold text-xl md:text-3xl leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors">
                {destaquePrincipal.titulo}
              </h1>
              <p className="mt-2 text-[var(--text-secondary)] text-sm md:text-base line-clamp-2 max-w-2xl">
                {destaquePrincipal.resumo}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{destaquePrincipal.fonte}</span>
                <span>·</span>
                <time dateTime={destaquePrincipal.dataISO}>{destaquePrincipal.data}</time>
                <span>·</span>
                <span>{destaquePrincipal.tempoLeitura} min</span>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
            {destaquesSecundarios.map((n, i) => (
              <Link
                key={n.slug}
                to="/noticias/$slug"
                params={{ slug: n.slug }}
                className={`group relative rounded-xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-card)] block min-h-[140px] lg:min-h-0 lg:flex-1 ${
                  i === 2 ? "hidden lg:block" : ""
                }`}
              >
                <img
                  src={n.coverImage}
                  alt={n.titulo}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="inline-block mb-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-[color:var(--secondary-jade)] bg-[color:var(--secondary-jade)]/10">
                    {n.categoriaLabel}
                  </span>
                  <h3 className="text-white font-semibold text-xs md:text-sm leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors line-clamp-2">
                    {n.titulo}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ÚLTIMAS NOTÍCIAS */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">Mais notícias</h2>
          <span className="text-xs text-[var(--text-muted)]">{outras.length} notícias</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCat("todas")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              cat === "todas"
                ? "bg-[color:var(--primary-cyan)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[color:var(--primary-cyan)]/40 hover:text-white"
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.filter((c) => c.slug !== "todas").map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cat === c.slug
                  ? "bg-[color:var(--primary-cyan)] text-[var(--bg-primary)]"
                  : "bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[color:var(--primary-cyan)]/40 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {outras.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm py-16 text-center">Nenhuma notícia nesta categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {outras.map((n) => (
              <NewsCardPequeno key={n.slug} n={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
