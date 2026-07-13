import { createFileRoute, Link } from "@tanstack/react-router";
import { formatarData, listarArtigos } from "@/lib/content";

export const Route = createFileRoute("/artigos/")({
  head: () => ({
    meta: [
      { title: "Artigos — DIGITALTECH" },
      {
        name: "description",
        content:
          "Todos os artigos do DIGITALTECH sobre IA, programação, banco de dados e cibersegurança.",
      },
    ],
  }),
  component: ArtigosPage,
});

function ArtigosPage() {
  const artigos = listarArtigos();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        Conteúdo
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        Todos os artigos
      </h1>
      <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
        {artigos.length} artigo{artigos.length !== 1 ? "s" : ""} publicado
        {artigos.length !== 1 ? "s" : ""}
      </p>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artigos.map((a) => (
          <Link
            key={a.slug}
            to={`/artigos/${a.slug}`}
            className="card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 block"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary-cyan)]">
              {a.category}
            </div>
            <h2 className="mt-2 font-display text-[16px] font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors">
              {a.title}
            </h2>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {a.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
              <time dateTime={a.date}>{formatarData(a.date)}</time>
              <span className="h-1 w-1 rounded-full bg-[var(--text-secondary)]/40" />
              <span>{a.readTime} de leitura</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
