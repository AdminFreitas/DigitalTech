import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsCardPequeno } from "@/components/noticias/NewsCard";
import { NOTICIAS } from "@/components/noticias/dados";

export const Route = createFileRoute("/noticias/$slug")({
  component: ArtigoPage,
});

const CORES: Record<string, { bg: string; text: string }> = {
  ia:         { bg: "bg-purple-100", text: "text-purple-700" },
  engenharia: { bg: "bg-blue-100",   text: "text-blue-700" },
  seguranca:  { bg: "bg-red-100",    text: "text-red-700" },
  cloud:      { bg: "bg-cyan-100",   text: "text-cyan-700" },
  dados:      { bg: "bg-green-100",  text: "text-green-700" },
  hardware:   { bg: "bg-orange-100", text: "text-orange-700" },
};

function ArtigoPage() {
  const { slug } = Route.useParams();
  const noticia = NOTICIAS.find(n => n.slug === slug);
  const relacionadas = noticia
    ? NOTICIAS.filter(n => n.categoria === noticia.categoria && n.slug !== slug).slice(0, 2)
    : [];
  const cor = noticia ? (CORES[noticia.categoria] ?? { bg: "bg-gray-100", text: "text-gray-700" }) : { bg: "bg-gray-100", text: "text-gray-700" };

  if (!noticia) return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-6xl mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900">Noticia nao encontrada</h1>
        <Link to="/noticias" className="mt-4 inline-block text-blue-600 hover:underline">Voltar para noticias</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/noticias" className="text-sm text-blue-600 hover:underline">Noticias</Link>
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cor.bg} ${cor.text}`}>{noticia.categoriaLabel}</span>
            <span className="text-xs text-gray-400">{noticia.fonte}</span>
            <span className="text-xs text-gray-400">· {noticia.tempoLeitura} min</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{noticia.titulo}</h1>
          <p className="mt-3 text-gray-500 text-lg leading-relaxed">{noticia.resumo}</p>
          <time className="mt-2 block text-sm text-gray-400">{noticia.data}</time>
        </div>
        <div className="mt-6 rounded-2xl overflow-hidden">
          <img src={noticia.coverImage} alt={noticia.titulo} className="w-full h-64 object-cover" />
        </div>
        <div className="mt-8 text-gray-700 leading-relaxed">
          <p>Conteudo completo em construcao. Em breve este artigo estara disponivel.</p>
        </div>
        {relacionadas.length > 0 && (
          <section className="mt-14">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Noticias relacionadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relacionadas.map(n => <NewsCardPequeno key={n.slug} n={n} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
