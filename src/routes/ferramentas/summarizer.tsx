import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function SummarizerPage() {
  const [input, setInput] = useState('');
  const [length, setLength] = useState('medium');

  const getLengthDescription = () => {
    const descriptions: Record<string, string> = {
      short: 'Resumo muito conciso (mÃ¡ximo 50 palavras)',
      medium: 'Resumo moderado (100-150 palavras)',
      long: 'Resumo detalhado (200-300 palavras)',
    };
    return descriptions[length] || descriptions.medium;
  };

  return (
    <ToolLayout
      title="Resumidor"
      description="Gere resumos concisos de longos artigos ou documentos."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Texto para Resumir
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole o texto que deseja resumir..."
              rows={8}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
            <p className="mt-2 text-xs text-[#94a3b8]">
              {input.length} caracteres
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Comprimento do Resumo
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            >
              <option value="short">Curto</option>
              <option value="medium">MÃ©dio</option>
              <option value="long">Longo</option>
            </select>
            <p className="mt-2 text-xs text-[#94a3b8]">{getLengthDescription()}</p>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            InstruÃ§Ãµes
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Cole o texto completo que deseja resumir</li>
            <li>â€¢ Selecione o comprimento desejado do resumo</li>
            <li>â€¢ Use um serviÃ§o de IA para gerar o resumo</li>
            <li>â€¢ Revise o resumo para garantir que capture os pontos principais</li>
            <li>â€¢ Ideal para artigos, documentos e relatÃ³rios longos</li>
          </ul>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Quanto mais longo o texto, melhor o resumo</li>
            <li>â€¢ Mantenha a essÃªncia do conteÃºdo original</li>
            <li>â€¢ Use resumos para economizar tempo de leitura</li>
            <li>â€¢ Ideal para pesquisa e organizaÃ§Ã£o de informaÃ§Ãµes</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/summarizer')({
  component: SummarizerPage,
});

