import { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0b1020]">

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <h1 className="mb-4 font-['Plus_Jakarta_Sans'] text-4xl font-bold text-[#f8fafc]">
            {title}
          </h1>
          <p className="text-lg text-[#94a3b8]">{description}</p>
        </div>

        {/* Tool Content */}
        <div className="animate-fade-up rounded-lg border border-[#161f30] bg-[#161f30] p-8 glass">
          {children}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link
            to="/ferramentas"
            className="inline-flex items-center gap-2 rounded-lg border border-[#161f30] bg-[#161f30] px-4 py-2 text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 hover-spot"
          >
            ← Voltar para Ferramentas
          </Link>
        </div>
      </div>
    </div>
  );
}
