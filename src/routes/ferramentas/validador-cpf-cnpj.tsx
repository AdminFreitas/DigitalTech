import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

/* ============================================================
   TIPOS
   ============================================================ */

type DocType = 'CPF' | 'CNPJ' | null;
type Tab = 'analisar' | 'comparar' | 'lote' | 'historico';

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

interface CheckStep {
  weights: number[];
  digits: number[];
  products: number[];
  sum: number;
  rest: number;
  computedDigit: number;
  actualDigit: number;
  match: boolean;
}

interface HistoryEntry {
  id: string;
  type: 'CPF' | 'CNPJ';
  formatted: string;
  digits: string;
  valid: boolean;
  timestamp: number;
}

interface CnpjPublicData {
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  situacao_cadastral?: string | number;
  data_situacao_cadastral?: string;
  descricao_motivo_situacao_cadastral?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  data_inicio_atividade?: string;
  natureza_juridica?: string;
  descricao_porte?: string;
  porte?: string;
  capital_social?: number | string;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: { codigo: number; descricao: string }[];
  descricao_tipo_de_logradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  codigo_municipio_ibge?: number;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  ddd_fax?: string;
  email?: string;
  identificador_matriz_filial?: number;
  descricao_identificador_matriz_filial?: string;
  opcao_pelo_simples?: boolean;
  data_opcao_pelo_simples?: string;
  data_exclusao_do_simples?: string;
  opcao_pelo_mei?: boolean;
  data_opcao_pelo_mei?: string;
  data_exclusao_do_mei?: string;
  qsa?: { nome_socio?: string; qualificacao_socio?: string }[];
  [key: string]: unknown;
}

interface CepData {
  cep: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  service?: string;
  location?: { coordinates?: { longitude?: string; latitude?: string } };
}

type BatchStatus = 'pendente' | 'consultando' | 'ok' | 'erro' | 'invalido';

interface BatchResult {
  id: string;
  input: string;
  digits: string;
  type: DocType;
  formatted: string;
  valid: boolean;
  reason?: string;
  status: BatchStatus;
  data?: CnpjPublicData;
  source?: CnpjSource;
  error?: string;
}

/* ============================================================
   HELPERS — FORMATAÇÃO
   ============================================================ */

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatCpf(digits: string): string {
  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCnpj(digits: string): string {
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatDocument(digits: string): string {
  if (digits.length <= 11) return formatCpf(digits);
  return formatCnpj(digits);
}

function isAllSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

/* ============================================================
   HELPERS — VALIDAÇÃO
   ============================================================ */

function validateCpf(digits: string): ValidationResult {
  if (digits.length !== 11) return { valid: false, reason: 'CPF deve ter 11 dígitos.' };
  if (isAllSameDigit(digits)) return { valid: false, reason: 'CPF com todos os dígitos iguais é inválido.' };

  const numbers = digits.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += numbers[i] * (10 - i);
  let rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;
  if (digit1 !== numbers[9]) return { valid: false, reason: 'Primeiro dígito verificador inválido.' };

  sum = 0;
  for (let i = 0; i < 10; i++) sum += numbers[i] * (11 - i);
  rest = sum % 11;
  const digit2 = rest < 2 ? 0 : 11 - rest;
  if (digit2 !== numbers[10]) return { valid: false, reason: 'Segundo dígito verificador inválido.' };

  return { valid: true };
}

function validateCnpj(digits: string): ValidationResult {
  if (digits.length !== 14) return { valid: false, reason: 'CNPJ deve ter 14 dígitos.' };
  if (isAllSameDigit(digits)) return { valid: false, reason: 'CNPJ com todos os dígitos iguais é inválido.' };

  const numbers = digits.split('').map(Number);
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += numbers[i] * weights1[i];
  let rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;
  if (digit1 !== numbers[12]) return { valid: false, reason: 'Primeiro dígito verificador inválido.' };

  sum = 0;
  for (let i = 0; i < 13; i++) sum += numbers[i] * weights2[i];
  rest = sum % 11;
  const digit2 = rest < 2 ? 0 : 11 - rest;
  if (digit2 !== numbers[13]) return { valid: false, reason: 'Segundo dígito verificador inválido.' };

  return { valid: true };
}

/* ============================================================
   HELPERS — EXPLICAÇÃO DO ALGORITMO
   ============================================================ */

function explainCpf(digits: string): { step1: CheckStep; step2: CheckStep } | null {
  if (digits.length !== 11) return null;
  const nums = digits.split('').map(Number);

  const weights1 = Array.from({ length: 9 }, (_, i) => 10 - i);
  const products1 = nums.slice(0, 9).map((n, i) => n * weights1[i]);
  const sum1 = products1.reduce((a, b) => a + b, 0);
  const rest1 = sum1 % 11;
  const computed1 = rest1 < 2 ? 0 : 11 - rest1;

  const weights2 = Array.from({ length: 10 }, (_, i) => 11 - i);
  const products2 = nums.slice(0, 10).map((n, i) => n * weights2[i]);
  const sum2 = products2.reduce((a, b) => a + b, 0);
  const rest2 = sum2 % 11;
  const computed2 = rest2 < 2 ? 0 : 11 - rest2;

  return {
    step1: {
      weights: weights1,
      digits: nums.slice(0, 9),
      products: products1,
      sum: sum1,
      rest: rest1,
      computedDigit: computed1,
      actualDigit: nums[9],
      match: computed1 === nums[9],
    },
    step2: {
      weights: weights2,
      digits: nums.slice(0, 10),
      products: products2,
      sum: sum2,
      rest: rest2,
      computedDigit: computed2,
      actualDigit: nums[10],
      match: computed2 === nums[10],
    },
  };
}

function explainCnpj(digits: string): { step1: CheckStep; step2: CheckStep } | null {
  if (digits.length !== 14) return null;
  const nums = digits.split('').map(Number);

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const products1 = nums.slice(0, 12).map((n, i) => n * weights1[i]);
  const sum1 = products1.reduce((a, b) => a + b, 0);
  const rest1 = sum1 % 11;
  const computed1 = rest1 < 2 ? 0 : 11 - rest1;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const products2 = nums.slice(0, 13).map((n, i) => n * weights2[i]);
  const sum2 = products2.reduce((a, b) => a + b, 0);
  const rest2 = sum2 % 11;
  const computed2 = rest2 < 2 ? 0 : 11 - rest2;

  return {
    step1: {
      weights: weights1,
      digits: nums.slice(0, 12),
      products: products1,
      sum: sum1,
      rest: rest1,
      computedDigit: computed1,
      actualDigit: nums[12],
      match: computed1 === nums[12],
    },
    step2: {
      weights: weights2,
      digits: nums.slice(0, 13),
      products: products2,
      sum: sum2,
      rest: rest2,
      computedDigit: computed2,
      actualDigit: nums[13],
      match: computed2 === nums[13],
    },
  };
}

/* ============================================================
   HELPERS — GERAÇÃO DE DOCUMENTOS VÁLIDOS PARA TESTE
   ============================================================ */

function computeCpfDigit(nums: number[], startWeight: number): number {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) sum += nums[i] * (startWeight - i);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function generateValidCpf(): string {
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

function generateValidCnpj(): string {
  const raiz = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const ordem = [0, 0, 0, 1];
  const base = [...raiz, ...ordem];
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = computeCnpjDigit(base, w1);
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d2 = computeCnpjDigit([...base, d1], w2);
  return [...base, d1, d2].join('');
}

function getCnpjStructure(digits: string): { raiz: string; ordem: string; dv: string; matriz: boolean } | null {
  if (digits.length !== 14) return null;
  return {
    raiz: digits.slice(0, 8),
    ordem: digits.slice(8, 12),
    dv: digits.slice(12, 14),
    matriz: digits.slice(8, 12) === '0001',
  };
}

/* ============================================================
   HELPERS — DADOS PÚBLICOS (SOMENTE CNPJ)
   ============================================================ */

async function fetchCnpjPublicData(digits: string): Promise<CnpjPublicData> {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('CNPJ não encontrado na base pública da Receita Federal.');
    throw new Error('BrasilAPI indisponível no momento.');
  }
  return response.json();
}

export type CnpjSource = 'brasilapi' | 'minhareceita';

export const CNPJ_SOURCE_LABEL: Record<CnpjSource, string> = {
  brasilapi: 'BrasilAPI',
  minhareceita: 'Minha Receita (fallback)',
};

/**
 * Fonte alternativa: minhareceita.org é um projeto open source que publica os
 * mesmos dados abertos do CNPJ da Receita Federal, com nomes de campo muito
 * próximos aos da BrasilAPI — por isso reaproveitamos a mesma interface
 * CnpjPublicData (o `[key: string]: unknown` absorve qualquer diferença).
 * Suporte a CORS de terceiros não é garantido; qualquer falha aqui é
 * capturada e tratada pelo chamador, sem quebrar a consulta.
 */
async function fetchCnpjFromMinhaReceita(digits: string): Promise<CnpjPublicData> {
  const response = await fetch(`https://minhareceita.org/${digits}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('CNPJ não encontrado.');
    throw new Error('Minha Receita indisponível no momento.');
  }
  const data = await response.json();
  if (data && typeof data === 'object' && 'message' in data && !('razao_social' in data)) {
    throw new Error(String((data as { message?: unknown }).message ?? 'CNPJ não encontrado.'));
  }
  return data as CnpjPublicData;
}

/** Tenta a BrasilAPI primeiro; se falhar por qualquer motivo, tenta a Minha Receita antes de desistir. */
async function fetchCnpjPublicDataWithFallback(digits: string): Promise<{ data: CnpjPublicData; source: CnpjSource }> {
  try {
    const data = await fetchCnpjPublicData(digits);
    return { data, source: 'brasilapi' };
  } catch (primaryError) {
    try {
      const data = await fetchCnpjFromMinhaReceita(digits);
      return { data, source: 'minhareceita' };
    } catch {
      throw primaryError; // erro da fonte principal costuma ser mais específico (ex.: "não encontrado")
    }
  }
}

interface CnaeData {
  codigo: number | string;
  descricao: string;
}

async function fetchCnaeData(codigo: string): Promise<CnaeData> {
  const response = await fetch(`https://brasilapi.com.br/api/cnae/v1/${codigo}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Código CNAE não encontrado.');
    throw new Error('Não foi possível consultar o CNAE agora.');
  }
  return response.json();
}

interface DddData {
  state: string;
  cities: string[];
}

async function fetchDddData(ddd: string): Promise<DddData> {
  const response = await fetch(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('DDD não encontrado.');
    throw new Error('Não foi possível consultar o DDD agora.');
  }
  return response.json();
}

/**
 * Consulta CEP via BrasilAPI (endpoint v2), que já faz fallback automático
 * entre provedores públicos (ViaCEP, Correios etc.) e retorna geolocalização.
 * Usado para conferir/enriquecer o endereço público de um CNPJ.
 */
async function fetchCepData(cep: string): Promise<CepData> {
  const digits = onlyDigits(cep).slice(0, 8);
  if (digits.length !== 8) throw new Error('CEP deve ter 8 dígitos.');
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('CEP não encontrado.');
    throw new Error('Não foi possível consultar o CEP agora.');
  }
  return response.json();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function formatCurrency(value: number | string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return null;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const BATCH_LIMIT = 50;

/** Aceita CPFs/CNPJs separados por quebra de linha, vírgula, ponto e vírgula ou espaço. */
function parseBatchInput(text: string): string[] {
  const tokens = text
    .split(/[\n,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const token of tokens) {
    const digits = onlyDigits(token);
    if (!digits || seen.has(digits)) continue;
    seen.add(digits);
    unique.push(token);
  }
  return unique;
}

/* ============================================================
   HELPERS — HISTÓRICO (localStorage)
   ============================================================ */

const HISTORY_KEY = 'digitaltech:doc-analyzer:history';

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // localStorage indisponível (modo privado, quota excedida) — falha silenciosa
  }
}

/* ============================================================
   SUBCOMPONENTES DE APRESENTAÇÃO
   ============================================================ */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
      <div className="text-xs text-[#94a3b8]">{label}</div>
      <div className="mt-1 truncate font-mono text-lg text-[#f8fafc]">{value}</div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
      <div className="text-xs text-[#94a3b8]">{label}</div>
      <div className="mt-1 font-mono text-sm text-[#f8fafc]">{String(value)}</div>
    </div>
  );
}

function CheckStepTable({ title, step }: { title: string; step: CheckStep }) {
  return (
    <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
      <div className="mb-2 text-xs font-semibold text-[#94a3b8]">{title}</div>
      <div className="flex flex-wrap gap-1 font-mono text-xs text-[#f8fafc]">
        {step.digits.map((d, i) => (
          <span key={i} className="rounded border border-[#161f30] bg-[#0f1526] px-2 py-1">
            {d}×{step.weights[i]}={step.products[i]}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-[#94a3b8]">
        Soma = {step.sum} → resto (÷11) = {step.rest} → dígito calculado ={' '}
        <span className="font-mono text-[#00d4ff]">{step.computedDigit}</span> · dígito informado ={' '}
        <span className="font-mono text-[#00d4ff]">{step.actualDigit}</span>{' '}
        <span className={step.match ? 'text-[#3ddc97]' : 'text-[#f87171]'}>
          {step.match ? '✓ confere' : '✕ não confere'}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export function ValidadorCpfCnpjPage() {
  const [tab, setTab] = useState<Tab>('analisar');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  /* ---------- Analisar ---------- */
  const [input, setInput] = useState('');
  const [cnpjData, setCnpjData] = useState<CnpjPublicData | null>(null);
  const [cnpjSource, setCnpjSource] = useState<CnpjSource | null>(null);
  const [cnpjFromCache, setCnpjFromCache] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Cache de consultas da sessão (em memória — some ao recarregar a página).
  // Evita bater de novo na API pública para o mesmo CNPJ/CNAE/DDD.
  const cnpjCacheRef = useRef<Map<string, { data: CnpjPublicData; source: CnpjSource }>>(new Map());
  const cnaeCacheRef = useRef<Map<string, CnaeData>>(new Map());
  const dddCacheRef = useRef<Map<string, DddData>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  const limparCache = () => {
    cnpjCacheRef.current.clear();
    cnaeCacheRef.current.clear();
    dddCacheRef.current.clear();
    setCacheSize(0);
    showToast('Cache da sessão limpo.');
  };

  /* ---------- Consultas auxiliares (CNAE / DDD) ---------- */
  const [cnaeCode, setCnaeCode] = useState('');
  const [cnaeResult, setCnaeResult] = useState<CnaeData | null>(null);
  const [cnaeLoading, setCnaeLoading] = useState(false);
  const [cnaeError, setCnaeError] = useState<string | null>(null);

  const buscarCnae = async () => {
    const code = cnaeCode.trim();
    if (!code) return;
    setCnaeError(null);
    const cached = cnaeCacheRef.current.get(code);
    if (cached) {
      setCnaeResult(cached);
      return;
    }
    setCnaeLoading(true);
    setCnaeResult(null);
    try {
      const data = await fetchCnaeData(code);
      cnaeCacheRef.current.set(code, data);
      setCacheSize(cnpjCacheRef.current.size + cnaeCacheRef.current.size + dddCacheRef.current.size);
      setCnaeResult(data);
    } catch (err) {
      setCnaeError(err instanceof Error ? err.message : 'Erro ao consultar CNAE.');
    } finally {
      setCnaeLoading(false);
    }
  };

  const [dddCode, setDddCode] = useState('');
  const [dddResult, setDddResult] = useState<DddData | null>(null);
  const [dddLoading, setDddLoading] = useState(false);
  const [dddError, setDddError] = useState<string | null>(null);

  const buscarDdd = async () => {
    const code = onlyDigits(dddCode).slice(0, 2);
    if (code.length !== 2) {
      setDddError('DDD deve ter 2 dígitos.');
      return;
    }
    setDddError(null);
    const cached = dddCacheRef.current.get(code);
    if (cached) {
      setDddResult(cached);
      return;
    }
    setDddLoading(true);
    setDddResult(null);
    try {
      const data = await fetchDddData(code);
      dddCacheRef.current.set(code, data);
      setCacheSize(cnpjCacheRef.current.size + cnaeCacheRef.current.size + dddCacheRef.current.size);
      setDddResult(data);
    } catch (err) {
      setDddError(err instanceof Error ? err.message : 'Erro ao consultar DDD.');
    } finally {
      setDddLoading(false);
    }
  };

  const digits = useMemo(() => onlyDigits(input), [input]);
  const docType: DocType = useMemo(() => {
    if (digits.length === 0) return null;
    return digits.length <= 11 ? 'CPF' : 'CNPJ';
  }, [digits]);
  const result = useMemo(() => {
    if (digits.length === 0) return null;
    return docType === 'CPF' ? validateCpf(digits) : validateCnpj(digits);
  }, [digits, docType]);
  const formatted = useMemo(() => formatDocument(digits), [digits]);
  const cpfSteps = useMemo(() => (docType === 'CPF' ? explainCpf(digits) : null), [digits, docType]);
  const cnpjSteps = useMemo(() => (docType === 'CNPJ' ? explainCnpj(digits) : null), [digits, docType]);
  const cnpjStructure = useMemo(() => (docType === 'CNPJ' ? getCnpjStructure(digits) : null), [digits, docType]);

  // Preenche a partir de ?cnpj= na URL (link compartilhado)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('cnpj');
    if (shared) setInput(onlyDigits(shared));
  }, []);

  const handleChange = (value: string) => {
    setInput(onlyDigits(value).slice(0, 14));
    setCnpjData(null);
    setCnpjSource(null);
    setCnpjFromCache(false);
    setCnpjError(null);
    setQrUrl(null);
    setCepData(null);
    setCepError(null);
  };

  const clearAll = () => {
    setInput('');
    setCnpjData(null);
    setCnpjSource(null);
    setCnpjFromCache(false);
    setCnpjError(null);
    setQrUrl(null);
    setCepData(null);
    setCepError(null);
  };

  const copyFormatted = async () => {
    if (!formatted) return showToast('Nada para copiar.');
    await navigator.clipboard.writeText(formatted);
    showToast('Documento copiado!');
  };

  const fillExampleCpf = () => handleChange(generateValidCpf());
  const fillExampleCnpj = () => handleChange(generateValidCnpj());

  const buscarDadosPublicos = async () => {
    if (docType !== 'CNPJ' || !result?.valid) return;

    const cached = cnpjCacheRef.current.get(digits);
    if (cached) {
      setCnpjData(cached.data);
      setCnpjSource(cached.source);
      setCnpjFromCache(true);
      setCnpjError(null);
      return;
    }

    setCnpjLoading(true);
    setCnpjError(null);
    setCnpjFromCache(false);
    try {
      const { data, source } = await fetchCnpjPublicDataWithFallback(digits);
      setCnpjData(data);
      setCnpjSource(source);
      cnpjCacheRef.current.set(digits, { data, source });
      setCacheSize(cnpjCacheRef.current.size + cnaeCacheRef.current.size + dddCacheRef.current.size);
    } catch (err) {
      setCnpjError(err instanceof Error ? err.message : 'Erro ao consultar.');
      setCnpjData(null);
      setCnpjSource(null);
    } finally {
      setCnpjLoading(false);
    }
  };

  const conferirCep = async (cep: string) => {
    setCepLoading(true);
    setCepError(null);
    try {
      const data = await fetchCepData(cep);
      setCepData(data);
    } catch (err) {
      setCepError(err instanceof Error ? err.message : 'Erro ao consultar CEP.');
      setCepData(null);
    } finally {
      setCepLoading(false);
    }
  };

  const gerarQrCode = () => {
    if (!formatted) return;
    const payload = encodeURIComponent(formatted);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${payload}`);
  };

  const compartilharLink = async () => {
    if (docType !== 'CNPJ') return;
    const url = `${window.location.origin}${window.location.pathname}?cnpj=${digits}`;
    await navigator.clipboard.writeText(url);
    showToast('Link copiado! (apenas dados públicos de empresa)');
  };

  const exportarJson = () => {
    if (!result) return showToast('Nada para exportar.');
    const payload = {
      tipo: docType,
      valor_formatado: formatted,
      valido: result.valid,
      motivo: result.reason ?? null,
      dados_publicos: cnpjData ?? null,
      consultado_em: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType?.toLowerCase() ?? 'documento'}-${digits}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON exportado!');
  };

  const exportarPdf = () => {
    window.print();
  };

  /* ---------- Histórico ---------- */
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const salvarNoHistorico = () => {
    if (!result || !docType) return showToast('Nada para salvar.');
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: docType,
      formatted,
      digits,
      valid: result.valid,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history].slice(0, 200);
    setHistory(updated);
    saveHistory(updated);
    showToast('Salvo no histórico!');
  };

  const removerDoHistorico = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const limparHistorico = () => {
    setHistory([]);
    saveHistory([]);
    showToast('Histórico limpo!');
  };

  const exportarHistoricoCsv = () => {
    if (history.length === 0) return showToast('Histórico vazio.');
    const header = 'tipo,valor,valido,data';
    const rows = history.map(
      (h) => `${h.type},${h.formatted},${h.valid ? 'sim' : 'nao'},${new Date(h.timestamp).toISOString()}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historico-documentos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exportado!');
  };

  /* ---------- Comparar ---------- */
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');

  const digitsA = useMemo(() => onlyDigits(compareA), [compareA]);
  const digitsB = useMemo(() => onlyDigits(compareB), [compareB]);
  const typeA: DocType = digitsA.length === 0 ? null : digitsA.length <= 11 ? 'CPF' : 'CNPJ';
  const typeB: DocType = digitsB.length === 0 ? null : digitsB.length <= 11 ? 'CPF' : 'CNPJ';
  const resultA = digitsA.length ? (typeA === 'CPF' ? validateCpf(digitsA) : validateCnpj(digitsA)) : null;
  const resultB = digitsB.length ? (typeB === 'CPF' ? validateCpf(digitsB) : validateCnpj(digitsB)) : null;
  const formattedA = formatDocument(digitsA);
  const formattedB = formatDocument(digitsB);

  const comparisonChars = useMemo(() => {
    const max = Math.max(formattedA.length, formattedB.length);
    const result: { char: string; match: boolean }[][] = [[], []];
    for (let i = 0; i < max; i++) {
      const a = formattedA[i] ?? '';
      const b = formattedB[i] ?? '';
      result[0].push({ char: a, match: a === b && a !== '' });
      result[1].push({ char: b, match: a === b && b !== '' });
    }
    return result;
  }, [formattedA, formattedB]);

  /* ---------- Em Lote ---------- */
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const batchCancelRef = useRef(false);

  const batchTokens = useMemo(() => parseBatchInput(batchInput), [batchInput]);
  const batchDone = batchResults.filter((r) => r.status === 'ok' || r.status === 'erro' || r.status === 'invalido').length;

  const iniciarLote = async () => {
    const tokens = batchTokens.slice(0, BATCH_LIMIT);
    if (tokens.length === 0) return showToast('Cole ao menos um CPF ou CNPJ.');

    const initial: BatchResult[] = tokens.map((token, i) => {
      const tokenDigits = onlyDigits(token);
      const type: DocType = tokenDigits.length === 0 ? null : tokenDigits.length <= 11 ? 'CPF' : 'CNPJ';
      const validation = type === 'CPF' ? validateCpf(tokenDigits) : type === 'CNPJ' ? validateCnpj(tokenDigits) : { valid: false, reason: 'Vazio' };
      return {
        id: `${Date.now()}-${i}`,
        input: token,
        digits: tokenDigits,
        type,
        formatted: formatDocument(tokenDigits),
        valid: validation.valid,
        reason: validation.reason,
        status: validation.valid ? 'pendente' : 'invalido',
      };
    });
    setBatchResults(initial);
    setBatchRunning(true);
    batchCancelRef.current = false;

    for (let i = 0; i < initial.length; i++) {
      if (batchCancelRef.current) break;
      const item = initial[i];
      if (!item.valid) continue;

      // CPF: só validação matemática, sem consulta — mesma regra de privacidade da aba Analisar.
      if (item.type === 'CPF') {
        setBatchResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'ok' } : r)));
        continue;
      }

      setBatchResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'consultando' } : r)));

      const cached = cnpjCacheRef.current.get(item.digits);
      if (cached) {
        setBatchResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: 'ok', data: cached.data, source: cached.source } : r))
        );
        continue;
      }

      try {
        const { data, source } = await fetchCnpjPublicDataWithFallback(item.digits);
        cnpjCacheRef.current.set(item.digits, { data, source });
        setCacheSize(cnpjCacheRef.current.size + cnaeCacheRef.current.size + dddCacheRef.current.size);
        setBatchResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'ok', data, source } : r)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao consultar.';
        setBatchResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'erro', error: message } : r)));
      }
      if (i < initial.length - 1) await delay(400); // gentil com a API pública gratuita
    }

    setBatchRunning(false);
  };

  const cancelarLote = () => {
    batchCancelRef.current = true;
    setBatchRunning(false);
  };

  const exportarLoteCsv = () => {
    if (batchResults.length === 0) return showToast('Nada para exportar.');
    const header = 'documento,tipo,valido,status,fonte,razao_social,situacao,municipio,uf,erro';
    const rows = batchResults.map((r) =>
      [
        r.formatted,
        r.type ?? '',
        r.valid ? 'sim' : 'nao',
        r.status,
        r.source ? CNPJ_SOURCE_LABEL[r.source] : '',
        r.data?.razao_social ?? '',
        r.data?.descricao_situacao_cadastral ?? '',
        r.data?.municipio ?? '',
        r.data?.uf ?? '',
        r.error ?? r.reason ?? '',
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lote-cpf-cnpj.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exportado!');
  };

  return (
    <ToolLayout
      title="Analisador de Documento Brasileiro"
      description="Valide, gere e analise CPF/CNPJ em lote — com consulta pública de empresas via Receita Federal e conferência de CEP."
    >
      {/* Relatório limpo — invisível na tela, só aparece na impressão/PDF (Ctrl+P). */}
      <div className="hidden print:block print:text-black">
        <h1 className="text-xl font-bold">Relatório — {docType ?? 'Documento'}</h1>
        <p className="mt-1 text-sm">
          {formatted || '—'} · {result?.valid ? 'Válido' : 'Inválido'}
          {result && !result.valid && result.reason ? ` (${result.reason})` : ''}
        </p>
        <p className="mt-1 text-xs text-gray-600">Gerado em {new Date().toLocaleString('pt-BR')} pelo Analisador de Documento Brasileiro</p>

        {docType === 'CNPJ' && cnpjData && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <strong>{cnpjData.razao_social ?? '—'}</strong>
              {cnpjData.nome_fantasia ? ` (${cnpjData.nome_fantasia})` : ''}
            </div>
            <table className="w-full border-collapse text-xs">
              <tbody>
                {[
                  ['Situação cadastral', cnpjData.descricao_situacao_cadastral],
                  ['Data da situação', cnpjData.data_situacao_cadastral],
                  ['Natureza jurídica', cnpjData.natureza_juridica],
                  ['Porte', cnpjData.descricao_porte ?? cnpjData.porte],
                  ['Data de abertura', cnpjData.data_inicio_atividade],
                  ['CNAE principal', cnpjData.cnae_fiscal_descricao ? `${cnpjData.cnae_fiscal} — ${cnpjData.cnae_fiscal_descricao}` : undefined],
                  [
                    'Endereço',
                    cnpjData.logradouro
                      ? `${cnpjData.descricao_tipo_de_logradouro ?? ''} ${cnpjData.logradouro}, ${cnpjData.numero ?? ''} — ${cnpjData.bairro ?? ''}, ${cnpjData.municipio ?? ''}/${cnpjData.uf ?? ''} — CEP ${cnpjData.cep ?? ''}`
                      : undefined,
                  ],
                  ['Telefone', cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2],
                  ['E-mail', cnpjData.email],
                  ['Capital social', formatCurrency(cnpjData.capital_social)],
                  ['Opção pelo Simples', cnpjData.opcao_pelo_simples === undefined ? undefined : cnpjData.opcao_pelo_simples ? 'Sim' : 'Não'],
                  ['Opção pelo MEI', cnpjData.opcao_pelo_mei === undefined ? undefined : cnpjData.opcao_pelo_mei ? 'Sim' : 'Não'],
                  ['Fonte da consulta', cnpjSource ? CNPJ_SOURCE_LABEL[cnpjSource] : undefined],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-300">
                      <td className="py-1 pr-4 font-semibold">{label}</td>
                      <td className="py-1">{value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {cnpjData.qsa && cnpjData.qsa.length > 0 && (
              <div>
                <strong className="text-xs">Quadro de sócios (dado público)</strong>
                <ul className="mt-1 text-xs">
                  {cnpjData.qsa.map((s, i) => (
                    <li key={i}>
                      • {s.nome_socio} {s.qualificacao_socio ? `— ${s.qualificacao_socio}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[10px] text-gray-500">
              Dados públicos da Receita Federal, obtidos via {cnpjSource ? CNPJ_SOURCE_LABEL[cnpjSource] : 'API pública'}.
            </p>
          </div>
        )}

        {docType === 'CPF' && (
          <p className="mt-4 text-xs text-gray-600">
            Por proteção de dados pessoais (LGPD), este relatório traz apenas a validação matemática do CPF — nenhum
            dado pessoal (nome, endereço etc.) é consultado ou exibido.
          </p>
        )}
      </div>

      <div className="space-y-8 print:hidden">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-[#161f30] pb-4">
          {([
            { id: 'analisar', label: 'Analisar' },
            { id: 'comparar', label: 'Comparar' },
            { id: 'lote', label: `Em Lote${batchResults.length ? ` (${batchDone}/${batchResults.length})` : ''}` },
            { id: 'historico', label: `Histórico (${history.length})` },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                tab === t.id
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-[#161f30] bg-[#0b1020] text-[#94a3b8] hover:bg-[#161f30]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= ABA ANALISAR ================= */}
        {tab === 'analisar' && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                CPF ou CNPJ
              </h3>
              <input
                value={formatted}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Digite um CPF ou CNPJ (com ou sem pontuação)"
                spellCheck={false}
                inputMode="numeric"
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyFormatted}
                className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
              >
                Copiar
              </button>
              <button
                onClick={clearAll}
                className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
              >
                Limpar
              </button>
              <button
                onClick={fillExampleCpf}
                className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
              >
                Gerar CPF válido
              </button>
              <button
                onClick={fillExampleCnpj}
                className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
              >
                Gerar CNPJ válido
              </button>
              <button
                onClick={salvarNoHistorico}
                className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-4 py-2 text-sm text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20"
              >
                Salvar no histórico
              </button>
              <button
                onClick={exportarJson}
                className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
              >
                Exportar JSON
              </button>
              <button
                onClick={exportarPdf}
                className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
              >
                Exportar PDF
              </button>
              <button
                onClick={gerarQrCode}
                className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
              >
                Gerar QR Code
              </button>
              {docType === 'CNPJ' && (
                <button
                  onClick={compartilharLink}
                  className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
                >
                  Compartilhar link
                </button>
              )}
            </div>

            {qrUrl && (
              <div className="flex justify-center rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <img src={qrUrl} alt={`QR Code de ${formatted}`} width={220} height={220} />
              </div>
            )}

            {/* Resultado */}
            <div
              className={`rounded-lg border p-4 text-sm ${
                digits.length === 0
                  ? 'border-[#161f30] bg-[#0b1020] text-[#94a3b8]'
                  : result?.valid
                    ? 'border-[#3ddc97] bg-[#3ddc97]/10 text-[#3ddc97]'
                    : 'border-[#f87171] bg-[#f87171]/10 text-[#f87171]'
              }`}
            >
              {digits.length === 0 && 'Digite um documento para analisar.'}
              {digits.length > 0 && result?.valid && `✓ ${docType} válido.`}
              {digits.length > 0 && result && !result.valid && (
                <span>
                  ✕ {docType} inválido{result.reason ? `: ${result.reason}` : '.'}
                </span>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Tipo detectado" value={docType ?? '—'} />
              <StatCard label="Dígitos" value={String(digits.length)} />
              <StatCard label="Formatado" value={formatted || '—'} />
              <StatCard label="Status" value={digits.length === 0 ? '—' : result?.valid ? 'Válido' : 'Inválido'} />
            </div>

            {/* Estrutura do CNPJ */}
            {docType === 'CNPJ' && cnpjStructure && (
              <div>
                <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                  Estrutura do CNPJ
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Raiz (empresa)" value={cnpjStructure.raiz} />
                  <StatCard label="Ordem (filial)" value={cnpjStructure.ordem} />
                  <StatCard label="Dígitos verificadores" value={cnpjStructure.dv} />
                  <StatCard label="Unidade" value={cnpjStructure.matriz ? 'Matriz' : 'Filial'} />
                </div>
              </div>
            )}

            {/* Explicação do algoritmo */}
            {(cpfSteps || cnpjSteps) && (
              <div>
                <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                  Explicação do Algoritmo (Módulo 11)
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <CheckStepTable title="1º dígito verificador" step={(cpfSteps ?? cnpjSteps)!.step1} />
                  <CheckStepTable title="2º dígito verificador" step={(cpfSteps ?? cnpjSteps)!.step2} />
                </div>
              </div>
            )}

            {/* Consulta pública — apenas CNPJ */}
            {docType === 'CNPJ' && result?.valid && (
              <div className="border-t border-[#161f30] pt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                    Dados Públicos (Receita Federal)
                  </h3>
                  <button
                    onClick={buscarDadosPublicos}
                    disabled={cnpjLoading}
                    className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20 disabled:opacity-50"
                  >
                    {cnpjLoading ? 'Consultando...' : 'Buscar dados públicos'}
                  </button>
                </div>

                {cnpjError && (
                  <div className="rounded-lg border border-[#f87171] bg-[#f87171]/10 p-4 text-sm text-[#f87171]">
                    ✕ {cnpjError}
                  </div>
                )}

                {cnpjData && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#94a3b8]">
                      <span
                        className={`rounded-full border px-2 py-0.5 ${
                          cnpjSource === 'minhareceita'
                            ? 'border-[#e8b86d] text-[#e8b86d]'
                            : 'border-[#3ddc97] text-[#3ddc97]'
                        }`}
                      >
                        Fonte: {cnpjSource ? CNPJ_SOURCE_LABEL[cnpjSource] : '—'}
                      </span>
                      {cnpjFromCache && <span>· carregado do cache da sessão (sem nova requisição)</span>}
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                        Identificação
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoField label="Razão social" value={cnpjData.razao_social} />
                        <InfoField label="Nome fantasia" value={cnpjData.nome_fantasia} />
                        <InfoField
                          label="Matriz/Filial"
                          value={cnpjData.descricao_identificador_matriz_filial}
                        />
                        <InfoField label="Natureza jurídica" value={cnpjData.natureza_juridica} />
                        <InfoField label="Data de abertura" value={cnpjData.data_inicio_atividade} />
                        <InfoField
                          label="Porte"
                          value={cnpjData.descricao_porte ?? cnpjData.porte}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                        Situação Cadastral
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoField label="Situação" value={cnpjData.descricao_situacao_cadastral} />
                        <InfoField label="Data da situação" value={cnpjData.data_situacao_cadastral} />
                        <InfoField label="Motivo" value={cnpjData.descricao_motivo_situacao_cadastral} />
                        {cnpjData.situacao_especial && (
                          <InfoField
                            label="Situação especial"
                            value={
                              cnpjData.data_situacao_especial
                                ? `${cnpjData.situacao_especial} (${cnpjData.data_situacao_especial})`
                                : cnpjData.situacao_especial
                            }
                          />
                        )}
                        <InfoField
                          label="Opção pelo Simples"
                          value={
                            cnpjData.opcao_pelo_simples === undefined
                              ? undefined
                              : cnpjData.opcao_pelo_simples
                                ? `Sim${cnpjData.data_opcao_pelo_simples ? ` (desde ${cnpjData.data_opcao_pelo_simples})` : ''}`
                                : cnpjData.data_exclusao_do_simples
                                  ? `Não (excluído em ${cnpjData.data_exclusao_do_simples})`
                                  : 'Não'
                          }
                        />
                        <InfoField
                          label="Opção pelo MEI"
                          value={
                            cnpjData.opcao_pelo_mei === undefined
                              ? undefined
                              : cnpjData.opcao_pelo_mei
                                ? `Sim${cnpjData.data_opcao_pelo_mei ? ` (desde ${cnpjData.data_opcao_pelo_mei})` : ''}`
                                : cnpjData.data_exclusao_do_mei
                                  ? `Não (excluído em ${cnpjData.data_exclusao_do_mei})`
                                  : 'Não'
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                        Atividade Econômica
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoField
                          label="CNAE principal"
                          value={
                            cnpjData.cnae_fiscal
                              ? `${cnpjData.cnae_fiscal} — ${cnpjData.cnae_fiscal_descricao ?? ''}`
                              : undefined
                          }
                        />
                        <InfoField label="Capital social" value={formatCurrency(cnpjData.capital_social)} />
                      </div>
                      {cnpjData.cnaes_secundarios && cnpjData.cnaes_secundarios.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {cnpjData.cnaes_secundarios.map((c) => (
                            <div
                              key={c.codigo}
                              className="rounded border border-[#161f30] bg-[#0b1020] px-3 py-2 text-xs text-[#94a3b8]"
                            >
                              {c.codigo} — {c.descricao}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Endereço e Contato
                        </h4>
                        {cnpjData.cep && (
                          <button
                            onClick={() => conferirCep(cnpjData.cep!)}
                            disabled={cepLoading}
                            className="rounded border border-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 text-xs text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20 disabled:opacity-50"
                          >
                            {cepLoading ? 'Conferindo CEP...' : 'Conferir CEP'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoField
                          label="Logradouro"
                          value={
                            cnpjData.logradouro
                              ? `${cnpjData.descricao_tipo_de_logradouro ?? ''} ${cnpjData.logradouro}, ${cnpjData.numero ?? ''}`.trim()
                              : undefined
                          }
                        />
                        <InfoField label="Bairro" value={cnpjData.bairro} />
                        <InfoField
                          label="Município/UF"
                          value={cnpjData.municipio ? `${cnpjData.municipio}/${cnpjData.uf ?? ''}` : undefined}
                        />
                        <InfoField label="CEP" value={cnpjData.cep} />
                        <InfoField label="Telefone" value={cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2} />
                        <InfoField label="E-mail" value={cnpjData.email} />
                      </div>

                      {cepError && (
                        <div className="mt-2 rounded-lg border border-[#f87171] bg-[#f87171]/10 p-3 text-xs text-[#f87171]">
                          ✕ {cepError}
                        </div>
                      )}

                      {cepData && (
                        <div className="mt-3 rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm">
                          <div className="mb-2 text-xs font-semibold text-[#94a3b8]">
                            CEP {cepData.cep} — fonte: {cepData.service ?? 'provedor público'}
                          </div>
                          <p className="text-[#f8fafc]">
                            {cepData.street ? `${cepData.street}, ` : ''}
                            {cepData.neighborhood ? `${cepData.neighborhood} — ` : ''}
                            {cepData.city}
                            {cepData.state ? `/${cepData.state}` : ''}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                            {cnpjData.municipio &&
                              cepData.city &&
                              cnpjData.municipio.toUpperCase() !== cepData.city.toUpperCase() && (
                                <span className="text-[#e8b86d]">
                                  ⚠ Município do CEP diverge do cadastro da Receita — confira antes de usar.
                                </span>
                              )}
                            {cepData.location?.coordinates?.latitude && cepData.location?.coordinates?.longitude && (
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${cepData.location.coordinates.latitude}&mlon=${cepData.location.coordinates.longitude}#map=17/${cepData.location.coordinates.latitude}/${cepData.location.coordinates.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00d4ff] hover:underline"
                              >
                                Ver no mapa ↗
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {cnpjData.qsa && cnpjData.qsa.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Quadro de Sócios e Administradores (QSA)
                        </h4>
                        <div className="space-y-1">
                          {cnpjData.qsa.map((s, i) => (
                            <div
                              key={i}
                              className="rounded border border-[#161f30] bg-[#0b1020] px-3 py-2 text-xs text-[#f8fafc]"
                            >
                              {s.nome_socio}{' '}
                              <span className="text-[#94a3b8]">— {s.qualificacao_socio}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#94a3b8]">
                      Dados públicos obtidos via BrasilAPI, que espelha a base da Receita Federal.
                      Disponibilidade dos campos pode variar por empresa.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Aviso de privacidade sobre CPF */}
            {docType === 'CPF' && (
              <div className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 p-4 text-sm text-[#e8b86d]">
                ℹ Por proteção de dados pessoais (LGPD), esta ferramenta não realiza busca de dados
                reais de pessoas físicas a partir do CPF. A análise de CPF é sempre matemática e
                local — nenhum dado é enviado a servidores.
              </div>
            )}

            <div className="border-t border-[#161f30] pt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                  Consultas auxiliares
                </h3>
                {cacheSize > 0 && (
                  <button
                    onClick={limparCache}
                    className="text-xs text-[#94a3b8] underline decoration-dotted hover:text-[#f8fafc]"
                  >
                    🗑 Limpar cache da sessão ({cacheSize})
                  </button>
                )}
              </div>
              <p className="mb-4 text-xs text-[#94a3b8]">
                Dados públicos e não-pessoais — úteis para interpretar um CNAE lido em outro
                documento ou descobrir a que estado pertence um DDD.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[#94a3b8]">Código CNAE</label>
                  <div className="flex gap-2">
                    <input
                      value={cnaeCode}
                      onChange={(e) => setCnaeCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && buscarCnae()}
                      placeholder="Ex.: 6201-5/01"
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
                    />
                    <button
                      onClick={buscarCnae}
                      disabled={cnaeLoading || !cnaeCode.trim()}
                      className="shrink-0 rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-3 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20 disabled:opacity-50"
                    >
                      {cnaeLoading ? '...' : 'Buscar'}
                    </button>
                  </div>
                  {cnaeError && <p className="mt-1 text-xs text-[#f87171]">{cnaeError}</p>}
                  {cnaeResult && (
                    <p className="mt-2 rounded-lg border border-[#161f30] bg-[#0b1020] p-3 text-xs text-[#f8fafc]">
                      <span className="text-[#94a3b8]">{cnaeResult.codigo}</span> — {cnaeResult.descricao}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[#94a3b8]">DDD</label>
                  <div className="flex gap-2">
                    <input
                      value={dddCode}
                      onChange={(e) => setDddCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && buscarDdd()}
                      placeholder="Ex.: 11"
                      maxLength={2}
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
                    />
                    <button
                      onClick={buscarDdd}
                      disabled={dddLoading || !dddCode.trim()}
                      className="shrink-0 rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-3 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20 disabled:opacity-50"
                    >
                      {dddLoading ? '...' : 'Buscar'}
                    </button>
                  </div>
                  {dddError && <p className="mt-1 text-xs text-[#f87171]">{dddError}</p>}
                  {dddResult && (
                    <p className="mt-2 rounded-lg border border-[#161f30] bg-[#0b1020] p-3 text-xs text-[#f8fafc]">
                      <span className="text-[#94a3b8]">{dddResult.state}:</span>{' '}
                      {dddResult.cities.slice(0, 6).join(', ')}
                      {dddResult.cities.length > 6 ? ` e mais ${dddResult.cities.length - 6}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#161f30] pt-8">
              <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                Dicas
              </h3>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li>• CPF tem 11 dígitos, CNPJ tem 14 — a detecção é automática</li>
                <li>• A validação verifica os dois dígitos verificadores (módulo 11)</li>
                <li>• Sequências como 111.111.111-11 são sempre inválidas</li>
                <li>• Dados de empresas (CNPJ) são públicos por lei; dados de CPF nunca são consultados</li>
                <li>• Use a aba "Em Lote" para validar e consultar vários documentos de uma vez</li>
                <li>• No endereço de um CNPJ, use "Conferir CEP" para checar se bate com a base pública de CEPs</li>
                <li>• Se a BrasilAPI cair, a consulta de CNPJ tenta automaticamente uma segunda fonte pública</li>
              </ul>
            </div>
          </div>
        )}

        {/* ================= ABA COMPARAR ================= */}
        {tab === 'comparar' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                  Documento A
                </h3>
                <input
                  value={formattedA}
                  onChange={(e) => setCompareA(onlyDigits(e.target.value).slice(0, 14))}
                  placeholder="Digite o primeiro CPF ou CNPJ"
                  spellCheck={false}
                  className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
                />
              </div>
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                  Documento B
                </h3>
                <input
                  value={formattedB}
                  onChange={(e) => setCompareB(onlyDigits(e.target.value).slice(0, 14))}
                  placeholder="Digite o segundo CPF ou CNPJ"
                  spellCheck={false}
                  className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={`rounded-lg border p-4 text-sm ${
                  !resultA
                    ? 'border-[#161f30] bg-[#0b1020] text-[#94a3b8]'
                    : resultA.valid
                      ? 'border-[#3ddc97] bg-[#3ddc97]/10 text-[#3ddc97]'
                      : 'border-[#f87171] bg-[#f87171]/10 text-[#f87171]'
                }`}
              >
                {!resultA && 'Aguardando documento A.'}
                {resultA && (resultA.valid ? `✓ ${typeA} válido` : `✕ ${typeA} inválido`)}
              </div>
              <div
                className={`rounded-lg border p-4 text-sm ${
                  !resultB
                    ? 'border-[#161f30] bg-[#0b1020] text-[#94a3b8]'
                    : resultB.valid
                      ? 'border-[#3ddc97] bg-[#3ddc97]/10 text-[#3ddc97]'
                      : 'border-[#f87171] bg-[#f87171]/10 text-[#f87171]'
                }`}
              >
                {!resultB && 'Aguardando documento B.'}
                {resultB && (resultB.valid ? `✓ ${typeB} válido` : `✕ ${typeB} inválido`)}
              </div>
            </div>

            {(digitsA.length > 0 || digitsB.length > 0) && (
              <div>
                <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
                  Comparação Caractere a Caractere
                </h3>
                <div className="space-y-2">
                  {comparisonChars.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-wrap gap-1">
                      {row.map((c, i) => (
                        <span
                          key={i}
                          className={`flex h-8 w-8 items-center justify-center rounded font-mono text-sm ${
                            c.char === ''
                              ? 'border border-[#161f30] text-[#94a3b8]'
                              : c.match
                                ? 'bg-[#3ddc97]/20 text-[#3ddc97]'
                                : 'bg-[#f87171]/20 text-[#f87171]'
                          }`}
                        >
                          {c.char || '·'}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#94a3b8]">
                  Verde = posições idênticas entre A e B · Vermelho = posições diferentes
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Tipo A" value={typeA ?? '—'} />
              <StatCard label="Tipo B" value={typeB ?? '—'} />
              <StatCard
                label="Mesmo tipo?"
                value={typeA && typeB ? (typeA === typeB ? 'Sim' : 'Não') : '—'}
              />
              <StatCard
                label="São iguais?"
                value={digitsA && digitsB ? (digitsA === digitsB ? 'Sim' : 'Não') : '—'}
              />
            </div>
          </div>
        )}

        {/* ================= ABA EM LOTE ================= */}
        {tab === 'lote' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                Lista de CPF/CNPJ
              </h3>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={'Cole uma lista, um documento por linha (ou separados por vírgula):\n11.222.333/0001-81\n444.555.666-77\n...'}
                spellCheck={false}
                rows={6}
                disabled={batchRunning}
                className="w-full resize-y rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff] disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-[#94a3b8]">
                {batchTokens.length} documento(s) detectado(s)
                {batchTokens.length > BATCH_LIMIT ? ` — apenas os primeiros ${BATCH_LIMIT} serão processados por vez` : ''}.
                CNPJs válidos têm os dados públicos consultados na Receita Federal; CPFs recebem apenas validação
                matemática (sem busca de dados pessoais).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={iniciarLote}
                disabled={batchRunning || batchTokens.length === 0}
                className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-4 py-2 text-sm text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20 disabled:opacity-50"
              >
                {batchRunning ? 'Consultando...' : 'Consultar lote'}
              </button>
              {batchRunning && (
                <button
                  onClick={cancelarLote}
                  className="rounded-lg border border-[#f87171] bg-[#f87171]/10 px-4 py-2 text-sm text-[#f87171] transition-all hover:bg-[#f87171]/20"
                >
                  Cancelar
                </button>
              )}
              {batchResults.length > 0 && (
                <button
                  onClick={exportarLoteCsv}
                  className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
                >
                  Exportar CSV
                </button>
              )}
              {batchResults.length > 0 && !batchRunning && (
                <button
                  onClick={() => {
                    setBatchResults([]);
                    setBatchInput('');
                  }}
                  className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
                >
                  Limpar
                </button>
              )}
            </div>

            {batchResults.length > 0 && (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#161f30]">
                  <div
                    className="h-full bg-[#00d4ff] transition-all"
                    style={{ width: `${(batchDone / batchResults.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#94a3b8]">
                  {batchDone} de {batchResults.length} processado(s)
                </p>

                <div className="overflow-x-auto rounded-lg border border-[#161f30]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#161f30] bg-[#0b1020] text-xs uppercase tracking-wide text-[#94a3b8]">
                        <th className="px-3 py-2">Documento</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Razão social / Situação</th>
                        <th className="px-3 py-2">Município/UF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((r) => (
                        <tr key={r.id} className="border-b border-[#161f30] last:border-0">
                          <td className="px-3 py-2 font-mono text-[#f8fafc]">{r.formatted}</td>
                          <td className="px-3 py-2 text-[#94a3b8]">{r.type ?? '—'}</td>
                          <td className="px-3 py-2">
                            {r.status === 'pendente' && <span className="text-[#94a3b8]">Aguardando</span>}
                            {r.status === 'consultando' && <span className="text-[#00d4ff]">Consultando...</span>}
                            {r.status === 'invalido' && <span className="text-[#f87171]">Inválido{r.reason ? ` — ${r.reason}` : ''}</span>}
                            {r.status === 'erro' && <span className="text-[#f87171]">Erro — {r.error}</span>}
                            {r.status === 'ok' && r.type === 'CPF' && <span className="text-[#3ddc97]">Válido</span>}
                            {r.status === 'ok' && r.type === 'CNPJ' && (
                              <span className="text-[#3ddc97]">
                                {r.data?.descricao_situacao_cadastral ?? 'Válido'}
                                {r.source === 'minhareceita' && (
                                  <span className="ml-1 text-[#e8b86d]" title="Obtido via fonte alternativa (BrasilAPI indisponível)">
                                    (fallback)
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-[#f8fafc]">{r.data?.razao_social ?? '—'}</td>
                          <td className="px-3 py-2 text-[#94a3b8]">
                            {r.data?.municipio ? `${r.data.municipio}/${r.data.uf ?? ''}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= ABA HISTÓRICO ================= */}
        {tab === 'historico' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportarHistoricoCsv}
                className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
              >
                Exportar CSV
              </button>
              <button
                onClick={limparHistorico}
                className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
              >
                Limpar histórico
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">
                Nenhum documento salvo ainda. Na aba "Analisar", use o botão "Salvar no histórico".
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          h.valid ? 'bg-[#3ddc97]/10 text-[#3ddc97]' : 'bg-[#f87171]/10 text-[#f87171]'
                        }`}
                      >
                        {h.type}
                      </span>
                      <code className="font-mono text-sm text-[#f8fafc]">{h.formatted}</code>
                      <span className="text-xs text-[#94a3b8]">
                        {new Date(h.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      onClick={() => removerDoHistorico(h.id)}
                      className="rounded px-3 py-1 text-sm text-[#f87171] transition-all hover:bg-[#f87171]/10"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#94a3b8]">
              O histórico fica salvo apenas no seu navegador (localStorage) — nada é enviado a servidores.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/validador-cpf-cnpj')({
  component: ValidadorCpfCnpjPage,
});
