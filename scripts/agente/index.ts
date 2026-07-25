import { buscarTopico } from "./buscar-topico.js";
import { gerarArtigo } from "./gerar-artigo.js";
import { buscarImagemCapa } from "./gerar-imagem.js";
import { buscarTitulosRecentes, publicarArtigo, slugJaExiste } from "./publicar.js";
import type { ArtigoParaPublicar } from "./types.js";

async function main() {
  console.log("[agente] Buscando títulos recentes para evitar repetição...");
  const titulosRecentes = await buscarTitulosRecentes();

  console.log("[agente] Escolhendo um tópico atual...");
  const topico = await buscarTopico(titulosRecentes);
  console.log(`[agente] Tópico escolhido: ${topico.titulo}`);

  console.log("[agente] Gerando o artigo...");
  const artigo = await gerarArtigo(topico);

  if (await slugJaExiste(artigo.slug)) {
    // Evita colisão de slug em caso de tópicos muito parecidos.
    artigo.slug = `${artigo.slug}-${Date.now()}`;
  }

  console.log("[agente] Buscando imagem de capa...");
  const imagem = await buscarImagemCapa(topico.descricaoBusca);

  const artigoParaPublicar: ArtigoParaPublicar = {
    ...artigo,
    imagemUrl: imagem.url,
    imagemCreditoAutor: imagem.autor,
    imagemCreditoLink: imagem.linkAutor,
    publicadoEm: new Date().toISOString(),
  };

  console.log("[agente] Publicando no Neon...");
  await publicarArtigo(artigoParaPublicar);

  console.log(`[agente] Artigo publicado com sucesso: ${artigoParaPublicar.slug}`);
}

main().catch((erro) => {
  console.error("[agente] Falhou:", erro);
  process.exit(1);
});
