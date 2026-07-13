import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-primary to-primary/60 rounded-full opacity-80" />
              </div>
              <span className="font-bold text-foreground">Digital Pulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Portal de tecnologia com conteúdo de qualidade para profissionais de TI.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Artigos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Categorias</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">IA & Machine Learning</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Programação</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cibersegurança</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Banco de Dados</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Redes Sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors duration-200">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors duration-200">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors duration-200">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 Digital Pulse Hub. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
