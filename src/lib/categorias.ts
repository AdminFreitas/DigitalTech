import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

export const getCategoriaPorSlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const rows = await sql`
      SELECT id, nome, slug, descricao, cor, parent_id
      FROM categorias
      WHERE slug = ${slug} AND ativo = true
      LIMIT 1
    `;
    return rows[0] ?? null;
  });

export const getSubcategorias = createServerFn({ method: "GET" })
  .validator((categoriaId: number) => categoriaId)
  .handler(async ({ data: categoriaId }) => {
    const rows = await sql`
      SELECT id, nome, slug, descricao, cor
      FROM categorias
      WHERE parent_id = ${categoriaId} AND ativo = true
      ORDER BY nome
    `;
    return rows;
  });

export const getArtigosPorCategoria = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const categoriaRows = await sql`
      SELECT id, nome, slug, parent_id
      FROM categorias
      WHERE slug = ${slug} AND ativo = true
      LIMIT 1
    `;
    const categoria = categoriaRows[0];
    if (!categoria) return { categoria: null, artigos: [] };

    let categoriaIds: number[] = [categoria.id];

    if (categoria.parent_id === null) {
      const filhas = await sql`
        SELECT id FROM categorias WHERE parent_id = ${categoria.id} AND ativo = true
      `;
      categoriaIds = [categoria.id, ...filhas.map((f: any) => f.id)];
    }

    const artigos = await sql`
      SELECT
        a.id, a.titulo, a.slug, a.resumo, a.tempo_leitura, a.data_publicacao, a.imagem_url,
        c.nome AS categoria, c.slug AS categoria_slug
      FROM artigos a
      JOIN categorias c ON c.id = a.categoria_id
      WHERE a.status = 'publicado' AND a.categoria_id = ANY(${categoriaIds})
      ORDER BY a.data_publicacao DESC
    `;

    return { categoria, artigos };
  });

export const getNoticiasPorCategoria = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const categoriaRows = await sql`
      SELECT id, nome, slug, parent_id
      FROM categorias
      WHERE slug = ${slug} AND ativo = true
      LIMIT 1
    `;
    const categoria = categoriaRows[0];
    if (!categoria) return { categoria: null, noticias: [] };

    let categoriaIds: number[] = [categoria.id];

    if (categoria.parent_id === null) {
      const filhas = await sql`
        SELECT id FROM categorias WHERE parent_id = ${categoria.id} AND ativo = true
      `;
      categoriaIds = [categoria.id, ...filhas.map((f: any) => f.id)];
    }

    const noticias = await sql`
      SELECT n.id, n.titulo, n.slug, n.resumo, n.destaque, n.fonte,
             n.data_publicacao, n.tempo_leitura,
             c.nome as categoria_nome, c.slug as categoria_slug, c.cor as categoria_cor,
             i.url as cover_image
      FROM noticias n
      LEFT JOIN categorias c ON n.categoria_id = c.id
      LEFT JOIN imagens i ON i.noticia_id = n.id AND i.principal = true
      WHERE n.status = 'publicado' AND n.categoria_id = ANY(${categoriaIds})
      ORDER BY n.data_publicacao DESC
    `;

    return { categoria, noticias };
  });
export const getCategoriasComFilhas = createServerFn({ method: "GET" }).handler(async () => {

  const raizes = await sql`
  
    SELECT id, nome, slug, cor
  
    FROM categorias
  
    WHERE parent_id IS NULL AND ativo = true
  
    ORDER BY nome
  
  `;
  
  const todasFilhas = await sql`
  
    SELECT id, nome, slug, parent_id
  
    FROM categorias
  
    WHERE parent_id IS NOT NULL AND ativo = true
  
  `;
  
  return raizes.map((r: any) => ({
  
    ...r,
  
    filhosIds: [r.id, ...todasFilhas.filter((f: any) => f.parent_id === r.id).map((f: any) => f.id)],
  
  }));
  
});