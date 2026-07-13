import { useEffect, useRef } from 'react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      heroRef.current.style.setProperty('--mouse-x', `${x}%`);
      heroRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* Subtle gradient background with light effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.08), transparent 50%)`,
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Tecnologia em Foco
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Explore artigos aprofundados sobre IA, programação, cibersegurança e banco de dados. 
            Conteúdo técnico de qualidade, escrito para quem está construindo carreira em TI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200">
              Explorar Artigos
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-white/5 transition-colors duration-200">
              Sobre o Blog
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
