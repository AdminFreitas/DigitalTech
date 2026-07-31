import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";
export const getArtigos = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await sql`
    SELECT 
      a.id, a.titulo, a.slug, a.resumo, a.tempo_leitura, a.data_publicacao, a.imagem_url,
      c.nome AS categoria, c.slug AS categoria_slug
    FROM artigos a
    JOIN categorias c ON c.id = a.categoria_id
    WHERE a.status = 'publicado'
    ORDER BY a.data_publicacao DESC
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
