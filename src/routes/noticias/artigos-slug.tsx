import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { buscarArtigo, formatarData } from "@/lib/content";

export const Route = createFileRoute("/artigos/$slug")({
  head: ({ params }) => {
    const artigo = buscarArtigo(params.slug);
    const url = `https://digitaltech.digital/artigos/${params.slug}`;
    if (!artigo) {
      return { meta: [{ title: "Artigo não encontrado — DIGITALTECH" }] };
    }
    return {
      meta: [
        { title: `${artigo.title} — DIGITALTECH` },
        { name: "description", content: artigo.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:title", content: artigo.title },
        { property: "og:description", content: artigo.excerpt },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "DIGITALTECH" },
        { property: "article:published_time", content: artigo.date },
        { property: "article:section", content: artigo.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: artigo.title },
        { name: "twitter:description", content: artigo.excerpt },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: ({ params }) => {
    const artigo = buscarArtigo(params.slug);
    if (!artigo) throw notFound();
    return artigo;
  },
  component: ArtigoPage,
});

function ArtigoPage() {
  const artigo = Route.useLoaderData();

  return (
    <article className="text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <Link
          to="/artigos"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          ← Todos os artigos
        </Link>

        <header className="mt-8 border-b border-[var(--glass-border)] pb-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--primary-cyan)]">
            {artigo.category}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl">
            {artigo.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-secondary)] md:text-lg">
            {artigo.excerpt}
          </p>
          <div className="mt-5 flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
            <time dateTime={artigo.date}>{formatarData(artigo.date)}</time>
            <span className="h-1 w-1 rounded-full bg-[var(--text-secondary)]/40" />
            <span>{artigo.readTime} de leitura</span>
          </div>
        </header>

        <div
          className="mt-10 space-y-4 text-[15px] leading-relaxed text-[var(--text-secondary)] [&_a]:text-[color:var(--primary-cyan)] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--glass-border)] [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-[var(--bg-card)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[var(--bg-card)] [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-[var(--text-primary)] [&_ul]:list-disc [&_ul]:pl-4"
          dangerouslySetInnerHTML={{ __html: artigo.html }}
        />

        <div className="mt-16 border-t border-[var(--glass-border)] pt-8">
          <Link
            to="/artigos"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            ← Ver todos os artigos
          </Link>
        </div>
      </div>
    </article>
  );
}
