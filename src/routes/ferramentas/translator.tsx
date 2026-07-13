import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function TranslatorPage() {
  const [input, setInput] = useState('');
  const [sourceLang, setSourceLang] = useState('pt');
  const [targetLang, setTargetLang] = useState('en');

  const languages: Record<string, string> = {
    pt: 'PortuguÃªs',
    en: 'English',
    es: 'EspaÃ±ol',
    fr: 'FranÃ§ais',
    de: 'Deutsch',
    it: 'Italiano',
    ja: 'æ—¥æœ¬èªž',
    zh: 'ä¸­æ–‡',
    ko: 'í•œêµ­ì–´',
    ru: 'Ð ÑƒÑÑÐºÐ¸Ð¹',
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <ToolLayout
      title="Tradutor"
      description="Traduza textos entre diferentes idiomas com precisÃ£o."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Idioma de Origem
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Idioma de Destino
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={swapLanguages}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            â‡„ Trocar Idiomas
          </button>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Texto para Traduzir
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole o texto aqui..."
              rows={6}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            InstruÃ§Ãµes
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Cole o texto que deseja traduzir</li>
            <li>â€¢ Selecione os idiomas de origem e destino</li>
            <li>â€¢ Use um serviÃ§o de traduÃ§Ã£o de IA para gerar a traduÃ§Ã£o</li>
            <li>â€¢ Revise a traduÃ§Ã£o para garantir precisÃ£o</li>
            <li>â€¢ Considere o contexto cultural ao traduzir</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/translator')({
  component: TranslatorPage,
});

