import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import logo from "@/assets/logo-robot.webp";
import planet from "@/assets/planet.webp";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { listarArtigos, formatarData } from "@/lib/content";

export const Route = createFileRoute("/noticias/home-index")({
  head: () => ({
    meta: [
      { title: "DIGITALTECH — Tecnologia em um Minuto" },
      {
        name: "description",
        content:
          "Portal brasileiro de tecnologia. IA, programação, banco de dados, cibersegurança e as notícias que realmente importam.",
      },
      { property: "og:title", content: "DIGITALTECH — Tecnologia em um Minuto" },
      {
        property: "og:description",
        content:
          "IA, programação, banco de dados, cibersegurança e ferramentas — conteúdo em primeiro lugar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "DIGITALTECH",
          url: "https://digitaltech.digital/",
          inLanguage: "pt-BR",
          author: {
            "@type": "Person",
            name: "Michel Freitas",
            url: "https://digitaltech.digital/",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "O que é o DIGITALTECH?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Um portal independente brasileiro sobre tecnologia: IA, engenharia de software, dados e cibersegurança.",
              },
            },
            {
              "@type": "Question",
              name: "Quem escreve o conteúdo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Michel Freitas, com colaborações pontuais de profissionais convidados da indústria.",
              },
            },
            {
              "@type": "Question",
              name: "O conteúdo é gratuito?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. Todo o conteúdo do blog é gratuito. A newsletter também é gratuita.",
              },
            },
            {
              "@type": "Question",
              name: "Como sugerir uma pauta?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pela página de contato, com o assunto 'Pauta' e um resumo da ideia.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

/* ------------------------------------------------------------ DATA */

type Article = {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  cover: string;
  slug?: string;
};

const COVER_GRADIENTS = [
  "radial-gradient(120% 80% at 20% 10%, #00D4FF55 0%, #0B1020 60%), linear-gradient(135deg, #0B1020, #121826)",
  "radial-gradient(120% 80% at 80% 20%, #3DDC9755 0%, #0B1020 55%), linear-gradient(135deg, #0B1020, #121826)",
  "radial-gradient(120% 80% at 50% 100%, #E8B86D55 0%, #0B1020 60%), linear-gradient(180deg, #0B1020, #121826)",
  "linear-gradient(135deg, #121826 0%, #0B1020 100%)",
  "linear-gradient(135deg, #161F30 0%, #0B1020 100%)",
  "linear-gradient(135deg, #102046 0%, #0B1020 100%)",
];

// Artigos reais vindos de content/artigos/*.md via content.ts — antes disso
// eram dois arrays hardcoded com "Em breve" fixo, desconectados do conteúdo real.
const artigosPublicados: Article[] = listarArtigos().map((a, i) => ({
  category: a.category,
  title: a.title,
  excerpt: a.excerpt,
  readTime: a.readTime,
  date: formatarData(a.date),
  cover: COVER_GRADIENTS[i % COVER_GRADIENTS.length],
  slug: a.slug,
}));

const featured: Article[] = artigosPublicados.slice(0, 3);
const recent: Article[] = artigosPublicados.slice(3, 9);

const tools = [
  {
    name: "Compressor de Imagens",
    desc: "Reduza JPG, PNG e WebP no navegador.",
    href: "/ferramentas/imagens/compressor.html",
  },
  {
    name: "Conversor Markdown → HTML",
    desc: "Cole o texto e copie o HTML pronto.",
    href: "/ferramentas/gerador/conversor-markdown-html.html",
  },
  {
    name: "Gerador de UUID / Hash",
    desc: "UUID v4, MD5, SHA-256 instantâneos.",
    href: "/ferramentas/uuid",
  },
  {
    name: "Formatador JSON",
    desc: "Indentação, minificação e validação.",
    href: "/ferramentas/json-formatter",
  },
  {
    name: "Testador de Regex",
    desc: "Padrões PCRE com explicação visual.",
    href: "/ferramentas/gerador/testador-regex.html",
  },
  {
    name: "Checador de Senha",
    desc: "Entropia, força e vazamentos conhecidos.",
    href: "/ferramentas/seguranca/verificador-senha.html",
  },
];

const categories = [
  {
    name: "Inteligência Artificial",
    sub: ["LLMs", "RAG", "Agentes", "Visão Computacional", "Áudio & TTS", "Ética em IA"],
  },
  {
    name: "Engenharia de Software",
    sub: ["Python", "TypeScript", "Go", "Rust", "Arquitetura", "Testes"],
  },
  {
    name: "Dados",
    sub: ["PostgreSQL", "Data Warehouse", "Streaming", "ETL/ELT", "DuckDB", "Observabilidade"],
  },
  {
    name: "Cibersegurança",
    sub: ["AppSec", "Cloud Security", "Pentest", "OWASP", "Resposta a Incidentes"],
  },
  { name: "Cloud & DevOps", sub: ["AWS", "Cloudflare", "Kubernetes", "CI/CD", "IaC", "Edge"] },
  { name: "Carreira", sub: ["Entrevistas", "Liderança", "Freelance", "Estudos"] },
];

const projects = [
  { name: "Tech em 1 Minuto", desc: "Newsletter curta sobre o que importou na semana." },
  { name: "DT Decks", desc: "Slides técnicos gratuitos para apresentações." },
  { name: "DT Snippets", desc: "Biblioteca de trechos de código testados em produção." },
];

const faq = [
  {
    q: "O que é o DIGITALTECH?",
    a: "Um portal independente brasileiro sobre tecnologia: IA, engenharia de software, dados e cibersegurança.",
  },
  {
    q: "Quem escreve o conteúdo?",
    a: "Michel Freitas, com colaborações pontuais de profissionais convidados da indústria.",
  },
  {
    q: "O conteúdo é gratuito?",
    a: "Sim. Todo o conteúdo do blog é gratuito. A newsletter também é gratuita.",
  },
  {
    q: "Como sugerir uma pauta?",
    a: "Pela página de contato, com o assunto 'Pauta' e um resumo da ideia.",
  },
];

/* ------------------------------------------------------------ HOOKS */

function useSpotlight() {
  return (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ------------------------------------------------------------ HEADER */

function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      ref.current.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#artigos", label: "Artigos" },
    { href: "#ferramentas", label: "Ferramentas" },
    { href: "#categorias", label: "Categorias" },
    { href: "#projetos", label: "Projetos" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500 data-[scrolled=true]:bg-[rgba(11,16,32,0.78)] data-[scrolled=true]:backdrop-blur-xl data-[scrolled=true]:border-b data-[scrolled=true]:border-[var(--glass-border)]"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            digitaltech<span className="text-[#00D4FF]">.</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[13px] text-[var(--text-secondary)]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="transition-colors duration-300 hover:text-[var(--text-primary)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/contato"
                className="transition-colors duration-300 hover:text-[var(--text-primary)]"
              >
                Contato
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#artigos"
            className="inline-flex items-center rounded-full border border-[var(--glass-border)] px-4 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors duration-300 hover:border-[color:var(--primary-cyan)] hover:text-[var(--text-primary)]"
          >
            Newsletter
          </a>
        </div>
        <button
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border)] text-[var(--text-secondary)]"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--glass-border)] bg-[rgba(11,16,32,0.95)] backdrop-blur-xl">
          <ul className="mx-auto max-w-6xl px-6 py-4 space-y-3 text-[15px]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  onClick={() => setOpen(false)}
                  href={l.href}
                  className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                onClick={() => setOpen(false)}
                to="/contato"
                className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Contato
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------ HERO */

function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      stageRef.current?.classList.add("animation-done");
    }, 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="hero relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(0,212,255,0.28), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="fade-up">
          <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            DIGITALTECH
          </h1>
          <h2 className="mt-2 font-display text-[clamp(1.1rem,2.5vw,1.6rem)] font-semibold text-[#3DDC97]">
            Tecnologia em um Minuto
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
            IA, programação, inovação, ferramentas e as notícias que realmente importam.
          </p>
          <SafeSearch />
          <div className="mt-7 flex flex-wrap items-center gap-5 text-[13px] text-[var(--text-secondary)]">
            <a href="#artigos" className="story-link text-[var(--text-primary)]">
              Ler edição atual →
            </a>
            <span className="h-px w-10 bg-[var(--glass-border)]" />
            <span>22 artigos · atualizado hoje</span>
          </div>
        </div>
        <div ref={stageRef} className="relative hidden md:block planet-stage">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60 blur-2xl"
            style={{
              background: "radial-gradient(closest-side, rgba(0,212,255,0.22), transparent 70%)",
            }}
          />
          <img
            id="planet"
            src={planet}
            alt="Planeta Terra representando tecnologia global"
            width={420}
            height={420}
            className="planet-img relative mx-auto opacity-95"
          />
        </div>
      </div>
    </section>
  );
}

function SafeSearch() {
  const [q, setQ] = useState("");
  const [echo, setEcho] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const busca = params.get("busca");
    if (busca) setEcho(busca);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const safe = q.trim().slice(0, 120);
        setEcho(safe || null);
        const url = new URL(window.location.href);
        if (safe) url.searchParams.set("busca", safe);
        else url.searchParams.delete("busca");
        window.history.replaceState({}, "", url.toString());
      }}
      className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(22,31,48,0.5)] px-4 py-2 backdrop-blur-md"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[var(--text-secondary)]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="search"
        name="busca"
        maxLength={120}
        placeholder="Buscar artigos…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
      />
      <button
        type="submit"
        className="text-[12px] uppercase tracking-wider text-[var(--primary-cyan)] hover:text-white transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}

/* ------------------------------------------------------------ TOOLS */

function Tools() {
  const onMove = useSpotlight();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="ferramentas" className="mx-auto max-w-6xl px-6 pb-20">
      <SectionHeader
        eyebrow="Ferramentas"
        title="Pequenos utilitários, grandes economias de tempo"
      />

      <div
        ref={ref}
        className="fade-in grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tools.map((t) =>
          t.href ? (
            <Link
              key={t.name}
              to={t.href}
              onMouseMove={onMove}
              className="hover-spot card-border rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md cursor-pointer block transition-all hover:scale-[1.02]"
            >
              <h3 className="font-display text-[16px] font-semibold text-[var(--text-primary)]">
                {t.name}
              </h3>

              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                {t.desc}
              </p>
            </Link>
          ) : (
            <div
              key={t.name}
              onMouseMove={onMove}
              className="hover-spot card-border rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md cursor-default"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[16px] font-semibold text-[var(--text-primary)]">
                  {t.name}
                </h3>

                <span className="rounded-full border border-[color:var(--accent-amber)]/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--accent-amber)]">
                  Em breve
                </span>
              </div>

              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                {t.desc}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ ARTICLES */

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function ArticleCard({ a, large = false }: { a: Article; large?: boolean }) {
  const onMove = useSpotlight();
  const cardClass = "block overflow-hidden rounded-2xl";
  const cardContent = (
    <>
      <div
        className={`relative w-full overflow-hidden rounded-t-2xl ${large ? "aspect-[16/10]" : "aspect-[16/9]"}`}
        style={{ background: a.cover }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.55),transparent_60%)]" />
        <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/85 backdrop-blur">
          {a.category}
        </div>
      </div>
      <div className="p-5 md:p-6">
        <h3
          className={`font-display font-semibold text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[color:var(--primary-cyan)] ${large ? "text-xl md:text-2xl leading-snug" : "text-[17px] leading-snug"}`}
        >
          {a.title}
        </h3>
        {large && (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            {a.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
          <time>{a.date}</time>
          <span className="h-1 w-1 rounded-full bg-[var(--text-secondary)]/40" />
          <span>{a.readTime} de leitura</span>
        </div>
      </div>
    </>
  );

  return (
    <article
      onMouseMove={onMove}
      className="hover-spot card-border group rounded-2xl bg-[rgba(22,31,48,0.55)] backdrop-blur-md transition-transform duration-500 hover:-translate-y-0.5"
    >
      {a.slug ? (
        <Link to="/artigos/$slug" params={{ slug: a.slug }} className={cardClass}>
          {cardContent}
        </Link>
      ) : (
        <div className={cardClass}>{cardContent}</div>
      )}
    </article>
  );
}

function Articles() {
  const ref1 = useReveal<HTMLDivElement>();
  const ref2 = useReveal<HTMLDivElement>();
  return (
    <section id="artigos" className="mx-auto max-w-6xl px-6 pb-24">
      <SectionHeader
        eyebrow="Em destaque"
        title="O que ler primeiro nesta semana"
        right={
          <Link
            to="/artigos"
            className="hidden text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] md:inline story-link"
          >
            Ver todos →
          </Link>
        }
      />
      <div ref={ref1} className="fade-in grid grid-cols-1 gap-6 md:grid-cols-3">
        {featured.map((a) => (
          <ArticleCard key={a.title} a={a} large />
        ))}
      </div>

      <div className="mt-20">
        <SectionHeader eyebrow="Recentes" title="Atualizações da semana" />
        <div ref={ref2} className="fade-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((a) => (
            <ArticleCard key={a.title} a={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ CATEGORIES */

function Categories() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="categorias" className="mx-auto max-w-6xl px-6 pb-24">
      <SectionHeader eyebrow="Categorias" title="Navegue por tema" />
      <div ref={ref} className="fade-in grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.name} cat={c} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ cat }: { cat: { name: string; sub: string[] } }) {
  const [open, setOpen] = useState(false);
  const onMove = useSpotlight();
  return (
    <div
      onMouseMove={onMove}
      className="hover-spot card-border rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md"
    >
      <h3 className="font-display text-[16px] font-semibold text-[var(--text-primary)]">
        {cat.name}
      </h3>
      <ul className="mt-3 space-y-1.5 text-[13.5px] text-[var(--text-secondary)]">
        {(open ? cat.sub : cat.sub.slice(0, 3)).map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[color:var(--secondary-jade)]" />
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
              {s}
            </a>
          </li>
        ))}
      </ul>
      {cat.sub.length > 3 && (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-3 text-[12px] uppercase tracking-wider text-[color:var(--primary-cyan)] hover:text-white transition-colors"
        >
          {open ? "Ver menos ▴" : "Ver mais ▾"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ PROJECTS */

function Projects() {
  const onMove = useSpotlight();
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="projetos" className="mx-auto max-w-6xl px-6 pb-24">
      <SectionHeader eyebrow="Projetos" title="Coisas que estamos construindo" />
      <div ref={ref} className="fade-in grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.name}
            onMouseMove={onMove}
            className="hover-spot card-border rounded-2xl bg-[rgba(22,31,48,0.55)] p-5 backdrop-blur-md cursor-default"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[16px] font-semibold text-[var(--text-primary)]">
                {p.name}
              </h3>
              <span className="rounded-full border border-[color:var(--accent-amber)]/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--accent-amber)]">
                Em breve
              </span>
            </div>
            <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ FAQ */

function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 pb-24">
      <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
      <div ref={ref} className="fade-in space-y-3">
        {faq.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <div>{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ COOKIE */

function CookieBanner() {
  // LGPD banner — inativo por padrão conforme spec (não armazena nada agora).
  return null;
}

/* ------------------------------------------------------------ FOOTER */

function Footer() {
  return (
    <footer className="site-footer border-t border-[var(--glass-border)]">
      <div className="footer-inner mx-auto flex max-w-6xl flex-col gap-7 px-6 py-10">
        <div className="footer-brand">
          <div className="footer-logo flex flex-col">
            <span className="logo-mark font-display text-[15px] font-bold tracking-[0.18em] text-[var(--text-primary)]">
              DIGITALTECH
            </span>
            <span className="logo-tagline mt-1 text-[13px] text-[color:var(--secondary-jade)]">
              Tecnologia em um Minuto
            </span>
          </div>
        </div>
        <div className="footer-links">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--text-secondary)]">
            <li>
              <a href="#" className="transition-colors hover:text-[var(--text-primary)]">
                Sobre
              </a>
            </li>
            <li>
              <Link to="/contato" className="transition-colors hover:text-[var(--text-primary)]">
                Contato
              </Link>
            </li>
            <li>
              <Link
                to="/politica-de-privacidade"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                Política de Privacidade
              </Link>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[var(--text-primary)]">
                Termos de Uso
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-social">
          <ul className="flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]">
            <li>
              <a
                href="https://github.com/michel-freitas"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                GitHub — Michel Freitas Dev
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/michel-freitas-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                LinkedIn — Michel Freitas Dev
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@digitaltech00"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                TikTok — DigitalTech
              </a>
            </li>
          </ul>
        </div>
        <p className="footer-copy text-[13px] text-[var(--text-secondary)]">
          © 2026 Michel Freitas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Tools />
        <Articles />
        <Categories />
        <Projects />
        <FAQ />
      </main>
      <CookieBanner />
    </div>
  );
}
