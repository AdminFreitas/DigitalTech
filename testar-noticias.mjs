import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT n.titulo, n.slug, n.destaque, c.nome as categoria, i.url as imagem
  FROM noticias n
  LEFT JOIN categorias c ON n.categoria_id = c.id
  LEFT JOIN imagens i ON i.noticia_id = n.id AND i.principal = true
  WHERE n.status = 'publicado'
`;
console.log(JSON.stringify(rows, null, 2));
