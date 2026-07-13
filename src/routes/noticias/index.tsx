import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NewsCardGrande, NewsCardPequeno } from "@/components/noticias/NewsCard";
import { NOTICIAS, CATEGORIAS } from "@/components/noticias/dados";

export const Route = createFileRoute("/noticias/")({
  head: () => ({ meta: [{ title: "Noticias — DIGITALTECH" }] }),
  component: NoticiasPage,
});

function NoticiasPage() {
  const [cat, setCat] = useState("todas");
  const destaques = NOTICIAS.filter(n => n.destaque);
  const outras = NOTICIAS
    .filter(n => !n.destaque && (cat === "todas" || n.categoria === cat))
    .sort((a, b) => b.dataISO.localeCompare(a.dataISO));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            <h2 className="font-bold text-xl text-gray-900">Em destaque hoje</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {destaques.map(n => <NewsCardGrande key={n.slug} n={n} />)}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1 h-6 bg-gray-300 rounded-full" />
            <h2 className="font-bold text-xl text-gray-900">Mais noticias</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIAS.map(c => (
              <button key={c.slug} onClick={() => setCat(c.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${cat === c.slug ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}>
                {c.label}
              </button>
            ))}
          </div>
          {outras.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outras.map(n => <NewsCardPequeno key={n.slug} n={n} />)}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">Nenhuma noticia nesta categoria ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}
