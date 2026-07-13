import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function PromptGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('professional');
  const [length, setLength] = useState('medium');

  const generatePrompt = () => {
    if (!topic.trim()) return '';

    let prompt = `VocÃª Ã© um assistente de IA especializado. ${topic}`;

    if (style === 'creative') {
      prompt += ' Responda de forma criativa e inovadora.';
    } else if (style === 'technical') {
      prompt += ' Responda de forma tÃ©cnica e detalhada.';
    } else if (style === 'professional') {
      prompt += ' Responda de forma profissional e clara.';
    } else if (style === 'casual') {
      prompt += ' Responda de forma casual e amigÃ¡vel.';
    }

    if (length === 'short') {
      prompt += ' Mantenha a resposta concisa (mÃ¡ximo 100 palavras).';
    } else if (length === 'medium') {
      prompt += ' ForneÃ§a uma resposta moderada (200-300 palavras).';
    } else if (length === 'long') {
      prompt += ' ForneÃ§a uma resposta detalhada (500+ palavras).';
    }

    return prompt;
  };

  const prompt = generatePrompt();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copiado para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Gerador de Prompts"
      description="Crie prompts otimizados para modelos de IA generativa."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Tema ou Tarefa
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Descreva o que vocÃª quer que a IA faÃ§a..."
              rows={4}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Estilo
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              >
                <option value="professional">Profissional</option>
                <option value="creative">Criativo</option>
                <option value="technical">TÃ©cnico</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Comprimento
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
            </div>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Prompt Gerado
          </h3>

          <div className="relative">
            <textarea
              value={prompt}
              readOnly
              rows={6}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#3ddc97] font-mono text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              disabled={!prompt}
              className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copiar
            </button>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Seja especÃ­fico sobre o que vocÃª quer</li>
            <li>â€¢ Inclua contexto relevante</li>
            <li>â€¢ Defina o tom e o estilo desejado</li>
            <li>â€¢ Especifique o comprimento esperado</li>
            <li>â€¢ Refine o prompt com base nos resultados</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/prompt-generator')({
  component: PromptGeneratorPage,
});

