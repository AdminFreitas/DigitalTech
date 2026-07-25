import Parser from "rss-parser";
import { perguntarOllama } from "./ollama-client.js";
import type { Topico } from "./types.js";

// Feeds gratuitos de tecnologia (sem necessidade de chave de API).
// Adicione ou troque feeds conforme o foco do seu blog.
const FEEDS = [
  "https://www.tecmundo.com.br/rss",
  "https://canaltech.com.br/rss/",
  "https://olhardigital.com.br/feed/",
];

interface ItemFeed {
  titulo: string;
  descricao: string;
}

async function coletarItens(): Promise<ItemFeed[]> {
  const parser = new Parser();
  const itens: ItemFeed[] = [];

  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        itens.push({
          titulo: item.title ?? "",
          descricao: item.contentSnippet ?? item.content ?? "",
        });
      }
    } catch (erro) {
      console.warn(`[buscar-topico] Falhou ao ler feed ${feedUrl}:`, erro);
    }
  }

  return itens;
}

/**
 * Coleta notícias de feeds RSS gratuitos, ignora as que já foram
 * publicadas recentemente e usa o Ollama local para transformar a
 * escolhida em um "tópico" (título em pt-BR, palavras-chave para
 * imagem e categoria).
 */
export async function buscarTopico(
  titulosRecentes: string[]
): Promise<Topico & { fonteOriginal: string }> {
  const itens = await coletarItens();

  const candidatos = itens.filter(
    (item) =>
      item.titulo &&
      !titulosRecentes.some((t) => t.toLowerCase() === item.titulo.toLowerCase())
  );

  if (candidatos.length === 0) {
    throw new Error("Nenhuma notícia nova encontrada nos feeds RSS.");
  }

  const escolhido = candidatos[0];

  const prompt = `Você organiza a pauta do DigitalTech, um portal brasileiro de tecnologia
(IA, programação, banco de dados, desenvolvimento web, cibersegurança, carreira em TI).

Notícia de origem:
Título: "${escolhido.titulo}"
Resumo: "${escolhido.descricao}"

Responda SOMENTE com um JSON, sem texto antes ou depois, no formato:
{"titulo": "título em português para nosso artigo", "descricaoBusca": "3 a 5 palavras-chave em inglês para achar uma foto de capa", "categoria": "uma de: IA, Programação, Banco de Dados, Desenvolvimento Web, Cibersegurança, Carreira"}`;

  const resposta = await perguntarOllama(prompt);
  const jsonLimpo = resposta.replace(/```json|```/g, "").trim();
  const topico = JSON.parse(jsonLimpo) as Topico;

  return { ...topico, fonteOriginal: `${escolhido.titulo}\n${escolhido.descricao}` };
}
