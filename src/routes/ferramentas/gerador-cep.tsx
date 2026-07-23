import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

type Quantity = 1 | 5 | 10 | 50 | 100;

const QUANTITIES: Quantity[] = [1, 5, 10, 50, 100];

interface UfRange {
  uf: string;
  name: string;
  ranges: [number, number][];
}

// Faixas numéricas oficiais de CEP por estado (Correios). Uma faixa cobre
// milhões de combinações, mas nem toda combinação corresponde a um endereço
// hoje atribuído — por isso a opção de verificação via ViaCEP abaixo.
const UF_RANGES: UfRange[] = [
  { uf: 'SP', name: 'São Paulo', ranges: [[1000000, 19999999]] },
  { uf: 'RJ', name: 'Rio de Janeiro', ranges: [[20000000, 28999999]] },
  { uf: 'ES', name: 'Espírito Santo', ranges: [[29000000, 29999999]] },
  { uf: 'MG', name: 'Minas Gerais', ranges: [[30000000, 39999999]] },
  { uf: 'BA', name: 'Bahia', ranges: [[40000000, 48999999]] },
  { uf: 'SE', name: 'Sergipe', ranges: [[49000000, 49999999]] },
  { uf: 'PE', name: 'Pernambuco', ranges: [[50000000, 56999999]] },
  { uf: 'AL', name: 'Alagoas', ranges: [[57000000, 57999999]] },
  { uf: 'PB', name: 'Paraíba', ranges: [[58000000, 58999999]] },
  { uf: 'RN', name: 'Rio Grande do Norte', ranges: [[59000000, 59999999]] },
  { uf: 'CE', name: 'Ceará', ranges: [[60000000, 63999999]] },
  { uf: 'PI', name: 'Piauí', ranges: [[64000000, 64999999]] },
  { uf: 'MA', name: 'Maranhão', ranges: [[65000000, 65999999]] },
  { uf: 'PA', name: 'Pará', ranges: [[66000000, 68899999]] },
  { uf: 'AP', name: 'Amapá', ranges: [[68900000, 68999999]] },
  { uf: 'AM', name: 'Amazonas', ranges: [[69000000, 69299999], [69400000, 69899999]] },
  { uf: 'RR', name: 'Roraima', ranges: [[69300000, 69399999]] },
  { uf: 'AC', name: 'Acre', ranges: [[69900000, 69999999]] },
  { uf: 'DF', name: 'Distrito Federal', ranges: [[70000000, 72799999], [73000000, 73699999]] },
  { uf: 'GO', name: 'Goiás', ranges: [[72800000, 72999999], [73700000, 76799999]] },
  { uf: 'RO', name: 'Rondônia', ranges: [[76800000, 76999999]] },
  { uf: 'TO', name: 'Tocantins', ranges: [[77000000, 77999999]] },
  { uf: 'MT', name: 'Mato Grosso', ranges: [[78000000, 78899999]] },
  { uf: 'MS', name: 'Mato Grosso do Sul', ranges: [[79000000, 79999999]] },
  { uf: 'PR', name: 'Paraná', ranges: [[80000000, 87999999]] },
  { uf: 'SC', name: 'Santa Catarina', ranges: [[88000000, 89999999]] },
  { uf: 'RS', name: 'Rio Grande do Sul', ranges: [[90000000, 99999999]] },
];

interface GeneratedCep {
  id: string;
  uf: string;
  digits: string;
  formatted: string;
  checked: boolean;
  exists: boolean | null;
  address: string | null;
}

function formatCep(digits: string): string {
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function randomCepForUf(uf: UfRange): string {
  const range = uf.ranges[Math.floor(Math.random() * uf.ranges.length)];
  const [min, max] = range;
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(value).padStart(8, '0');
}

async function checkViaCep(digits: string): Promise<{ exists: boolean; address: string | null }> {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return { exists: false, address: null };
    const data = await response.json();
    if (data.erro) return { exists: false, address: null };
    const address = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean).join(', ');
    return { exists: true, address: address || null };
  } catch {
    return { exists: false, address: null };
  }
}

export function GeradorCepPage() {
  const [ufFilter, setUfFilter] = useState<string>('ALEATORIO');
  const [quantity, setQuantity] = useState<Quantity>(10);
  const [verify, setVerify] = useState(false);
  const [ceps, setCeps] = useState<GeneratedCep[]>([]);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const pickUf = (): UfRange => {
    if (ufFilter === 'ALEATORIO') return UF_RANGES[Math.floor(Math.random() * UF_RANGES.length)];
    return UF_RANGES.find((u) => u.uf === ufFilter) ?? UF_RANGES[0];
  };

  const generate = async () => {
    setGenerating(true);
    const seen = new Set<string>();
    const result: GeneratedCep[] = [];

    if (!verify) {
      while (result.length < quantity) {
        const uf = pickUf();
        const digits = randomCepForUf(uf);
        if (seen.has(digits)) continue;
        seen.add(digits);
        result.push({
          id: `${Date.now()}-${result.length}`,
          uf: uf.uf,
          digits,
          formatted: formatCep(digits),
          checked: false,
          exists: null,
          address: null,
        });
      }
      setCeps(result);
      setGenerating(false);
      return;
    }

    // Modo com verificação real via ViaCEP — sequencial, com tentativas por item
    const maxAttemptsPerItem = 8;
    for (let i = 0; i < quantity; i++) {
      let attempt = 0;
      let found = false;
      while (attempt < maxAttemptsPerItem && !found) {
        const uf = pickUf();
        const digits = randomCepForUf(uf);
        attempt++;
        if (seen.has(digits)) continue;
        const check = await checkViaCep(digits);
        if (check.exists) {
          seen.add(digits);
          result.push({
            id: `${Date.now()}-${i}`,
            uf: uf.uf,
            digits,
            formatted: formatCep(digits),
            checked: true,
            exists: true,
            address: check.address,
          });
          found = true;
        }
      }
      if (!found) {
        // não encontrou um CEP real após as tentativas: inclui mesmo assim, marcado como não confirmado
        const uf = pickUf();
        const digits = randomCepForUf(uf);
        result.push({
          id: `${Date.now()}-${i}-fallback`,
          uf: uf.uf,
          digits,
          formatted: formatCep(digits),
          checked: true,
          exists: false,
          address: null,
        });
      }
    }

    setCeps(result);
    setGenerating(false);
  };

  const copyAll = async () => {
    if (ceps.length === 0) return showToast('Gere CEPs primeiro.');
    await navigator.clipboard.writeText(ceps.map((c) => c.formatted).join('\n'));
    showToast('Todos copiados!');
  };

  const copyOne = async (cep: GeneratedCep) => {
    await navigator.clipboard.writeText(cep.formatted);
    showToast('Copiado!');
  };

  const clearAll = () => setCeps([]);

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
    if (ceps.length === 0) return showToast('Gere CEPs primeiro.');
    downloadFile(ceps.map((c) => c.formatted).join('\n'), 'ceps.txt', 'text/plain;charset=utf-8');
    showToast('TXT baixado!');
  };

  const downloadCsv = () => {
    if (ceps.length === 0) return showToast('Gere CEPs primeiro.');
    const header = 'cep,uf,verificado,endereco_encontrado,endereco';
    const rows = ceps.map(
      (c) =>
        `${c.formatted},${c.uf},${c.checked ? 'sim' : 'nao'},${c.exists ? 'sim' : 'nao'},"${c.address ?? ''}"`
    );
    downloadFile([header, ...rows].join('\n'), 'ceps.csv', 'text/csv;charset=utf-8');
    showToast('CSV baixado!');
  };

  const downloadJson = () => {
    if (ceps.length === 0) return showToast('Gere CEPs primeiro.');
    const payload = ceps.map((c) => ({
      cep: c.formatted,
      uf: c.uf,
      verificado: c.checked,
      existe: c.exists,
      endereco: c.address,
    }));
    downloadFile(JSON.stringify(payload, null, 2), 'ceps.json', 'application/json;charset=utf-8');
    showToast('JSON baixado!');
  };

  return (
    <ToolLayout
      title="Gerador de CEP"
      description="Gere CEPs dentro da faixa oficial de cada estado, com verificação opcional de existência real."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        <div className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 p-4 text-sm text-[#e8b86d]">
          ⚠ CEP não tem dígito verificador — validade depende de estar atribuído pelo Correios. Sem
          verificação, os CEPs abaixo respeitam a faixa numérica oficial do estado, mas podem não
          corresponder a um endereço existente hoje. Ative "Verificar existência real" para confirmar
          via ViaCEP (mais lento, consulta externa).
        </div>

        {/* Opções */}
        <div className="space-y-4 rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-32 text-sm text-[#94a3b8]">Estado (UF)</span>
            <select
              value={ufFilter}
              onChange={(e) => setUfFilter(e.target.value)}
              className="rounded-lg border border-[#161f30] bg-[#0f1526] px-3 py-1.5 text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
            >
              <option value="ALEATORIO">Aleatório (todos os estados)</option>
              {UF_RANGES.map((u) => (
                <option key={u.uf} value={u.uf}>
                  {u.uf} — {u.name}
                </option>
              ))}
            </select>
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
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
              className="accent-[#00d4ff]"
            />
            Verificar existência real via ViaCEP (mais lento, requer internet)
          </label>

          <button
            onClick={generate}
            disabled={generating}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20 disabled:opacity-50"
          >
            {generating ? 'Gerando...' : `Gerar ${quantity === 1 ? '1 CEP' : `${quantity} CEPs`}`}
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
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{ceps.length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Verificados</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{ceps.filter((c) => c.checked).length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Confirmados reais</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{ceps.filter((c) => c.exists).length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Estado</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">
              {ufFilter === 'ALEATORIO' ? 'Todos' : ufFilter}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            CEPs Gerados ({ceps.length})
          </h3>
          {ceps.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Nenhum CEP gerado ainda.</p>
          ) : (
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {ceps.map((c) => (
                <div key={c.id} className="rounded-lg border border-[#161f30] bg-[#0b1020] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-[#00d4ff]/10 px-2 py-1 text-xs font-semibold text-[#00d4ff]">
                        {c.uf}
                      </span>
                      <code className="font-mono text-sm text-[#f8fafc]">{c.formatted}</code>
                      {c.checked && (
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            c.exists ? 'bg-[#3ddc97]/10 text-[#3ddc97]' : 'bg-[#f87171]/10 text-[#f87171]'
                          }`}
                        >
                          {c.exists ? '✓ confirmado' : '✕ não encontrado'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyOne(c)}
                      className="rounded px-3 py-1 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/10"
                    >
                      Copiar
                    </button>
                  </div>
                  {c.address && <div className="mt-1 text-xs text-[#94a3b8]">{c.address}</div>}
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
            <li>• Sem verificação, a geração é instantânea e respeita a faixa oficial do estado</li>
            <li>• Com verificação, cada CEP é conferido na base pública do ViaCEP (pode demorar em lotes grandes)</li>
            <li>• CEPs "não encontrados" mesmo após tentativas ficam marcados, mas continuam com formato válido</li>
            <li>• Ideal para preencher formulários e bancos de dados de teste com endereços plausíveis</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/gerador-cep')({
  component: GeradorCepPage,
});
