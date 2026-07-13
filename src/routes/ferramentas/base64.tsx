import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function Base64Page() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const processBase64 = () => {
    try {
      if (mode === 'encode') {
        return btoa(input);
      } else {
        return atob(input);
      }
    } catch (e) {
      return '';
    }
  };

  const output = processBase64();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copiado para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Base64"
      description="Codifique e decodifique strings em Base64."
    >
      <div className="space-y-8">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === 'encode'}
              onChange={() => setMode('encode')}
              className="h-4 w-4"
            />
            <span className="text-[#f8fafc]">Codificar</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === 'decode'}
              onChange={() => setMode('decode')}
              className="h-4 w-4"
            />
            <span className="text-[#f8fafc]">Decodificar</span>
          </label>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            {mode === 'encode' ? 'Texto para Codificar' : 'Base64 para Decodificar'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Digite o texto...' : 'Cole o Base64...'}
            rows={6}
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm"
          />
        </div>

        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            {mode === 'encode' ? 'Base64 Codificado' : 'Texto Decodificado'}
          </h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96 font-mono break-all">
              {output || '// Resultado aparecerÃ¡ aqui'}
            </pre>
            {output && (
              <button
                onClick={copyToClipboard}
                className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
              >
                Copiar
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Base64 Ã© usado para codificar dados binÃ¡rios em texto</li>
            <li>â€¢ Comum em emails e APIs</li>
            <li>â€¢ NÃ£o Ã© criptografia, apenas codificaÃ§Ã£o</li>
            <li>â€¢ Aumenta o tamanho do arquivo em ~33%</li>
            <li>â€¢ Ãštil para transmitir dados em URLs</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/base64')({
  component: Base64Page,
});

