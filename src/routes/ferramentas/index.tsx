import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ferramentas/")({
  component: FerramentasPage,
});

const grupos = [
  {
    cat: "Texto e Conteudo",
    cor: "text-[color:var(--primary-cyan)]",
    itens: [
      { name: "Markdown para HTML", desc: "Converta Markdown em HTML.", href: "/ferramentas/markdown-html" },
      { name: "Formatador JSON", desc: "Indentacao, minificacao e validacao.", href: "/ferramentas/formatador-json" },
      { name: "Testador de Regex", desc: "Teste expressoes regulares.", href: "/ferramentas/testador-regex" },
      { name: "Resumidor de Texto", desc: "Resuma textos longos com IA.", href: "/ferramentas/summarizer" },
      { name: "Reescritor de Texto", desc: "Reescreva textos com IA.", href: "/ferramentas/rewriter" },
      { name: "Tradutor", desc: "Traduza textos rapidamente.", href: "/ferramentas/translator" },
    ],
  },
  {
    cat: "SEO e Marketing",
    cor: "text-[color:var(--secondary-jade)]",
    itens: [
      { name: "Gerador de Meta Tags", desc: "SEO e Open Graph em segundos.", href: "/ferramentas/meta-tags" },
      { name: "Open Graph", desc: "Visualize e gere tags Open Graph.", href: "/ferramentas/open-graph" },
      { name: "Gerador de Sitemap", desc: "XML Sitemap para SEO.", href: "/ferramentas/sitemap" },
      { name: "Gerador de robots.txt", desc: "Configure o crawling do seu site.", href: "/ferramentas/robots" },
      { name: "URL Canonica", desc: "Gere tags de URL canonica.", href: "/ferramentas/canonical" },
      { name: "Densidade de Keywords", desc: "Analise densidade de palavras-chave.", href: "/ferramentas/keyword-density" },
      { name: "Schema Markup", desc: "Gere Schema.org JSON-LD.", href: "/ferramentas/schema" },
      { name: "UTM Builder", desc: "Crie links com parametros UTM.", href: "/ferramentas/utm-builder" },
    ],
  },
  {
    cat: "Geradores",
    cor: "text-[color:var(--accent-amber)]",
    itens: [
      { name: "Gerador UUID / Hash", desc: "UUID v4, MD5, SHA-256.", href: "/ferramentas/uuid" },
      { name: "Hash Generator", desc: "MD5, SHA1, SHA256 e mais.", href: "/ferramentas/hash" },
      { name: "Gerador de QR Code", desc: "Crie QR Codes instantaneamente.", href: "/ferramentas/qr-code-generator" },
      { name: "Conversor Base64", desc: "Codifique e decodifique Base64.", href: "/ferramentas/base64" },
      { name: "Gerador de Prompts", desc: "Gere prompts para IA.", href: "/ferramentas/prompt-generator" },
    ],
  },
  {
    cat: "Design e Visual",
    cor: "text-purple-400",
    itens: [
      { name: "Color Picker", desc: "Selecione e converta cores.", href: "/ferramentas/color-picker" },
      { name: "Pixel Helper", desc: "Analise pixels e resolucoes.", href: "/ferramentas/pixel-helper" },
    ],
  },
  {
    cat: "Seguranca",
    cor: "text-pink-400",
    itens: [
      { name: "Checador de Senha", desc: "Analise a forca da sua senha.", href: "/ferramentas/checador-senha" },
      { name: "Meu IP", desc: "Descubra aqui qual é o seu ip", href: "/ferramentas/meu-ip" },
    ],
  },
];

function FerramentasPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Utilitarios</div>
      <h1 className="mt-2 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">Ferramentas</h1>
      <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
        {grupos.reduce((acc, g) => acc + g.itens.length, 0)} ferramentas gratuitas para desenvolvedores e o dia a dia.
      </p>
      {grupos.map((g) => (
        <section key={g.cat} className="mt-14">
          <h2 className={`font-display text-[13px] font-semibold uppercase tracking-[0.18em] ${g.cor}`}>{g.cat}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.itens.map((f) => (
              <Link
                key={f.href}
                to={f.href as any}
                className="card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 block"
              >
                <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] group-hover:text-[color:var(--primary-cyan)] transition-colors">
                  {f.name}
                </h3>
                <p className="mt-1.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
