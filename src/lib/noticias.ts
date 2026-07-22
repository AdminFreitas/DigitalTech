import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

export const getNoticias = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await sql`
    SELECT n.id, n.titulo, n.slug, n.resumo, n.destaque, n.fonte,
           n.data_publicacao, n.tempo_leitura,
           c.nome as categoria_nome, c.slug as categoria_slug, c.cor as categoria_cor,
           i.url as cover_image
    FROM noticias n
    LEFT JOIN categorias c ON n.categoria_id = c.id
    LEFT JOIN imagens i ON i.noticia_id = n.id AND i.principal = true
    WHERE n.status = 'publicado'
    ORDER BY n.data_publicacao DESC
    LIMIT 20
  `;
  return rows;
});

export const getCategorias = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await sql`SELECT id, nome, slug, cor FROM categorias WHERE ativo = true ORDER BY nome`;
  return rows;
});

export const getNoticiaPorSlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const rows = await sql`
      SELECT n.*, c.nome as categoria_nome, c.slug as categoria_slug,
             i.url as cover_image
      FROM noticias n
      LEFT JOIN categorias c ON n.categoria_id = c.id
      LEFT JOIN imagens i ON i.noticia_id = n.id AND i.principal = true
      WHERE n.slug = ${slug} AND n.status = 'publicado'
      LIMIT 1
    `;
    return rows[0] ?? null;
  });
  