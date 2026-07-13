import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-hover border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-r from-primary to-primary/60 rounded-full opacity-80" />
            </div>
            <span className="text-lg font-bold text-foreground">Digital Pulse</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Home
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Artigos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Categorias
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Contato
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
              Home
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
              Artigos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
              Categorias
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
              Contato
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
