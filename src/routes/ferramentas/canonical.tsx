import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function CanonicalPage() {
  const [canonicalUrl, setCanonicalUrl] = useState('');

  const generateCanonical = () => {
    if (!canonicalUrl.trim()) return '';
    return `<link rel="canonical" href="${canonicalUrl}" />`;
  };

  const canonical = generateCanonical();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(canonical);
    alert('Tag canÃ´nica copiada para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Canonical"
      description="Ferramenta para gerar e validar tags canÃ´nicas."
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            URL CanÃ´nica
          </label>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://example.com/pagina"
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
          />
          <p className="mt-2 text-sm text-[#94a3b8]">
            Use URLs canÃ´nicas para indicar ao Google qual Ã© a versÃ£o preferida de uma pÃ¡gina.
          </p>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Tag Gerada
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97]">
              {canonical || '<!-- Tag canÃ´nica aparecerÃ¡ aqui -->'}
            </pre>

            <button
              onClick={copyToClipboard}
              disabled={!canonical}
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
            <li>â€¢ Use URLs canÃ´nicas para evitar conteÃºdo duplicado</li>
            <li>â€¢ A URL canÃ´nica deve ser a versÃ£o preferida da pÃ¡gina</li>
            <li>â€¢ Coloque a tag no <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">&lt;head&gt;</code></li>
            <li>â€¢ Sempre use URLs absolutas, nunca relativas</li>
            <li>â€¢ A URL canÃ´nica pode apontar para a mesma pÃ¡gina</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/canonical')({
  component: CanonicalPage,
});

