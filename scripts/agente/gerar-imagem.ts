import type { ImagemCapa } from "./types.js";

async function buscarNoUnsplash(query: string): Promise<ImagemCapa | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape`;

  const resp = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!resp.ok) return null;

  const data = (await resp.json()) as {
    results: Array<{
      urls: { regular: string };
      user: { name: string; links: { html: string } };
    }>;
  };

  const foto = data.results[0];
  if (!foto) return null;

  return {
    url: foto.urls.regular,
    autor: foto.user.name,
    linkAutor: foto.user.links.html,
    fonte: "unsplash",
  };
}

async function buscarNoPexels(query: string): Promise<ImagemCapa | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape`;

  const resp = await fetch(url, { headers: { Authorization: apiKey } });
  if (!resp.ok) return null;

  const data = (await resp.json()) as {
    photos: Array<{
      src: { large: string };
      photographer: string;
      photographer_url: string;
    }>;
  };

  const foto = data.photos[0];
  if (!foto) return null;

  return {
    url: foto.src.large,
    autor: foto.photographer,
    linkAutor: foto.photographer_url,
    fonte: "pexels",
  };
}

/**
 * Tenta o Unsplash primeiro; se não houver chave configurada ou nenhum
 * resultado, cai para o Pexels. Lança erro se nenhuma das duas funcionar
 * (o artigo não deve ser publicado sem imagem de capa).
 */
export async function buscarImagemCapa(descricaoBusca: string): Promise<ImagemCapa> {
  const doUnsplash = await buscarNoUnsplash(descricaoBusca);
  if (doUnsplash) return doUnsplash;

  const doPexels = await buscarNoPexels(descricaoBusca);
  if (doPexels) return doPexels;

  throw new Error(
    `Nenhuma imagem encontrada para "${descricaoBusca}" no Unsplash nem no Pexels.`
  );
}
