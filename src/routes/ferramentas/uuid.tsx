import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

type UuidCase = 'lower' | 'upper';

function generateUUIDv4(): string {
  // Nativo do navegador, conforme RFC 4122 (v4)
  return crypto.randomUUID();
}

function formatUuid(uuid: string, hyphens: boolean, uuidCase: UuidCase): string {
  let result = hyphens ? uuid : uuid.replace(/-/g, '');
  result = uuidCase === 'upper' ? result.toUpperCase() : result.toLowerCase();
  return result;
}

export function UUIDPage() {
  const [uuids, setUuids] = useState<string[]>([generateUUIDv4()]);
  const [hyphens, setHyphens] = useState(true);
  const [uuidCase, setUuidCase] = useState<UuidCase>('lower');
  const [quantity, setQuantity] = useState(5);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const generateNew = () => {
    setUuids([generateUUIDv4(), ...uuids]);
  };

  const generateMultiple = (count: number) => {
    const newUuids = Array.from({ length: count }, () => generateUUIDv4());
    setUuids(newUuids);
  };

  const generateCustom = () => {
    const count = Math.min(Math.max(quantity, 1), 1000);
    generateMultiple(count);
  };

  const clear = () => {
    setUuids([generateUUIDv4()]);
  };

  const removeOne = (index: number) => {
    setUuids(uuids.filter((_, i) => i !== index));
  };

  const copyAll = async () => {
    const formatted = uuids.map((u) => formatUuid(u, hyphens, uuidCase)).join('\n');
    await navigator.clipboard.writeText(formatted);
    showToast('Todos os UUIDs copiados!');
  };

  const copyOne = async (uuid: string) => {
    await navigator.clipboard.writeText(formatUuid(uuid, hyphens, uuidCase));
    showToast('UUID copiado!');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const content = uuids.map((u) => formatUuid(u, hyphens, uuidCase)).join('\n');
    downloadFile(content, 'uuids.txt', 'text/plain;charset=utf-8');
    showToast('Arquivo TXT baixado!');
  };

  const downloadCsv = () => {
    const header = 'index,uuid';
    const rows = uuids.map((u, i) => `${i + 1},${formatUuid(u, hyphens, uuidCase)}`);
    const content = [header, ...rows].join('\n');
    downloadFile(content, 'uuids.csv', 'text/csv;charset=utf-8');
    showToast('Arquivo CSV baixado!');
  };

  const totalChars = hyphens ? 36 : 32;

  return (
    <ToolLayout
      title="UUID"
      description="Gerador de UUIDs (Universally Unique Identifiers)."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        {/* Opções de formato */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
          <label className="flex items-center gap-2 text-sm text-[#94a3b8]">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="accent-[#00d4ff]"
            />
            Com hífens
          </label>

          <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
            <span>Caixa:</span>
            <button
              onClick={() => setUuidCase('lower')}
              className={`rounded px-2 py-1 transition-all ${
                uuidCase === 'lower'
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                  : 'hover:bg-[#161f30]'
              }`}
            >
              minúsculas
            </button>
            <button
              onClick={() => setUuidCase('upper')}
              className={`rounded px-2 py-1 transition-all ${
                uuidCase === 'upper'
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                  : 'hover:bg-[#161f30]'
              }`}
            >
              MAIÚSCULAS
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
            <span>Quantidade:</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded border border-[#161f30] bg-[#0f1526] px-2 py-1 text-[#f8fafc] outline-none focus:border-[#00d4ff]"
            />
            <button
              onClick={generateCustom}
              className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
            >
              Gerar
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateNew}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            + Gerar Novo
          </button>
          <button
            onClick={() => generateMultiple(5)}
            className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-4 py-2 text-sm text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20"
          >
            Gerar 5
          </button>
          <button
            onClick={() => generateMultiple(10)}
            className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-4 py-2 text-sm text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20"
          >
            Gerar 10
          </button>
          <button
            onClick={copyAll}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Copiar Todos
          </button>
          <button
            onClick={downloadTxt}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Baixar TXT
          </button>
          <button
            onClick={downloadCsv}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Baixar CSV
          </button>
          <button
            onClick={clear}
            className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
          >
            Limpar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">UUIDs gerados</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{uuids.length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Versão</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">v4</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Caracteres</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{totalChars}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Bits</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">128</div>
          </div>
        </div>

        {/* Lista de UUIDs */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            UUIDs Gerados ({uuids.length})
          </h3>

          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={uuid}
                className="flex items-center justify-between rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
              >
                <code className="font-mono text-sm text-[#3ddc97]">
                  {formatUuid(uuid, hyphens, uuidCase)}
                </code>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyOne(uuid)}
                    className="rounded px-3 py-1 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/10"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => removeOne(index)}
                    className="rounded px-3 py-1 text-sm text-[#f87171] transition-all hover:bg-[#f87171]/10"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• UUID v4 é gerado aleatoriamente</li>
            <li>• Praticamente impossível haver duplicatas</li>
            <li>• Usado como chave primária em bancos de dados</li>
            <li>• Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</li>
            <li>• Cada UUID possui 128 bits (36 caracteres com hífens)</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/uuid')({
  component: UUIDPage,
});
