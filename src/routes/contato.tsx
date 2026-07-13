import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-robot.webp";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — DIGITALTECH" },
      {
        name: "description",
        content: "Fale com a equipe do DIGITALTECH: pautas, parcerias, correções e dúvidas.",
      },
      { property: "og:title", content: "Contato — DIGITALTECH" },
      { property: "og:description", content: "Fale com a equipe do DIGITALTECH." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("enviado") === "1") setSent(true);
  }, []);

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
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Contato
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Vamos conversar</h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Pautas, parcerias, correções ou só um oi — escolha o assunto certo e a gente responde em
          até 3 dias úteis.
        </p>

        {sent && (
          <div className="mt-8 rounded-xl border border-[color:var(--secondary-jade)]/40 bg-[color:var(--secondary-jade)]/10 p-4 text-[14px] text-[var(--text-primary)]">
            Mensagem enviada. Obrigado pelo contato — vamos responder em breve.
          </div>
        )}

        <form action="https://formspree.io/f/SEU_ID_AQUI" method="POST" className="mt-10 space-y-5">
          {/* honeypot anti-spam */}
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            aria-hidden="true"
          />

          <Field label="Nome" name="nome" maxLength={80} required />
          <Field label="E-mail" name="email" type="email" maxLength={120} required />
          <Field label="Assunto" name="assunto" maxLength={120} required />
          <div>
            <label
              className="mb-2 block text-[13px] text-[var(--text-secondary)]"
              htmlFor="mensagem"
            >
              Mensagem
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              maxLength={2000}
              required
              rows={6}
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[rgba(22,31,48,0.55)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none transition-colors focus:border-[color:var(--primary-cyan)]"
            />
          </div>

          <input
            type="hidden"
            name="_next"
            value={
              typeof window !== "undefined"
                ? `${window.location.origin}/contato?enviado=1`
                : "/contato?enviado=1"
            }
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary-cyan)] px-6 py-2.5 text-[14px] font-semibold text-[var(--bg-primary)] transition-transform hover:-translate-y-0.5"
          >
            Enviar mensagem
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  maxLength,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[13px] text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-xl border border-[var(--glass-border)] bg-[rgba(22,31,48,0.55)] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none transition-colors focus:border-[color:var(--primary-cyan)]"
      />
    </div>
  );
}
