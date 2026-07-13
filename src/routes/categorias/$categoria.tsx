import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/categorias/$categoria")({
  component: CategoriaPage,
});

const categorias: Record<string, { nome: string; subcategorias: string[] }> = {
  "inteligencia-artificial": {
    nome: "Inteligência Artificial",
    subcategorias: ["LLMs", "RAG", "Agentes", "Visão Computacional", "Áudio & TTS", "Ética em IA"],
  },
  "engenharia-de-software": {
    nome: "Engenharia de Software",
    subcategorias: ["Python", "TypeScript", "Go", "Rust", "Arquitetura", "Testes"],
  },
  dados: {
    nome: "Dados",
    subcategorias: [
      "PostgreSQL",
      "Data Warehouse",
      "Streaming",
      "ETL/ELT",
      "DuckDB",
      "Observabilidade",
    ],
  },
  ciberseguranca: {
    nome: "Cibersegurança",
    subcategorias: ["AppSec", "Cloud Security", "Pentest", "OWASP", "Resposta a Incidentes"],
  },
  "cloud-devops": {
    nome: "Cloud & DevOps",
    subcategorias: ["AWS", "Cloudflare", "Kubernetes", "CI/CD", "IaC", "Edge"],
  },
  carreira: {
    nome: "Carreira",
    subcategorias: ["Entrevistas", "Liderança", "Freelance", "Estudos"],
  },
};

function CategoriaPage() {
  const { categoria } = Route.useParams();
  const cat = categorias[categoria];

  if (!cat) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-24 text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Categoria não encontrada
        </h1>
        <Link to="/" className="mt-6 inline-block text-[13px] text-[color:var(--primary-cyan)]">
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <Link
        to="/#categorias"
        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        ← Categorias
      </Link>
      <div className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[color:var(--primary-cyan)]">
        Categoria
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {cat.nome}
      </h1>
      <div className="mt-8 flex flex-wrap gap-3">
        {cat.subcategorias.map((s) => (
          <span
            key={s}
            className="rounded-full border border-[var(--glass-border)] px-4 py-2 text-[13px] text-[var(--text-secondary)]"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mt-12">
        <p className="text-[15px] text-[var(--text-secondary)]">
          Artigos desta categoria em breve.
        </p>
      </div>
    </div>
  );
}
