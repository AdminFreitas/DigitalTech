import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo-robot.webp";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — DIGITALTECH" },
      {
        name: "description",
        content: "Como o DIGITALTECH coleta, usa e protege seus dados conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — DIGITALTECH" },
      {
        property: "og:description",
        content: "Política de privacidade do DIGITALTECH, em conformidade com a LGPD.",
      },
      { property: "og:url", content: "/politica-de-privacidade" },
    ],
    links: [{ rel: "canonical", href: "/politica-de-privacidade" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          Compliance · LGPD
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl text-[var(--text-primary)]">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
          Última atualização: 24 de junho de 2026
        </p>

        <Section title="1. Quem somos">
          O DIGITALTECH é um portal independente de conteúdo sobre tecnologia, mantido por Michel
          Freitas (encarregado/DPO). Contato: pela página{" "}
          <Link to="/contato" className="text-[color:var(--primary-cyan)]">
            /contato
          </Link>
          .
        </Section>

        <Section title="2. Quais dados coletamos">
          <ul className="list-disc pl-5">
            <li>
              Dados que você nos envia voluntariamente pelo formulário de contato (nome, e-mail,
              assunto, mensagem).
            </li>
            <li>
              Dados técnicos básicos de navegação (endereço IP, user-agent, páginas visitadas)
              através de logs do servidor.
            </li>
            <li>Caso opte por se inscrever na newsletter, seu e-mail.</li>
          </ul>
        </Section>

        <Section title="3. Para que usamos">
          Responder seu contato, melhorar o conteúdo, prevenir abuso e enviar a newsletter (quando
          solicitado). Nunca vendemos dados.
        </Section>

        <Section title="4. Com quem compartilhamos">
          Apenas com provedores estritamente necessários: hospedagem (GitHub Pages / Cloudflare),
          CDN, e provedor de formulário (Formspree). Todos sob contrato e em conformidade com a
          LGPD.
        </Section>

        <Section title="5. Seus direitos (LGPD)">
          Você pode solicitar acesso, correção, anonimização, portabilidade ou exclusão dos seus
          dados, além de revogar consentimentos. Faça o pedido por{" "}
          <Link to="/contato" className="text-[color:var(--primary-cyan)]">
            /contato
          </Link>
          .
        </Section>

        <Section title="6. Cookies">
          Atualmente o site não utiliza cookies de rastreamento. Caso isso mude, você será informado
          com um banner de consentimento.
        </Section>

        <Section title="7. Retenção">
          Mensagens são guardadas pelo tempo necessário para responder e por até 24 meses para
          histórico. Logs por até 6 meses.
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
