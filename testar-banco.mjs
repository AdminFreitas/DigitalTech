import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const resultado = await sql`SELECT COUNT(*) as total FROM categorias`;
console.log("Conexao OK — categorias no banco:", resultado[0].total);
