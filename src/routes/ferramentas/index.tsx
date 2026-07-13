import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ferramentas/")({
  component: FerramentasPage,
});

const grupos = [
  {
    cat: "Imagens",
    cor: "text-[color:var(--primary-cyan)]",
    itens: [
      { name: "Compressor de Imagens", desc: "Reduza imagens no navegador.", href: "/ferramentas/imagens/compressor.html" },
      { name: "Conversor Base64", desc: "Codifique e decodifique Base64.", href: "/ferramentas/imagens/conversor-base64.html" },
      { name: "Conversor de Cores", desc: "HEX, RGB e HSL.", href: "/ferramentas/imagens/conversor-cores.html" },
      { name: "Cortar Imagem", desc: "Recorte imagens no navegador.", href: "/ferramentas/imagens/cortar.html" },
      { name: "JPG para PDF", desc: "Converta JPG em PDF.", href: "/ferramentas/imagens/jpg-para-pdf.html" },
      { name: "PDF para JPG", desc: "Converta PDF em JPG.", href: "/ferramentas/imagens/pdf-para-jpg.html" },
      { name: "Redimensionar Imagem", desc: "Redimensione imagens online.", href: "/ferramentas/imagens/redimensionar.html" },
    ],
  },
  {
    cat: "Geradores",
    cor: "text-[color:var(--secondary-jade)]",
    itens: [
      { name: "Markdown para HTML", desc: "Cole o texto e copie o HTML.", href: "/ferramentas/gerador/conversor-markdown-html.html" },
      { name: "Formatador JSON", desc: "Indentacao, minificacao e validacao.", href: "/ferramentas/gerador/json-formatter.html" },
      { name: "Gerador de Cartao", desc: "Dados de cartao para testes.", href: "/ferramentas/gerador/gerador-cartao.html" },
      { name: "Gerador de CPF", desc: "Gere CPFs validos para testes.", href: "/ferramentas/gerador/gerador-cpf.html" },
      { name: "Gerador de E-mail", desc: "E-mails temporarios para testes.", href: "/ferramentas/gerador/gerador-email.html" },
      { name: "Gerador de Meta Tags", desc: "SEO e Open Graph.", href: "/ferramentas/gerador/gerador-meta-tags.html" },
      { name: "Gerador de QR Code", desc: "Crie QR Codes.", href: "/ferramentas/gerador/gerador-qrcode.html" },
      { name: "Gerador de robots.txt", desc: "Configure o crawling.", href: "/ferramentas/gerador/gerador-robots-txt.html" },
      { name: "Gerador de Senha", desc: "Senhas fortes e seguras.", href: "/ferramentas/gerador/gerador-senha.html" },
      { name: "Gerador de Sitemap", desc: "XML Sitemap para SEO.", href: "/ferramentas/gerador/gerador-sitemap.html" },
      { name: "Gerador UUID / Hash", desc: "UUID v4, MD5, SHA-256.", href: "/ferramentas/gerador/gerador-uuid-hash.html" },
      { name: "Hash Generator", desc: "MD5, SHA1, SHA256.", href: "/ferramentas/gerador/hash-generator.html" },
      { name: "Testador de Regex", desc: "Padroes PCRE com explicacao visual.", href: "/ferramentas/gerador/testador-regex.html" },
      { name: "UUID Generator", desc: "Gere UUIDs unicos.", href: "/ferramentas/gerador/uuid-generator.html" },
    ],
  },
  {
    cat: "Seguranca",
    cor: "text-[color:var(--accent-amber)]",
    itens: [
      { name: "Validador de CPF", desc: "Valide CPFs.", href: "/ferramentas/seguranca/validador-cpf.html" },
      { name: "Verificador de Senha", desc: "Analise a forca da sua senha.", href: "/ferramentas/seguranca/verificador-senha.html" },
      { name: "Verificador de Vazamento", desc: "Veja se sua senha foi vazada.", href: "/ferramentas/seguranca/verificador-vazamento-senha.html" },
      { name: "Gerador de Senha Segura", desc: "Senhas fortes geradas localmente.", href: "/ferramentas/seguranca/gerador-senha.html" },
    ],
  },
  {
    cat: "Rede",
    cor: "text-purple-400",
    itens: [
      { name: "Meu IP", desc: "Descubra seu IP publico.", href: "/ferramentas/rede/meu-ip.html" },
    ],
  },
  {
    cat: "Calculadoras",
    cor: "text-pink-400",
    itens: [
      { name: "Calculadoras Financeiras", desc: "Juros, ROI, margem e simulacoes.", href: "/ferramentas/calculadoraIA/index.html" },
      { name: "Juros Compostos", desc: "Calcule investimentos.", href: "/ferramentas/calculadoraIA/juros-compostos.html" },
      { name: "Calculadoras Trabalhistas", desc: "FGTS, rescisao, salario e horas.", href: "/ferramentas/calculadoraIA/trabalhistas/index.html" },
      { name: "Rescisao Trabalhista", desc: "Calcule verbas rescisorias.", href: "/ferramentas/calculadoraIA/rescisao.html" },
      { name: "FGTS", desc: "Calcule o FGTS acumulado.", href: "/ferramentas/calculadoraIA/fgts.html" },
    ],
  },
];

function FerramentasPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Utilitarios</div>
      <h1 className="mt-2 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">Ferramentas</h1>
      <p className="mt-3 text-[15px] text-[var(--text-secondary)]">Ferramentas gratuitas para desenvolvedores e o dia a dia.</p>
      {grupos.map((g) => (
        <section key={g.cat} className="mt-14">
          <h2 className={`font-display text-[13px] font-semibold uppercase tracking-[0.18em] ${g.cor}`}>{g.cat}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.itens.map((f) => (
              <a key={f.href} href={f.href} className="card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 block">
                <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] group-hover:text-[color:var(--primary-cyan)] transition-colors">{f.name}</h3>
                <p className="mt-1.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}