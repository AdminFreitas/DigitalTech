import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

type GenType = 'CPF' | 'CNPJ' | 'MISTO';
type Quantity = 1 | 5 | 10 | 50 | 100;

interface GeneratedDoc {
  id: string;
  type: 'CPF' | 'CNPJ';
  digits: string;
  formatted: string;
}

const QUANTITIES: Quantity[] = [1, 5, 10, 50, 100];

function formatCpf(digits: string): string {
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCnpj(digits: string): string {
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function computeCpfDigit(nums: number[], startWeight: number): number {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) sum += nums[i] * (startWeight - i);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function generateCpfDigits(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1 = computeCpfDigit(base, 10);
  const d2 = computeCpfDigit([...base, d1], 11);
  return [...base, d1, d2].join('');
}

function computeCnpjDigit(nums: number[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) sum += nums[i] * weights[i];
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function generateCnpjDigits(): string {
  const raiz = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const ordem = [0, 0, 0, 1];
  const base = [...raiz, ...ordem];
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = computeCnpjDigit(base, w1);
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d2 = computeCnpjDigit([...base, d1], w2);
  return [...base, d1, d2].join('');
}

export function GeradorCpfCnpjPage() {
  const [type, setType] = useState<GenType>('CPF');
  const [quantity, setQuantity] = useState<Quantity>(10);
  const [formatted, setFormatted] = useState(true);
  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const generate = () => {
    const seen = new Set<string>();
    const result: GeneratedDoc[] = [];

    while (result.length < quantity) {
      const chosenType: 'CPF' | 'CNPJ' =
        type === 'MISTO' ? (Math.random() < 0.5 ? 'CPF' : 'CNPJ') : type;
      const digits = chosenType === 'CPF' ? generateCpfDigits() : generateCnpjDigits();
      const key = `${chosenType}-${digits}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: `${Date.now()}-${result.length}`,
        type: chosenType,
        digits,
        formatted: chosenType === 'CPF' ? formatCpf(digits) : formatCnpj(digits),
      });
    }

    setDocs(result);
  };

  const displayValue = (doc: GeneratedDoc) => (formatted ? doc.formatted : doc.digits);

  const copyAll = async () => {
    if (docs.length === 0) return showToast('Gere documentos primeiro.');
    await navigator.clipboard.writeText(docs.map(displayValue).join('\n'));
    showToast('Todos copiados!');
  };

  const copyOne = async (doc: GeneratedDoc) => {
    await navigator.clipboard.writeText(displayValue(doc));
    showToast('Copiado!');
  };

  const clearAll = () => setDocs([]);

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
    if (docs.length === 0) return showToast('Gere documentos primeiro.');
    downloadFile(docs.map(displayValue).join('\n'), 'documentos.txt', 'text/plain;charset=utf-8');
    showToast('TXT baixado!');
  };

  const downloadCsv = () => {
    if (docs.length === 0) return showToast('Gere documentos primeiro.');
    const header = 'tipo,valor';
    const rows = docs.map((d) => `${d.type},${displayValue(d)}`);
    downloadFile([header, ...rows].join('\n'), 'documentos.csv', 'text/csv;charset=utf-8');
    showToast('CSV baixado!');
  };

  const downloadJson = () => {
    if (docs.length === 0) return showToast('Gere documentos primeiro.');
    const payload = docs.map((d) => ({ tipo: d.type, valor: displayValue(d) }));
    downloadFile(JSON.stringify(payload, null, 2), 'documentos.json', 'application/json;charset=utf-8');
    showToast('JSON baixado!');
  };

  const cpfCount = docs.filter((d) => d.type === 'CPF').length;
  const cnpjCount = docs.filter((d) => d.type === 'CNPJ').length;

  return (
    <ToolLayout
      title="Gerador de CPF e CNPJ"
      description="Gere CPFs e CNPJs matematicamente válidos em massa para popular bancos de teste."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        <div className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 p-4 text-sm text-[#e8b86d]">
          ⚠ Documentos gerados aqui são fictícios, criados apenas com fórmula matemática (módulo 11).
          Use exclusivamente para testes de sistemas — nunca para representar pessoas ou empresas reais.
        </div>

        {/* Opções */}
        <div className="space-y-4 rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-32 text-sm text-[#94a3b8]">Tipo</span>
            {(['CPF', 'CNPJ', 'MISTO'] as GenType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  type === t
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#161f30] bg-[#0f1526] text-[#94a3b8] hover:bg-[#161f30]'
                }`}
              >
                {t === 'MISTO' ? 'Misto' : t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-32 text-sm text-[#94a3b8]">Quantidade</span>
            {QUANTITIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  quantity === q
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#161f30] bg-[#0f1526] text-[#94a3b8] hover:bg-[#161f30]'
                }`}
              >
                {q === 1 ? 'Unitária' : q}
              </button>
            ))}
          </div>

          <label className="flex w-fit items-center gap-2 text-sm text-[#94a3b8]">
            <input
              type="checkbox"
              checked={formatted}
              onChange={(e) => setFormatted(e.target.checked)}
              className="accent-[#00d4ff]"
            />
            Com pontuação (000.000.000-00)
          </label>

          <button
            onClick={generate}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Gerar {quantity === 1 ? '1 documento' : `${quantity} documentos`}
          </button>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
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
            onClick={downloadJson}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Baixar JSON
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
          >
            Limpar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Total gerado</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{docs.length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">CPFs</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{cpfCount}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">CNPJs</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{cnpjCount}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Formato</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{formatted ? 'Com pontos' : 'Só números'}</div>
          </div>
        </div>

        {/* Lista */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Documentos Gerados ({docs.length})
          </h3>
          {docs.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Nenhum documento gerado ainda.</p>
          ) : (
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        d.type === 'CPF' ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'bg-[#3ddc97]/10 text-[#3ddc97]'
                      }`}
                    >
                      {d.type}
                    </span>
                    <code className="font-mono text-sm text-[#f8fafc]">{displayValue(d)}</code>
                  </div>
                  <button
                    onClick={() => copyOne(d)}
                    className="rounded px-3 py-1 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/10"
                  >
                    Copiar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• Todos os documentos passam na validação de dígito verificador (módulo 11)</li>
            <li>• A opção "Misto" gera CPFs e CNPJs aleatoriamente no mesmo lote</li>
            <li>• Documentos duplicados são automaticamente evitados dentro do mesmo lote</li>
            <li>• Ideal para popular bancos de dados de homologação/teste</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/gerador-cpf-cnpj')({
  component: GeradorCpfCnpjPage,
});
