import { perguntarOllama } from "./ollama-client.js";
import type { ArtigoGerado, Topico } from "./types.js";

function sanitizarJsonBruto(texto: string): string {
  return texto.replace(/[\u0000-\u001F]/g, (char) => {
    if (char === "\n") return "\\n";
    if (char === "\t") return "\\t";
    if (char === "\r") return "\\r";
    return "";
  });
}

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Gera o artigo completo usando o Ollama local, com base na notícia de
 * origem coletada em buscar-topico.ts (o Ollama não navega na internet,
 * então o texto-fonte precisa ser passado como contexto no prompt).
 */
export async function gerarArtigo(
  topico: Topico & { fonteOriginal?: string }
): Promise<ArtigoGerado> {
  const prompt = `Escreva um artigo de blog em português (pt-BR) para o DigitalTech,
portal de tecnologia com tom direto e acessível ("Tecnologia em um Minuto").

Assunto: "${topico.titulo}" (categoria: ${topico.categoria})

Use como base estas informações reais, mas escreva tudo com suas próprias
palavras (nunca copie frases da fonte):
"""
${topico.fonteOriginal ?? "Sem fonte adicional — use seu conhecimento geral sobre o tema."}
"""

Regras:
- 500 a 800 palavras.
- Use subtítulos (##) para organizar o conteúdo.
- Tom direto, didático, sem jargão desnecessário.

Responda SOMENTE com um JSON, sem texto antes ou depois, no formato:
{"titulo": "...", "resumo": "1-2 frases de resumo para preview/SEO", "corpoMarkdown": "artigo completo em markdown", "tags": ["tag1", "tag2", "tag3"]}`;

  const resposta = await perguntarOllama(prompt);
  const jsonLimpo = sanitizarJsonBruto(
    resposta.replace(/```json|```/g, "").trim()
  );
  let artigo: Omit<ArtigoGerado, "slug" | "categoria">;

  try {
    artigo = JSON.parse(jsonLimpo) as Omit<ArtigoGerado, "slug" | "categoria">;
  } catch (erroParse) {
    console.error("[gerar-artigo] JSON inválido recebido do Ollama:");
    console.error(jsonLimpo);
    throw erroParse;
  }

  return {
    ...artigo,
    slug: gerarSlug(artigo.titulo),
    categoria: topico.categoria,
  };
}
