import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UUIDPage() {
  const [uuids, setUuids] = useState<string[]>([generateUUIDv4()]);

  const generateNew = () => {
    setUuids([...uuids, generateUUIDv4()]);
  };

  const generateMultiple = (count: number) => {
    const newUuids = Array.from({ length: count }, () => generateUUIDv4());
    setUuids(newUuids);
  };

  const clear = () => {
    setUuids([generateUUIDv4()]);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    alert('Todos os UUIDs copiados!');
  };

  const copyOne = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    alert('UUID copiado!');
  };

  return (
    <ToolLayout
      title="UUID"
      description="Gerador de UUIDs (Universally Unique Identifiers)."
    >
      <div className="space-y-8">
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
            onClick={clear}
            className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
          >
            Limpar
          </button>
        </div>

        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            UUIDs Gerados ({uuids.length})
          </h3>

          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
              >
                <code className="font-mono text-sm text-[#3ddc97]">{uuid}</code>
                <button
                  onClick={() => copyOne(uuid)}
                  className="rounded px-3 py-1 text-sm text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ UUID v4 Ã© gerado aleatoriamente</li>
            <li>â€¢ Praticamente impossÃ­vel ter duplicatas</li>
            <li>â€¢ Usado em bancos de dados como chaves primÃ¡rias</li>
            <li>â€¢ Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</li>
            <li>â€¢ Cada UUID tem 128 bits (36 caracteres com hÃ­fens)</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/uuid')({
  component: UUIDPage,
});

