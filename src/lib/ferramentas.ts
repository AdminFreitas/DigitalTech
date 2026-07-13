const htmlFiles = import.meta.glob("../../ferramentas/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface FerramentaMeta {
  slug: string;
  name: string;
  desc: string;
  category: string;
  status: "disponivel" | "em-breve";
  htmlFile?: string;
}

export const ferramentas: FerramentaMeta[] = [
  {
    slug: "compressor-imagens",
    name: "Compressor de Imagens",
    desc: "Reduza JPG, PNG e WebP no navegador.",
    category: "Imagens",
    status: "em-breve",
  },
  {
    slug: "markdown-html",
    name: "Conversor Markdown → HTML",
    desc: "Cole o texto e copie o HTML pronto.",
    category: "Desenvolvimento",
    status: "disponivel",
    htmlFile: "conversor-markdown-html.html",
  },
  {
    slug: "uuid-hash",
    name: "Gerador de UUID / Hash",
    desc: "UUID v4, MD5, SHA-256 instantâneos.",
    category: "Desenvolvimento",
    status: "disponivel",
    htmlFile: "gerador-uuid-hash.html",
  },
  {
    slug: "formatador-json",
    name: "Formatador JSON",
    desc: "Indentação, minificação e validação.",
    category: "Desenvolvimento",
    status: "disponivel",
    htmlFile: "json-formatter.html",
  },
  {
    slug: "testador-regex",
    name: "Testador de Regex",
    desc: "Padrões PCRE com explicação visual.",
    category: "Desenvolvimento",
    status: "disponivel",
    htmlFile: "testador-regex.html",
  },
  {
    slug: "checador-senha",
    name: "Checador de Senha",
    desc: "Entropia, força e vazamentos conhecidos.",
    category: "Segurança",
    status: "disponivel",
    htmlFile: "verificador-senha.html",
  },
];

export interface Ferramenta extends FerramentaMeta {
  html: string;
}

export interface CategoriaFerramentas {
  name: string;
  items: FerramentaMeta[];
}

function resolveHtml(htmlFile: string): string | undefined {
  const key = Object.keys(htmlFiles).find((path) => path.endsWith(`/${htmlFile}`));
  return key ? htmlFiles[key] : undefined;
}

export function buscarFerramenta(slug: string): Ferramenta | undefined {
  const meta = ferramentas.find((f) => f.slug === slug);
  if (!meta?.htmlFile) return undefined;

  const html = resolveHtml(meta.htmlFile);
  if (!html) return undefined;

  return { ...meta, html };
}

export function listarFerramentas(): FerramentaMeta[] {
  return ferramentas;
}

export function listarCategorias(): CategoriaFerramentas[] {
  const map = new Map<string, FerramentaMeta[]>();

  for (const f of ferramentas) {
    const items = map.get(f.category) ?? [];
    items.push(f);
    map.set(f.category, items);
  }

  return [...map.entries()].map(([name, items]) => ({ name, items }));
}

export function categoriaTemPublicada(categoria: CategoriaFerramentas): boolean {
  return categoria.items.some((f) => f.status === "disponivel");
}

export function prepararHtmlFerramenta(raw: string): string {
  const fixed = raw.replace(/href=["']#["']/g, 'href="/ferramentas"');

  if (fixed.trim().startsWith("<!DOCTYPE") || fixed.trim().startsWith("<html")) {
    return fixed;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
${fixed}
</body>
</html>`;
}
