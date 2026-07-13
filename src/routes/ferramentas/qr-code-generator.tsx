import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function QRCodeGeneratorPage() {
  const [input, setInput] = useState('https://example.com');
  const [size, setSize] = useState('200');

  const generateQRCodeUrl = () => {
    if (!input.trim()) return '';
    const encoded = encodeURIComponent(input);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  };

  const qrCodeUrl = generateQRCodeUrl();

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Erro ao baixar QR Code');
    }
  };

  return (
    <ToolLayout
      title="Gerador de QR Code"
      description="Gere cÃ³digos QR a partir de URLs ou textos."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              URL ou Texto
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite a URL ou texto..."
              rows={3}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Tamanho ({size}x{size}px)
            </label>
            <input
              type="range"
              min="100"
              max="500"
              step="50"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full"
            />
            <div className="mt-2 flex gap-2">
              {['100', '200', '300', '400', '500'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded px-3 py-1 text-sm transition-all ${
                    size === s
                      ? 'bg-[#00d4ff] text-[#0b1020]'
                      : 'border border-[#161f30] bg-[#0b1020] text-[#f8fafc] hover:border-[#00d4ff]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            QR Code Gerado
          </h3>

          {qrCodeUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border border-[#161f30] bg-white p-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="h-auto w-auto"
                  style={{ maxWidth: '300px' }}
                />
              </div>

              <button
                onClick={downloadQRCode}
                className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-6 py-2 text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20"
              >
                â¬‡ï¸ Baixar QR Code
              </button>
            </div>
          )}

          {!qrCodeUrl && (
            <p className="text-center text-[#94a3b8]">
              Digite uma URL ou texto para gerar o QR Code
            </p>
          )}
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ QR Codes podem armazenar URLs, texto, nÃºmeros de telefone, etc</li>
            <li>â€¢ Use em campanhas de marketing e publicidade</li>
            <li>â€¢ Aumente o tamanho para melhor legibilidade</li>
            <li>â€¢ Teste o QR Code antes de publicar</li>
            <li>â€¢ Funciona com qualquer leitor de QR Code</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/qr-code-generator')({
  component: QRCodeGeneratorPage,
});

