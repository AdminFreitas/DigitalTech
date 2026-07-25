import { neon } from "@neondatabase/serverless";
import { marked } from "marked";
import type { ArtigoParaPublicar } from "./types.js";

const sql = neon(process.env.DATABASE_URL!);

// Autor "DigitalTech AI" criado na tabela `autores` (id = 2).
// Pode sobrescrever via variável de ambiente AGENTE_AUTOR_ID se precisar trocar.
const AUTOR_ID_AGENTE = Number(process.env.AGENTE_AUTOR_ID ?? 2);

function calcularTempoLeitura(markdown: string): string {
  const palavras = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palavras / 200)); // ~200 palavras por minuto
  return `${minutos} min`;
}

export async function buscarTitulosRecentes(limite = 20): Promise<string[]> {
  const linhas = await sql`
    SELECT titulo FROM artigos
    ORDER BY data_publicacao DESC
    LIMIT ${limite}
  `;
  return linhas.map((linha) => linha.titulo as string);
}

export async function slugJaExiste(slug: string): Promise<boolean> {
  const linhas = await sql`SELECT 1 FROM artigos WHERE slug = ${slug} LIMIT 1`;
  return linhas.length > 0;
}

export async function publicarArtigo(artigo: ArtigoParaPublicar): Promise<void> {
  const conteudoHtml = await marked(artigo.corpoMarkdown);
  const tempoLeitura = calcularTempoLeitura(artigo.corpoMarkdown);

  await sql`
    INSERT INTO artigos (
      titulo, slug, resumo, conteudo_md, conteudo_html,
      categoria, autor_id, status, tempo_leitura,
      imagem_url, imagem_autor, imagem_link, data_publicacao
    ) VALUES (
      ${artigo.titulo}, ${artigo.slug}, ${artigo.resumo}, ${artigo.corpoMarkdown}, ${conteudoHtml},
      ${artigo.categoria}, ${AUTOR_ID_AGENTE}, 'publicado', ${tempoLeitura},
      ${artigo.imagemUrl}, ${artigo.imagemCreditoAutor}, ${artigo.imagemCreditoLink}, ${artigo.publicadoEm}
    )
  `;
}
