import { createFileRoute, Link } from "@tanstack/react-router";
import { marked } from "marked";
import { NewsCardPequeno } from "@/components/noticias/NewsCard";
import type { Noticia } from "@/components/noticias/dados";
import { formatarData } from "@/lib/content";
import { getNoticiaPorSlug, getNoticias } from "@/lib/noticias";

function paraNoticia(n: any): Noticia {
  const dataISO =
    n.data_publicacao instanceof Date
      ? n.data_publicacao.toISOString().slice(0, 10)
      : String(n.data_publicacao).slice(0, 10);
  return {
    slug: n.slug,
    titulo: n.titulo,
    resumo: n.resumo,
    conteudoMd: n.conteudo_md ?? "",
    conteudoHtml: n.conteudo_html ?? "",
    categoria: n.categoria_slug ?? "",
    categoriaLabel: n.categoria_nome ?? "",
    fonte: n.fonte ?? "",
    data: formatarData(dataISO),
    dataISO,
    destaque: Boolean(n.destaque),
    coverImage: n.cover_image ?? "",
    tempoLeitura: n.tempo_leitura ?? 5,
  };
}

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }) => {
    const row = await getNoticiaPorSlug({ data: params.slug });
    if (!row) return { noticia: null as Noticia | null, relacionadas: [] as Noticia[] };

    const noticia = paraNoticia(row);

    const todas = await getNoticias();
    const relacionadas = todas
      .filter((n) => n.categoria_slug === row.categoria_slug && n.slug !== row.slug)
      .slice(0, 2)
      .map(paraNoticia);

    return { noticia, relacionadas };
  },
  head: ({ loaderData }) => {
    const noticia = loaderData?.noticia;
    if (!noticia) return { meta: [{ title: "Notícia não encontrada — DIGITALTECH" }] };
    const url = `https://digitaltech.digital/noticias/${noticia.slug}`;
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
  const { noticia, relacionadas } = Route.useLoaderData();

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
    image: noticia.coverImage ? [noticia.coverImage] : [],
    datePublished: noticia.dataISO,
    publisher: { "@type": "Organization", name: "DIGITALTECH" },
  };

  const corpoHtml = noticia.conteudoHtml
    ? noticia.conteudoHtml
    : (marked.parse(noticia.conteudoMd ?? "", { async: false }) as string);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-3xl px-4 pt-[var(--header-clearance)] pb-10">
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

        {noticia.coverImage && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-[var(--glass-border)]">
            <img src={noticia.coverImage} alt={noticia.titulo} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="mt-8 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-5">
          <p className="text-[var(--text-primary)] text-lg leading-relaxed font-medium">
            {noticia.resumo}
          </p>
        </div>

        <div
          className="prose prose-invert max-w-none mt-8 text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: corpoHtml }}
        />

        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Fonte original:{" "}
          <span className="text-[var(--text-secondary)] font-medium">{noticia.fonte}</span>
        </p>

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
