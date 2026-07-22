import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao encontrada no .env");
}

export const sql = neon(process.env.DATABASE_URL);
