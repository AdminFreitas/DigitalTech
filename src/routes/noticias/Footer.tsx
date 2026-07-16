import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Github,
  Linkedin,
  Instagram,
  Youtube,
  MessageCircle,
  Mail,
  ArrowUp,
} from "lucide-react";

type Canal = "email" | "whatsapp";

export function Footer() {
  const [canal, setCanal] = useState<Canal>("email");
  const [valor, setValor] = useState("");

  const scrollTopo = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <section className="border-b border-[var(--glass-border)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Fique por dentro das novidades
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Receba as principais notícias do DigitalTech por e-mail ou WhatsApp.
              </p>
            </div>

            <form className="space-y-3">
              <div className="flex overflow-hidden rounded-lg border border-[var(--glass-border)] w-fit">
                <button
                  type="button"
                  onClick={() => { setCanal("email"); setValor(""); }}
                  className={`px-4 py-2 text-sm ${canal==="email"?"font-bold":""}`}
                >
                  <Mail className="mr-2 inline h-4 w-4"/>E-mail
                </button>
                <button
                  type="button"
                  onClick={() => { setCanal("whatsapp"); setValor(""); }}
                  className={`px-4 py-2 text-sm ${canal==="whatsapp"?"font-bold":""}`}
                >
                  <MessageCircle className="mr-2 inline h-4 w-4"/>WhatsApp
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={valor}
                  onChange={(e)=>setValor(e.target.value)}
                  placeholder={canal==="email"?"Seu e-mail":"Seu WhatsApp"}
                  className="flex-1 rounded-lg border border-[var(--glass-border)] bg-transparent px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-[var(--glass-border)] px-6 py-3 font-semibold"
                >
                  Inscrever
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Você poderá cancelar a inscrição quando desejar.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer className="site-footer border-t border-[var(--glass-border)]">
        <div className="footer-inner mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="font-display text-[15px] font-bold tracking-[0.18em] text-[var(--text-primary)]">
                DIGITALTECH
              </span>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Tecnologia em um Minuto
              </p>

              <div className="mt-5 flex gap-3">
                {[
                  ["https://github.com/michelfreitasdev", <Github className="h-4 w-4"/>],
                  ["https://linkedin.com/in/michelfreitas-ads", <Linkedin className="h-4 w-4"/>],
                  ["https://instagram.com/digitaltech00", <Instagram className="h-4 w-4"/>],
                  ["https://youtube.com/@digitaltech00", <Youtube className="h-4 w-4"/>],
                ].map(([href,icon],i)=>(
                  <a key={i} href={href as string} target="_blank" rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] hover:text-[var(--text-primary)]">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Navegação</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/noticias">Notícias</Link></li>
                <li><Link to="/contato">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Comunidade</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><a href="#">Newsletter</a></li>
                <li><a href="#">Sugestões</a></li>
                <li><a href="#">Favoritos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Sobre</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="/sobre">Sobre o DigitalTech</Link></li>
                <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
                <li><Link to="/termos">Termos de Uso</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-[var(--glass-border)] pt-6">
            <p className="text-[13px] text-[var(--text-secondary)]">
              © 2026 Michel Freitas. Todos os direitos reservados.
            </p>

            <button
              onClick={scrollTopo}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)]"
            >
              <ArrowUp className="h-4 w-4"/>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
