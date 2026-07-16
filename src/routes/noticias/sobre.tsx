import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo-robot.webp";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — DIGITALTECH" },
      {
        name: "description",
        content:
          "Quem escreve o DIGITALTECH, como o conteúdo é apurado e qual a política editorial do portal.",
      },
      { property: "og:title", content: "Sobre — DIGITALTECH" },
      {
        property: "og:description",
        content: "Quem escreve o DIGITALTECH e como o conteúdo é apurado.",
      },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--glass-border)]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" width={26} height={26} />
            <span className="font-display text-sm font-bold tracking-[0.18em]">DIGITALTECH</span>
          </Link>
          <Link
            to="/"
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Início
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24 prose prose-invert">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Sobre o portal
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl text-[var(--text-primary)]">
          Sobre o DIGITALTECH
        </h1>

        <Section title="Quem escreve">
          O DIGITALTECH é mantido por Michel Freitas, estudante de Análise e Desenvolvimento de
          Sistemas e desenvolvedor com experiência prévia em vendas e suporte de redes. O portal
          nasceu como projeto pessoal para documentar aprendizado em back-end, bancos de dados,
          inteligência artificial e cibersegurança, e hoje publica conteúdo original sobre esses
          temas.
        </Section>

        <Section title="O que publicamos">
          Artigos técnicos e explicativos sobre programação, engenharia de software, IA e
          segurança, além de notícias curtas sobre tecnologia com indicação clara da fonte
          original. Não somos um veículo de imprensa credenciado — somos um portal independente de
          conteúdo técnico e opinião.
        </Section>

        <Section title="Como apuramos">
          Artigos autorais são escritos com base em documentação oficial, testes práticos e
          experiência de implementação. Quando cobrimos uma notícia de terceiros, linkamos
          diretamente a fonte original e não apresentamos o resumo como reportagem própria.
        </Section>

        <Section title="Correções">
          Encontrou um erro factual em algum conteúdo? Avise pela página{" "}
          <Link to="/contato" className="text-[color:var(--primary-cyan)]">
            /contato
          </Link>
          . Correções relevantes são sinalizadas no próprio artigo, com data da atualização.
        </Section>

        <Section title="Contato">
          Para dúvidas, parcerias ou correções, use a página{" "}
          <Link to="/contato" className="text-[color:var(--primary-cyan)]">
            /contato
          </Link>
          .
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-2 text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}
