import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsCardPequeno } from "@/components/noticias/NewsCard";
import { NOTICIAS } from "@/components/noticias/dados";

export const Route = createFileRoute("/noticias/$slug")({
  head: ({ params }) => {
    const noticia = NOTICIAS.find((n) => n.slug === params.slug);
    if (!noticia) return { meta: [{ title: "Notícia não encontrada — DIGITALTECH" }] };
    const url = `https://digitaltech.digital/noticias/${params.slug}`;
    return {
      meta: [
        { title: `${noticia.titulo} — DIGITALTECH` },
        { name: "description", content: noticia.resumo },
        { property: "og:type", content: "article" },
        { property: "og:title", content: noticia.titulo },
        { property: "og:description", content: noticia.resumo },
        { property: "og:image", content: noticia.coverImage },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "DIGITALTECH" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: noticia.titulo },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: NoticiaPage,
});

function NoticiaPage() {
  const { slug } = Route.useParams();
  const noticia = NOTICIAS.find((n) => n.slug === slug);
  const relacionadas = noticia
    ? NOTICIAS.filter((n) => n.categoria === noticia.categoria && n.slug !== slug).slice(0, 2)
    : [];

  if (!noticia) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-6xl mb-4 text-[var(--text-muted)]">404</p>
          <h1 className="font-display text-2xl font-bold text-white">Notícia não encontrada</h1>
          <Link to="/noticias" className="mt-4 inline-block text-[color:var(--primary-cyan)] hover:underline">
            Voltar para notícias
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.titulo,
    description: noticia.resumo,
    image: [noticia.coverImage],
    datePublished: noticia.dataISO,
    publisher: { "@type": "Organization", name: "DIGITALTECH" },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/noticias" className="text-sm text-[color:var(--primary-cyan)] hover:underline">
          ← Notícias
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[color:var(--primary-cyan)] bg-[color:var(--primary-cyan)]/10">
              {noticia.categoriaLabel}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{noticia.tempoLeitura} min</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white leading-tight">{noticia.titulo}</h1>
          <time dateTime={noticia.dataISO} className="mt-2 block text-sm text-[var(--text-muted)]">
            {noticia.data}
          </time>
        </div>

        <div className="mt-6 rounded-2xl overflow-hidden border border-[var(--glass-border)]">
          <img src={noticia.coverImage} alt={noticia.titulo} className="w-full h-64 object-cover" />
        </div>

        {/* Formato de resumo curado — sem fingir ter uma matéria completa que não existe */}
        <div className="mt-8 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5">
          <p className="text-[var(--text-primary)] text-lg leading-relaxed">{noticia.resumo}</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Fonte original:{" "}
            <span className="text-[var(--text-secondary)] font-medium">{noticia.fonte}</span>
          </p>
        </div>

        {relacionadas.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display font-bold text-lg text-white mb-4">Notícias relacionadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relacionadas.map((n) => (
                <NewsCardPequeno key={n.slug} n={n} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
