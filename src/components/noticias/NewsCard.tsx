import { Link } from "@tanstack/react-router";
import type { Noticia } from "./dados";

const CORES: Record<string, { bg: string; text: string }> = {
  ia:         { bg: "bg-purple-100", text: "text-purple-700" },
  engenharia: { bg: "bg-blue-100",   text: "text-blue-700" },
  seguranca:  { bg: "bg-red-100",    text: "text-red-700" },
  cloud:      { bg: "bg-cyan-100",   text: "text-cyan-700" },
  dados:      { bg: "bg-green-100",  text: "text-green-700" },
  hardware:   { bg: "bg-orange-100", text: "text-orange-700" },
};

export function NewsCardGrande({ n }: { n: Noticia }) {
  const cor = CORES[n.categoria] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <Link to="/noticias/$slug" params={{ slug: n.slug }} className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        <img src={n.coverImage} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cor.bg} ${cor.text}`}>{n.categoriaLabel}</span>
          <span className="text-xs text-gray-400">{n.fonte}</span>
        </div>
        <h2 className="font-bold text-gray-900 text-[17px] leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">{n.titulo}</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">{n.resumo}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <time>{n.data}</time>
          <span>·</span>
          <span>{n.tempoLeitura} min de leitura</span>
        </div>
      </div>
    </Link>
  );
}

export function NewsCardPequeno({ n }: { n: Noticia }) {
  const cor = CORES[n.categoria] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <Link to="/noticias/$slug" params={{ slug: n.slug }} className="group flex gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img src={n.coverImage} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="min-w-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cor.bg} ${cor.text}`}>{n.categoriaLabel}</span>
        <h3 className="mt-1 text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">{n.titulo}</h3>
        <time className="text-xs text-gray-400 mt-1 block">{n.data}</time>
      </div>
    </Link>
  );
}
