import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function UTMBuilderPage() {
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [term, setTerm] = useState('');

  const utmUrl = useMemo(() => {
    if (!baseUrl.trim() || !source.trim() || !medium.trim() || !campaign.trim()) {
      return '';
    }

    const params = new URLSearchParams();
    params.append('utm_source', source);
    params.append('utm_medium', medium);
    params.append('utm_campaign', campaign);
    if (content.trim()) params.append('utm_content', content);
    if (term.trim()) params.append('utm_term', term);

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }, [baseUrl, source, medium, campaign, content, term]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(utmUrl);
    alert('URL copiada para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="UTM Builder"
      description="Crie URLs com parÃ¢metros UTM para rastreamento de campanhas."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              URL Base (obrigatÃ³rio)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Fonte (utm_source) - obrigatÃ³rio
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ex: google, facebook, newsletter"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Meio (utm_medium) - obrigatÃ³rio
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="Ex: cpc, email, social"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Campanha (utm_campaign) - obrigatÃ³rio
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Ex: black_friday, lancamento_produto"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              ConteÃºdo (utm_content) - opcional
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex: banner_hero, botao_cta"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Termo (utm_term) - opcional
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ex: palavra-chave, topico"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            URL Gerada
          </h3>

          <div className="relative">
            <textarea
              value={utmUrl}
              readOnly
              rows={3}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#3ddc97] font-mono text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              disabled={!utmUrl}
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
            <li>â€¢ Use nomes descritivos e consistentes</li>
            <li>â€¢ Evite espaÃ§os, use hÃ­fens ou underscores</li>
            <li>â€¢ Rastreie em Google Analytics</li>
            <li>â€¢ Crie um padrÃ£o para sua empresa</li>
            <li>â€¢ Revise as URLs antes de publicar</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/utm-builder')({
  component: UTMBuilderPage,
});

