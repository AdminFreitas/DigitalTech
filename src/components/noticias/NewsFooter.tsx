import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Twitter, Linkedin, Github, Mail, MessageCircle, Youtube, Instagram, ArrowUp } from "lucide-react";

type Canal = "email" | "whatsapp";

export function NewsFooter() {
  const [canal, setCanal] = useState<Canal>("email");
  const [valor, setValor] = useState("");
  const [nome, setNome] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const scrollTopo = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const validar = () => {
    if (!nome.trim()) return "Informe seu nome.";
    if (canal === "email") {
      if (!valor.trim()) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "E-mail invalido.";
    } else {
      if (!valor.trim()) return "Informe seu WhatsApp.";
      if (!/^\+?[\d\s\-\(\)]{10,}$/.test(valor)) return "Numero invalido.";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const erroVal = validar();
    if (erroVal) { setErro(erroVal); return; }
    setErro("");
    setEnviado(true);
    setValor("");
    setNome("");
  };

  return (
    <footer className="bg-gray-900 text-white mt-20">

      {/* Newsletter */}
      <div className="bg-blue-700">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fique por dentro das novidades</h2>
              <p className="text-blue-100 text-sm">Receba as melhores noticias sobre tecnologia direto no seu e-mail ou WhatsApp.</p>
            </div>
            <div>
              {enviado ? (
                <div className="bg-white/10 border border-white/30 rounded-xl p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <p className="font-bold">Inscricao confirmada!</p>
                    <p className="text-sm text-blue-100">Voce receberá noticias em breve.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Seletor Email / WhatsApp */}
                  <div className="flex rounded-lg overflow-hidden border border-white/30 w-fit">
                    <button type="button" onClick={() => { setCanal("email"); setValor(""); setErro(""); }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${canal === "email" ? "bg-white text-blue-700" : "bg-transparent text-white hover:bg-white/10"}`}>
                      <Mail className="w-4 h-4" /> E-mail
                    </button>
                    <button type="button" onClick={() => { setCanal("whatsapp"); setValor(""); setErro(""); }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${canal === "whatsapp" ? "bg-white text-blue-700" : "bg-transparent text-white hover:bg-white/10"}`}>
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                  </div>

                  <input value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50" />

                  <div className="flex gap-2">
                    <input value={valor} onChange={e => setValor(e.target.value)}
                      placeholder={canal === "email" ? "seu@email.com" : "+55 21 99999-9999"}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50" />
                    <button type="submit"
                      className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors shrink-0">
                      Inscrever
                    </button>
                  </div>

                  {erro && <p className="text-red-300 text-xs">{erro}</p>}
                  <p className="text-xs text-blue-200">Voce pode se desinscrever a qualquer momento.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links e redes sociais */}
      <div className="mx-auto max-w-6xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">DT</div>
            <span className="font-bold text-lg">DigitalTech</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">Portal independente brasileiro de tecnologia, programacao e inovacao.</p>
          {/* Ícones redes sociais */}
          <div className="flex gap-3">
            <a href="https://twitter.com/digitaltech00" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com/in/michelfreitas-ads" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/michelfreitasdev" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://youtube.com/@digitaltech00" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/digitaltech00" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Navegacao</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/noticias" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/noticias" className="hover:text-white transition-colors">Noticias</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Trending</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Favoritos</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Comunidade</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Preferencias</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sugestoes</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Sobre</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors">Sobre DigitalTech</a></li>
            <li><Link to="/politica-de-privacidade" className="hover:text-white transition-colors">Politica de Privacidade</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <p className="text-gray-500 text-sm">© 2026 Michel Freitas · DigitalTech · Todos os direitos reservados.</p>
          <button onClick={scrollTopo}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

    </footer>
  );
}
