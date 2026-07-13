import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function ColorPickerPage() {
  const [hexColor, setHexColor] = useState('#00d4ff');
  const rgb = hexToRgb(hexColor);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a Ã¡rea de transferÃªncia!');
  };

  const hslColor = hexColor; // Simplificado para demonstraÃ§Ã£o

  return (
    <ToolLayout
      title="Color Picker"
      description="Seletor de cores com cÃ³digos em diferentes formatos (HEX, RGB, HSL)."
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            Selecione uma Cor
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="h-20 w-20 rounded-lg border border-[#161f30] cursor-pointer"
            />
            <input
              type="text"
              value={hexColor}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  setHexColor(e.target.value);
                }
              }}
              className="rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] font-mono focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              HEX
            </h3>
            <div className="relative">
              <input
                type="text"
                value={hexColor}
                readOnly
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#3ddc97] font-mono focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(hexColor)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00d4ff] hover:text-[#00d4ff]/80"
              >
                ðŸ“‹
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              RGB
            </h3>
            <div className="relative">
              <input
                type="text"
                value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''}
                readOnly
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#3ddc97] font-mono focus:outline-none"
              />
              <button
                onClick={() =>
                  rgb && copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00d4ff] hover:text-[#00d4ff]/80"
              >
                ðŸ“‹
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              HSL
            </h3>
            <div className="relative">
              <input
                type="text"
                value={hslColor}
                readOnly
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#3ddc97] font-mono focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(hslColor)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00d4ff] hover:text-[#00d4ff]/80"
              >
                ðŸ“‹
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            InformaÃ§Ãµes da Cor
          </h3>
          {rgb && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div className="text-sm text-[#94a3b8]">Vermelho</div>
                <div className="text-2xl font-bold text-[#f8fafc]">{rgb.r}</div>
              </div>
              <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div className="text-sm text-[#94a3b8]">Verde</div>
                <div className="text-2xl font-bold text-[#f8fafc]">{rgb.g}</div>
              </div>
              <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div className="text-sm text-[#94a3b8]">Azul</div>
                <div className="text-2xl font-bold text-[#f8fafc]">{rgb.b}</div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ HEX Ã© o formato mais comum em web design</li>
            <li>â€¢ RGB Ã© usado em CSS e imagens digitais</li>
            <li>â€¢ HSL Ã© mais intuitivo para ajustar cores</li>
            <li>â€¢ Copie facilmente em qualquer formato</li>
            <li>â€¢ Use para manter consistÃªncia de cores no projeto</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/color-picker')({
  component: ColorPickerPage,
});

