import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";
export const getArtigos = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await sql`
    SELECT id, titulo, slug, resumo, categoria, tempo_leitura, data_publicacao, imagem_url
    FROM artigos
    WHERE status = 'publicado'
    ORDER BY data_publicacao DESC
  `;
  return rows;
});
export const getArtigoPorSlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const rows = await sql`
      SELECT *
      FROM artigos
      WHERE slug = ${slug} AND status = 'publicado'
      LIMIT 1
    `;
    return rows[0] ?? null;
  });
