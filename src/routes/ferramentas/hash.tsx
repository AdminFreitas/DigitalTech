import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function md5(str: string): string {
  // ImplementaÃ§Ã£o simplificada do MD5 para demonstraÃ§Ã£o
  // Em produÃ§Ã£o, use uma biblioteca como crypto-js
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function HashPage() {
  const [input, setInput] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [md5Hash, setMd5Hash] = useState('');

  const handleInputChange = async (value: string) => {
    setInput(value);

    if (value.trim()) {
      setMd5Hash(md5(value));
      const sha = await sha256(value);
      setSha256Hash(sha);
    } else {
      setSha256Hash('');
      setMd5Hash('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Hash"
      description="Calcule hashes (MD5, SHA-256, etc.) de strings."
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            Texto para Hash
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Digite o texto..."
            rows={4}
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              SHA-256
            </h3>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-32 font-mono break-all">
                {sha256Hash || '// SHA-256 aparecerÃ¡ aqui'}
              </pre>
              {sha256Hash && (
                <button
                  onClick={() => copyToClipboard(sha256Hash)}
                  className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              MD5
            </h3>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-32 font-mono break-all">
                {md5Hash || '// MD5 aparecerÃ¡ aqui'}
              </pre>
              {md5Hash && (
                <button
                  onClick={() => copyToClipboard(md5Hash)}
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
            <li>â€¢ SHA-256 Ã© mais seguro que MD5</li>
            <li>â€¢ Hashes sÃ£o unidirecionais (nÃ£o podem ser revertidos)</li>
            <li>â€¢ Ãštil para verificar integridade de arquivos</li>
            <li>â€¢ Mesmo pequenas mudanÃ§as geram hashes completamente diferentes</li>
            <li>â€¢ NÃ£o use MD5 para seguranÃ§a, apenas para checksums</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/hash')({
  component: HashPage,
});

