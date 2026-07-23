import { listarArtigos } from "@/lib/content";
import { NOTICIAS } from "@/components/noticias/dados";
import { FERRAMENTAS } from "@/lib/ferramentas-lista";

export type TipoResultado = "Artigo" | "Ferramenta" | "Notícia";

export interface ResultadoBusca {
  tipo: TipoResultado;
  titulo: string;
  resumo: string;
  url: string;
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos — "codigo" acha "código"
}

// Pontuação simples: título pesa mais que resumo. É o mesmo princípio já
// usado na busca de /noticias/busca — título > resumo > categoria.
function pontuar(titulo: string, resumo: string, termos: string[]): number {
  const t = normalizar(titulo);
  const r = normalizar(resumo);
  let pontos = 0;
  for (const termo of termos) {
    if (t.includes(termo)) pontos += 3;
    if (r.includes(termo)) pontos += 1;
  }
  return pontos;
}

/**
 * Busca única do site — usada tanto pelo SearchModal (cabeçalho) quanto
 * pela caixa de busca da home. Reúne artigos, notícias e ferramentas,
 * pontua por relevância e devolve uma lista padronizada e ordenada.
 */
export function pesquisar(texto: string, limite = 8): ResultadoBusca[] {
  const termos = normalizar(texto).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return [];

  const candidatos: (ResultadoBusca & { pontos: number })[] = [];

  for (const a of listarArtigos()) {
    const pontos = pontuar(a.title, a.excerpt, termos);
    if (pontos > 0) {
      candidatos.push({
        tipo: "Artigo",
        titulo: a.title,
        resumo: a.excerpt,
        url: `/artigos/${a.slug}`,
        pontos,
      });
    }
  }

  for (const n of NOTICIAS) {
    const pontos = pontuar(n.titulo, n.resumo, termos);
    if (pontos > 0) {
      candidatos.push({
        tipo: "Notícia",
        titulo: n.titulo,
        resumo: n.resumo,
        url: `/noticias/${n.slug}`,
        pontos,
      });
    }
  }

  for (const f of FERRAMENTAS) {
    const pontos = pontuar(f.name, f.desc, termos);
    if (pontos > 0) {
      candidatos.push({
        tipo: "Ferramenta",
        titulo: f.name,
        resumo: f.desc,
        url: f.to,
        pontos,
      });
    }
  }

  return candidatos
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite)
    .map(({ pontos, ...resto }) => resto);
}
