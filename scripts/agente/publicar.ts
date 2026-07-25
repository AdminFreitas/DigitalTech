import { neon } from "@neondatabase/serverless";
import type { ArtigoParaPublicar } from "./types.js";

const sql = neon(process.env.DATABASE_URL!);

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
  await sql`
    INSERT INTO artigos (
      titulo, slug, resumo, conteudo_md, conteudo_html,
      categoria, status, data_publicacao, atualizado_em
    ) VALUES (
      ${artigo.titulo},
      ${artigo.slug},
      ${artigo.resumo},
      ${artigo.corpoMarkdown},
      ${artigo.corpoMarkdown},
      ${artigo.categoria},
      'publicado',
      ${artigo.publicadoEm},
      NOW()
    )
  `;
}
