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

const COVER_GRADIENTS = [
  "radial-gradient(120% 80% at 20% 10%, #00D4FF55 0%, #0B1020 60%), linear-gradient(135deg, #0B1020, #121826)",
  "radial-gradient(120% 80% at 80% 20%, #3DDC9755 0%, #0B1020 55%), linear-gradient(135deg, #0B1020, #121826)",
  "radial-gradient(120% 80% at 50% 100%, #E8B86D55 0%, #0B1020 60%), linear-gradient(180deg, #0B1020, #121826)",
  "linear-gradient(135deg, #121826 0%, #0B1020 100%)",
  "linear-gradient(135deg, #161F30 0%, #0B1020 100%)",
  "linear-gradient(135deg, #102046 0%, #0B1020 100%)",
];

function ArtigosPage() {
  const artigos = listarArtigos();

  if (artigos.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 pt-[var(--header-clearance)] pb-24 text-center text-[var(--text-secondary)]">
        Nenhum artigo publicado ainda.
      </div>
    );
  }

  const destaquePrincipal    = artigos[0];
  const destaquesSecundarios = artigos.slice(1, 4);
  const restante             = artigos.slice(4);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-[var(--header-clearance)] pb-24">

      {/* ── HERO: 1 grande (col-span-2) + 3 menores (3º oculto no mobile) ── */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Card principal */}
        <Link
          to="/artigos/$slug"
          params={{ slug: destaquePrincipal.slug }}
          className="group relative lg:col-span-2 rounded-2xl overflow-hidden border border-[var(--glass-border)] block min-h-[300px] lg:min-h-[440px]"
          style={{ background: COVER_GRADIENTS[0] }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-[color:var(--primary-cyan)] bg-[color:var(--primary-cyan)]/10 border border-[color:var(--primary-cyan)]/30">
              {destaquePrincipal.category}
            </span>
            <h2 className="font-display text-white font-bold text-xl md:text-3xl leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors">
              {destaquePrincipal.title}
            </h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm md:text-base line-clamp-2 max-w-2xl">
              {destaquePrincipal.excerpt}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <time dateTime={destaquePrincipal.date}>{formatarData(destaquePrincipal.date)}</time>
              <span>·</span>
              <span>{destaquePrincipal.readTime} de leitura</span>
            </div>
          </div>
        </Link>

        {/* Coluna lateral: 2 visíveis no mobile, 3 no desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
          {destaquesSecundarios.map((a, i) => (
            <Link
              key={a.slug}
              to="/artigos/$slug"
              params={{ slug: a.slug }}
              className={`group relative rounded-xl overflow-hidden border border-[var(--glass-border)] block min-h-[140px] lg:min-h-0 lg:flex-1 ${
                i === 2 ? "hidden lg:block" : ""
              }`}
              style={{ background: COVER_GRADIENTS[(i + 1) % COVER_GRADIENTS.length] }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="inline-block mb-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-[color:var(--secondary-jade)] bg-[color:var(--secondary-jade)]/10">
                  {a.category}
                </span>
                <h3 className="text-white font-semibold text-xs md:text-sm leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors line-clamp-2">
                  {a.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RESTANTE ── */}
      {restante.length > 0 && (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restante.map((a) => (
            <Link
              key={a.slug}
              to="/artigos/$slug"
              params={{ slug: a.slug }}
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
      )}

      {/* ── CONTADOR — rodapé ── */}
      <p className="mt-14 text-center text-[13px] text-[var(--text-secondary)]">
        {artigos.length} artigo{artigos.length !== 1 ? "s" : ""} publicado{artigos.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}