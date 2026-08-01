import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatarData } from "@/lib/content";
import {
  getCategoriaPorSlug,
  getSubcategorias,
  getArtigosPorCategoria,
  getNoticiasPorCategoria,
} from "@/lib/categorias";

export const Route = createFileRoute("/categorias/$categoria")({
  loader: async ({ params }) => {
    const categoria = await getCategoriaPorSlug({ data: params.categoria });
    if (!categoria) {
      return { categoria: null, subcategorias: [], artigos: [], noticias: [] };
    }

    const [subcategorias, artigosResult, noticiasResult] = await Promise.all([
      categoria.parent_id === null
        ? getSubcategorias({ data: categoria.id })
        : Promise.resolve([]),
      getArtigosPorCategoria({ data: params.categoria }),
      getNoticiasPorCategoria({ data: params.categoria }),
    ]);

    return {
      categoria,
      subcategorias,
      artigos: artigosResult.artigos,
      noticias: noticiasResult.noticias,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.categoria
          ? `${loaderData.categoria.nome} — DIGITALTECH`
          : "Categoria não encontrada — DIGITALTECH",
      },
    ],
  }),
  component: CategoriaPage,
});

function CategoriaPage() {
  const { categoria, subcategorias, artigos, noticias } = Route.useLoaderData();
  const [aba, setAba] = useState<"artigos" | "noticias">("artigos");

  if (!categoria) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-24 text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Categoria não encontrada
        </h1>
        <Link to="/" className="mt-6 inline-block text-[13px] text-[color:var(--primary-cyan)]">
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-[var(--header-clearance)] pb-24">
      <Link
        to="/"
        hash="categorias"
        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        ← Categorias
      </Link>

      <div className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[color:var(--primary-cyan)]">
        Categoria
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {categoria.nome}
      </h1>
      {categoria.descricao && (
        <p className="mt-3 text-[15px] text-[var(--text-secondary)] max-w-2xl">
          {categoria.descricao}
        </p>
      )}

      {/* Chips de subcategoria (só aparece se for categoria-mãe) */}
      {subcategorias.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {subcategorias.map((s: any) => (
            <Link
              key={s.slug}
              to="/categorias/$categoria"
              params={{ categoria: s.slug }}
              className="rounded-full border border-[var(--glass-border)] px-4 py-2 text-[13px] text-[var(--text-secondary)] transition-colors hover:border-[color:var(--primary-cyan)] hover:text-[color:var(--primary-cyan)]"
            >
              {s.nome}
            </Link>
          ))}
        </div>
      )}

      {/* Abas */}
      <div className="mt-10 flex gap-2 border-b border-[var(--glass-border)]">
        <button
          onClick={() => setAba("artigos")}
          className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
            aba === "artigos"
              ? "border-[color:var(--primary-cyan)] text-[var(--text-primary)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Artigos ({artigos.length})
        </button>
        <button
          onClick={() => setAba("noticias")}
          className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
            aba === "noticias"
              ? "border-[color:var(--primary-cyan)] text-[var(--text-primary)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Notícias ({noticias.length})
        </button>
      </div>

      {/* Conteúdo da aba Artigos */}
      {aba === "artigos" && (
        artigos.length === 0 ? (
          <p className="mt-12 text-[15px] text-[var(--text-secondary)]">
            Nenhum artigo publicado nesta categoria ainda.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artigos.map((a: any) => {
              const dataISO =
                a.data_publicacao instanceof Date
                  ? a.data_publicacao.toISOString().slice(0, 10)
                  : String(a.data_publicacao).slice(0, 10);
              const tempo = a.tempo_leitura;
              return (
                <Link
                  key={a.slug}
                  to="/artigos/$slug"
                  params={{ slug: a.slug }}
                  className="card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] overflow-hidden backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 block"
                >
                  {a.imagem_url && (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={a.imagem_url} alt={a.titulo} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary-cyan)]">
                      {a.categoria}
                    </div>
                    <h2 className="mt-2 font-display text-[16px] font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors">
                      {a.titulo}
                    </h2>
                    <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      {a.resumo}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
                      <time dateTime={dataISO}>{formatarData(dataISO)}</time>
                      {tempo && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--text-secondary)]/40" />
                          <span>{typeof tempo === "number" ? `${tempo} min` : tempo} de leitura</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Conteúdo da aba Notícias */}
      {aba === "noticias" && (
        noticias.length === 0 ? (
          <p className="mt-12 text-[15px] text-[var(--text-secondary)]">
            Nenhuma notícia publicada nesta categoria ainda.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n: any) => {
              const dataISO =
                n.data_publicacao instanceof Date
                  ? n.data_publicacao.toISOString().slice(0, 10)
                  : String(n.data_publicacao).slice(0, 10);
              return (
                <Link
                  key={n.slug}
                  to="/noticias/$slug"
                  params={{ slug: n.slug }}
                  className="card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] overflow-hidden backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 block"
                >
                  {n.cover_image && (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={n.cover_image} alt={n.titulo} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--secondary-jade)]">
                      {n.categoria_nome}
                    </div>
                    <h2 className="mt-2 font-display text-[16px] font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[color:var(--primary-cyan)] transition-colors">
                      {n.titulo}
                    </h2>
                    <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      {n.resumo}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
                      {dataISO && <time dateTime={dataISO}>{formatarData(dataISO)}</time>}
                      {n.tempo_leitura && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--text-secondary)]/40" />
                          <span>{n.tempo_leitura} min de leitura</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}