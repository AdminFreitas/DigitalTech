import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo-robot.webp";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — DIGITALTECH" },
      { name: "description", content: "Termos de uso do portal DIGITALTECH." },
      { property: "og:title", content: "Termos de Uso — DIGITALTECH" },
      { property: "og:url", content: "/termos" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
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
          Termos legais
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl text-[var(--text-primary)]">
          Termos de Uso
        </h1>
        <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
          Última atualização: 15 de julho de 2026
        </p>

        <Section title="1. Aceitação">
          Ao acessar o DIGITALTECH você concorda com estes termos. Se não concordar, não utilize o
          site.
        </Section>

        <Section title="2. Uso do conteúdo">
          Os artigos, textos e ferramentas publicados são de autoria do DIGITALTECH ou devidamente
          licenciados. É permitido citar trechos com link para a fonte original; reprodução
          integral de artigos sem autorização não é permitida.
        </Section>

        <Section title="3. Ferramentas gratuitas">
          As ferramentas disponibilizadas em{" "}
          <Link to="/" className="text-[color:var(--primary-cyan)]">
            /ferramentas
          </Link>{" "}
          são oferecidas "como estão", sem garantia de disponibilidade contínua. Não nos
          responsabilizamos por perda de dados processados localmente no navegador.
        </Section>

        <Section title="4. Links externos e notícias de terceiros">
          Notícias que citam fontes externas linkam diretamente para o veículo original. Não nos
          responsabilizamos pelo conteúdo de sites de terceiros.
        </Section>

        <Section title="5. Publicidade e afiliados">
          Este site pode exibir anúncios de terceiros (ex: Google AdSense) e links de afiliados.
          Isso não altera nossa avaliação editorial do conteúdo — recomendações de produtos
          refletem uso ou pesquisa real, independentemente de comissão.
        </Section>

        <Section title="6. Alterações">
          Estes termos podem ser atualizados a qualquer momento; a data no topo desta página
          reflete a versão vigente.
        </Section>

        <Section title="7. Lei aplicável">
          Estes termos são regidos pela legislação brasileira. Para tratamento de dados pessoais,
          veja nossa{" "}
          <Link to="/politica-de-privacidade" className="text-[color:var(--primary-cyan)]">
            Política de Privacidade
          </Link>
          .
        </Section>

        <Section title="8. Contato">
          Dúvidas sobre estes termos: página{" "}
          <Link to="/contato" className="text-[color:var(--primary-cyan)]">
            /contato
          </Link>
          .
        </Section>

        <p className="mt-10 text-[12px] text-[var(--text-secondary)]/70">
          Este é um modelo padrão de Termos de Uso. Recomenda-se revisão por um advogado antes de
          publicar, especialmente após ativar monetização (anúncios, afiliados ou produtos pagos).
        </p>
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
