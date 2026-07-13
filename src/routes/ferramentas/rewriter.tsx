import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function RewriterPage() {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('neutral');

  const getRewriterTip = () => {
    const tips: Record<string, string> = {
      formal: 'Reescreva de forma formal e profissional',
      casual: 'Reescreva de forma casual e amigÃ¡vel',
      neutral: 'Reescreva mantendo um tom neutro',
      creative: 'Reescreva de forma criativa e inovadora',
    };
    return tips[tone] || tips.neutral;
  };

  return (
    <ToolLayout
      title="Reescritor"
      description="Reescreva textos para melhorar clareza, tom ou estilo."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Texto Original
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole o texto que deseja reescrever..."
              rows={6}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Tom
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            >
              <option value="neutral">Neutro</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="creative">Criativo</option>
            </select>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dica
          </h3>
          <p className="text-sm text-[#94a3b8]">{getRewriterTip()}</p>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            InstruÃ§Ãµes
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Cole o texto que deseja reescrever</li>
            <li>â€¢ Selecione o tom desejado</li>
            <li>â€¢ Use em um editor de IA para gerar a reescrita</li>
            <li>â€¢ Revise o resultado antes de usar</li>
            <li>â€¢ Mantenha a mensagem original intacta</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/rewriter')({
  component: RewriterPage,
});

