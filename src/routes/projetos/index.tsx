import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/")({
  component: ProjetosPage,
});

function ProjetosPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        Projetos
      </div>

      <h1 className="mt-2 font-display text-4xl font-bold text-[var(--text-primary)]">
        Projetos
      </h1>

      <p className="mt-4 max-w-2xl text-[15px] text-[var(--text-secondary)]">
        Nesta página serão apresentados os projetos desenvolvidos pela
        DIGITALTECH, incluindo aplicações web, ferramentas, automações,
        inteligência artificial e projetos open source.
      </p>

      <div className="mt-12 rounded-2xl border border-[var(--glass-border)] bg-[rgba(22,31,48,0.55)] p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Em construção
        </h2>

        <p className="mt-3 text-[var(--text-secondary)]">
          Em breve esta página exibirá todos os projetos publicados.
        </p>
      </div>
    </main>
  );
}