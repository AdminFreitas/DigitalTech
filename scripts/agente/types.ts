export interface Topico {
  titulo: string;
  descricaoBusca: string; // usado para buscar a imagem de capa
  categoria: string; // ex: "IA", "Programação", "Cibersegurança", "Carreira"
  fonteOriginal?: string; // título + resumo da notícia RSS original, usado como contexto para o Ollama
}

export interface ArtigoGerado {
  titulo: string;
  slug: string;
  resumo: string;
  corpoMarkdown: string;
  tags: string[];
  categoria: string;
}

export interface ImagemCapa {
  url: string;
  autor: string;
  linkAutor: string;
  fonte: "unsplash" | "pexels";
}

export interface ArtigoParaPublicar extends ArtigoGerado {
  imagemUrl: string;
  imagemCreditoAutor: string;
  imagemCreditoLink: string;
  publicadoEm: string; // ISO date
}
