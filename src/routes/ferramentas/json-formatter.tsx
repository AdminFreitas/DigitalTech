import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function JSONFormatterPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const formatJSON = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON invÃ¡lido');
      return '';
    }
  };

  const minifyJSON = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON invÃ¡lido');
      return '';
    }
  };

  const formatted = formatJSON();
  const minified = minifyJSON();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Formate e valide JSON para facilitar a leitura e depuraÃ§Ã£o."
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            Cole seu JSON aqui
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder='{"exemplo": "json"}'
            rows={8}
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm"
          />
          {error && (
            <p className="mt-2 text-sm text-[#e8b86d]">âš ï¸ Erro: {error}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              Formatado
            </h3>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96 font-mono">
                {formatted || '// JSON formatado aparecerÃ¡ aqui'}
              </pre>
              {formatted && (
                <button
                  onClick={() => copyToClipboard(formatted)}
                  className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              Minificado
            </h3>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96 font-mono break-all">
                {minified || '// JSON minificado aparecerÃ¡ aqui'}
              </pre>
              {minified && (
                <button
                  onClick={() => copyToClipboard(minified)}
                  className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Use para validar JSON antes de enviar para APIs</li>
            <li>â€¢ Minifique para reduzir tamanho de arquivos</li>
            <li>â€¢ Formate para melhor legibilidade e depuraÃ§Ã£o</li>
            <li>â€¢ Suporta arrays e objetos aninhados</li>
            <li>â€¢ Identifica erros de sintaxe automaticamente</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/json-formatter')({
  component: JSONFormatterPage,
});

