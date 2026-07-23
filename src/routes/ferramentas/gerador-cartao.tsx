import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

type Quantity = 1 | 5 | 10 | 50 | 100;
type Brand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'ELO' | 'ALEATORIA';
type CardKind = 'CREDITO' | 'DEBITO';

const QUANTITIES: Quantity[] = [1, 5, 10, 50, 100];

interface BrandConfig {
  id: Exclude<Brand, 'ALEATORIA'>;
  label: string;
  prefixes: string[];
  length: number;
  cvvLength: number;
}

const BRANDS: BrandConfig[] = [
  { id: 'VISA', label: 'Visa', prefixes: ['4'], length: 16, cvvLength: 3 },
  {
    id: 'MASTERCARD',
    label: 'Mastercard',
    prefixes: ['51', '52', '53', '54', '55'],
    length: 16,
    cvvLength: 3,
  },
  { id: 'AMEX', label: 'American Express', prefixes: ['34', '37'], length: 15, cvvLength: 4 },
  {
    id: 'ELO',
    label: 'Elo',
    prefixes: ['636368', '438935', '504175', '451416', '636297'],
    length: 16,
    cvvLength: 3,
  },
];

interface GeneratedCard {
  id: string;
  brand: string;
  kind: CardKind;
  digits: string;
  formatted: string;
  cvv: string;
  expiry: string;
}

function luhnCheckDigit(digitsWithoutCheck: number[]): number {
  let sum = 0;
  let alternate = true;
  for (let i = digitsWithoutCheck.length - 1; i >= 0; i--) {
    let d = digitsWithoutCheck[i];
    if (alternate) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alternate = !alternate;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

function generateCardDigits(config: BrandConfig): string {
  const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
  const digits = prefix.split('').map(Number);
  while (digits.length < config.length - 1) digits.push(Math.floor(Math.random() * 10));
  digits.push(luhnCheckDigit(digits));
  return digits.join('');
}

function formatCardNumber(digits: string, brandId: string): string {
  if (brandId === 'AMEX') {
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function generateCvv(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generateExpiry(): string {
  const now = new Date();
  const monthsAhead = 6 + Math.floor(Math.random() * 54); // 6 a 60 meses no futuro
  const future = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
  const mm = String(future.getMonth() + 1).padStart(2, '0');
  const yy = String(future.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

export function GeradorCartaoPage() {
  const [brand, setBrand] = useState<Brand>('ALEATORIA');
  const [kind, setKind] = useState<CardKind>('CREDITO');
  const [quantity, setQuantity] = useState<Quantity>(10);
  const [includeCvvExpiry, setIncludeCvvExpiry] = useState(true);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const pickBrand = (): BrandConfig => {
    if (brand === 'ALEATORIA') return BRANDS[Math.floor(Math.random() * BRANDS.length)];
    return BRANDS.find((b) => b.id === brand)!;
  };

  const generate = () => {
    const seen = new Set<string>();
    const result: GeneratedCard[] = [];

    while (result.length < quantity) {
      const config = pickBrand();
      const digits = generateCardDigits(config);
      if (seen.has(digits)) continue;
      seen.add(digits);
      result.push({
        id: `${Date.now()}-${result.length}`,
        brand: config.label,
        kind,
        digits,
        formatted: formatCardNumber(digits, config.id),
        cvv: generateCvv(config.cvvLength),
        expiry: generateExpiry(),
      });
    }

    setCards(result);
  };

  const cardLine = (c: GeneratedCard) =>
    includeCvvExpiry ? `${c.formatted} | Validade: ${c.expiry} | CVV: ${c.cvv} | ${c.kind}` : c.formatted;

  const copyAll = async () => {
    if (cards.length === 0) return showToast('Gere cartões primeiro.');
    await navigator.clipboard.writeText(cards.map(cardLine).join('\n'));
    showToast('Todos copiados!');
  };

  const copyOne = async (c: GeneratedCard) => {
    await navigator.clipboard.writeText(cardLine(c));
    showToast('Copiado!');
  };

  const clearAll = () => setCards([]);

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
    if (cards.length === 0) return showToast('Gere cartões primeiro.');
    downloadFile(cards.map(cardLine).join('\n'), 'cartoes-teste.txt', 'text/plain;charset=utf-8');
    showToast('TXT baixado!');
  };

  const downloadCsv = () => {
    if (cards.length === 0) return showToast('Gere cartões primeiro.');
    const header = 'bandeira,tipo,numero,validade,cvv';
    const rows = cards.map((c) => `${c.brand},${c.kind},${c.formatted},${c.expiry},${c.cvv}`);
    downloadFile([header, ...rows].join('\n'), 'cartoes-teste.csv', 'text/csv;charset=utf-8');
    showToast('CSV baixado!');
  };

  const downloadJson = () => {
    if (cards.length === 0) return showToast('Gere cartões primeiro.');
    const payload = cards.map((c) => ({
      bandeira: c.brand,
      tipo: c.kind,
      numero: c.formatted,
      validade: c.expiry,
      cvv: c.cvv,
    }));
    downloadFile(JSON.stringify(payload, null, 2), 'cartoes-teste.json', 'application/json;charset=utf-8');
    showToast('JSON baixado!');
  };

  return (
    <ToolLayout
      title="Gerador de Cartão de Crédito/Débito"
      description="Gere números de cartão fictícios, válidos pelo algoritmo de Luhn, para testes de sistemas."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        <div className="rounded-lg border border-[#f87171] bg-[#f87171]/10 p-4 text-sm text-[#f87171]">
          ⚠ <strong>Números 100% fictícios.</strong> Passam apenas no checksum de Luhn (o mesmo teste
          que valida o formato de um cartão real) — não estão associados a nenhuma conta, banco ou
          pessoa. Não funcionam em nenhum gateway de pagamento real, que sempre valida contra a base
          do emissor. Uso exclusivo para testar formulários, validações de frontend e bancos de dados
          de homologação.
        </div>

        {/* Opções */}
        <div className="space-y-4 rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-32 text-sm text-[#94a3b8]">Bandeira</span>
            {(['ALEATORIA', ...BRANDS.map((b) => b.id)] as Brand[]).map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  brand === b
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#161f30] bg-[#0f1526] text-[#94a3b8] hover:bg-[#161f30]'
                }`}
              >
                {b === 'ALEATORIA' ? 'Aleatória' : BRANDS.find((x) => x.id === b)?.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-32 text-sm text-[#94a3b8]">Tipo</span>
            {(['CREDITO', 'DEBITO'] as CardKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  kind === k
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#161f30] bg-[#0f1526] text-[#94a3b8] hover:bg-[#161f30]'
                }`}
              >
                {k === 'CREDITO' ? 'Crédito' : 'Débito'}
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
              checked={includeCvvExpiry}
              onChange={(e) => setIncludeCvvExpiry(e.target.checked)}
              className="accent-[#00d4ff]"
            />
            Incluir CVV e validade fictícios
          </label>

          <button
            onClick={generate}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Gerar {quantity === 1 ? '1 cartão' : `${quantity} cartões`}
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
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{cards.length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Bandeira</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">
              {brand === 'ALEATORIA' ? 'Aleatória' : BRANDS.find((b) => b.id === brand)?.label}
            </div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Tipo</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{kind === 'CREDITO' ? 'Crédito' : 'Débito'}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Checksum</div>
            <div className="mt-1 font-mono text-lg text-[#3ddc97]">Luhn ✓</div>
          </div>
        </div>

        {/* Lista */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Cartões Gerados ({cards.length})
          </h3>
          {cards.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Nenhum cartão gerado ainda.</p>
          ) : (
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-[#00d4ff]/10 px-2 py-1 text-xs font-semibold text-[#00d4ff]">
                      {c.brand}
                    </span>
                    <span className="rounded bg-[#94a3b8]/10 px-2 py-1 text-xs text-[#94a3b8]">
                      {c.kind === 'CREDITO' ? 'Crédito' : 'Débito'}
                    </span>
                    <code className="font-mono text-sm text-[#f8fafc]">{c.formatted}</code>
                    {includeCvvExpiry && (
                      <span className="font-mono text-xs text-[#94a3b8]">
                        Val: {c.expiry} · CVV: {c.cvv}
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
            <li>• Os prefixos seguem o padrão real de cada bandeira (ex: Visa começa com 4)</li>
            <li>• O último dígito é sempre calculado para passar no algoritmo de Luhn</li>
            <li>• CVV e validade são gerados aleatoriamente, sem relação com o número do cartão</li>
            <li>• Use apenas em ambientes de desenvolvimento, QA ou sandbox — nunca em produção</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/gerador-cartao')({
  component: GeradorCartaoPage,
});
