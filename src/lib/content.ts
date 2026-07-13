import { marked } from "marked";

marked.setOptions({ gfm: true });

const rawFiles = import.meta.glob("../../content/artigos/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface ArtigoMeta {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  published: boolean;
}

export interface Artigo extends ArtigoMeta {
  html: string;
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();
    if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    if (value === "false") value = false;
    data[key] = value;
  }

  return { data, content: match[2].trim() };
}

const todosArtigos: Artigo[] = Object.entries(rawFiles)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slugFromPath = path.split("/").pop()!.replace(".md", "");
    return {
      slug: (data.slug as string) || slugFromPath,
      title: (data.title as string) || "",
      category: (data.category as string) || "",
      excerpt: (data.excerpt as string) || "",
      date: (data.date as string) || "",
      readTime: (data.readTime as string) || "",
      published: data.published !== false,
      html: marked(content) as string,
    };
  })
  .filter((a) => a.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function listarArtigos(): ArtigoMeta[] {
  return todosArtigos.map(({ html: _, ...meta }) => meta);
}

export function buscarArtigo(slug: string): Artigo | undefined {
  return todosArtigos.find((a) => a.slug === slug);
}

export function formatarData(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
