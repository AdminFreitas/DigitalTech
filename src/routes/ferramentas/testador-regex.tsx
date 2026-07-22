import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface FlagOption {
  key: 'g' | 'i' | 'm' | 's';
  label: string;
  description: string;
}

const FLAG_OPTIONS: FlagOption[] = [
  { key: 'g', label: 'g', description: 'Global — encontra todas as ocorrências' },
  { key: 'i', label: 'i', description: 'Case insensitive' },
  { key: 'm', label: 'm', description: 'Multiline — ^ e $ por linha' },
  { key: 's', label: 's', description: 'Dotall — "." também casa quebras de linha' },
];

interface MatchInfo {
  index: number;
  text: string;
  groups: string[];
  namedGroups: Record<string, string> | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function TestadorRegexPage() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleFlag = (key: string) => {
    setFlags({ ...flags, [key]: !flags[key] });
  };

  const activeFlags = useMemo(
    () =>
      FLAG_OPTIONS.filter((f) => flags[f.key])
        .map((f) => f.key)
        .join(''),
    [flags]
  );

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null as RegExp | null, error: null as string | null };
    try {
      return { regex: new RegExp(pattern, activeFlags), error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Expressão regular inválida.';
      return { regex: null as RegExp | null, error: message };
    }
  }, [pattern, activeFlags]);

  const matches: MatchInfo[] = useMemo(() => {
    if (!regex || !testText) return [];
    const results: MatchInfo[] = [];

    if (flags.g) {
      const globalRegex = new RegExp(pattern, activeFlags.includes('g') ? activeFlags : activeFlags + 'g');
      let match: RegExpExecArray | null;
      let safety = 0;
      while ((match = globalRegex.exec(testText)) !== null && safety < 10000) {
        results.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1).map((g) => g ?? ''),
          namedGroups: match.groups ? { ...match.groups } : null,
        });
        if (match[0] === '') globalRegex.lastIndex++;
        safety++;
      }
    } else {
      const match = regex.exec(testText);
      if (match) {
        results.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1).map((g) => g ?? ''),
          namedGroups: match.groups ? { ...match.groups } : null,
        });
      }
    }

    return results;
  }, [regex, testText, pattern, activeFlags, flags.g]);

  const highlightedText = useMemo(() => {
    if (!testText) return '';
    if (matches.length === 0) return escapeHtml(testText);

    let result = '';
    let lastIndex = 0;
    for (const m of matches) {
      if (m.index < lastIndex) continue;
      result += escapeHtml(testText.slice(lastIndex, m.index));
      result += `<mark class="rounded bg-[#00d4ff]/30 text-[#00d4ff] px-0.5">${escapeHtml(
        m.text || ' '
      )}</mark>`;
      lastIndex = m.index + Math.max(m.text.length, 1);
    }
    result += escapeHtml(testText.slice(lastIndex));
    return result;
  }, [testText, matches]);

  const clearAll = () => {
    setPattern('');
    setTestText('');
  };

  const copyMatches = async () => {
    if (matches.length === 0) {
      showToast('Nenhum match para copiar.');
      return;
    }
    await navigator.clipboard.writeText(matches.map((m) => m.text).join('\n'));
    showToast('Matches copiados!');
  };

  return (
    <ToolLayout
      title="Testador de Regex"
      description="Teste expressões regulares e visualize as correspondências em tempo real."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        {/* Expressão regular */}
        <div>
          <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
            Expressão Regular
          </h3>
          <div className="flex items-center gap-2 rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-3 focus-within:border-[#00d4ff]">
            <span className="font-mono text-[#94a3b8]">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="ex: \b[A-Z][a-z]+\b"
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-sm text-[#f8fafc] outline-none"
            />
            <span className="font-mono text-[#94a3b8]">/{activeFlags}</span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-3">
          {FLAG_OPTIONS.map((f) => (
            <label
              key={f.key}
              title={f.description}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                flags[f.key]
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-[#161f30] bg-[#0b1020] text-[#94a3b8] hover:bg-[#161f30]'
              }`}
            >
              <input
                type="checkbox"
                checked={flags[f.key]}
                onChange={() => toggleFlag(f.key)}
                className="accent-[#00d4ff]"
              />
              <span className="font-mono">{f.label}</span>
              <span className="hidden text-xs sm:inline">— {f.description}</span>
            </label>
          ))}
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-lg border border-[#f87171] bg-[#f87171]/10 p-4 text-sm text-[#f87171]">
            ✕ Regex inválida: {error}
          </div>
        )}

        {/* Texto de teste */}
        <div>
          <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
            Texto de Teste
          </h3>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Cole aqui o texto onde a expressão será testada..."
            spellCheck={false}
            className="h-48 w-full resize-none rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
          />
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyMatches}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Copiar Matches
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
          >
            Limpar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Matches</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{matches.length}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Flags ativas</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{activeFlags || '—'}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Status</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">
              {!pattern ? '—' : error ? 'Inválida' : 'Válida'}
            </div>
          </div>
        </div>

        {/* Texto destacado */}
        <div>
          <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
            Correspondências no Texto
          </h3>
          <div className="min-h-24 w-full whitespace-pre-wrap rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc]">
            {testText ? (
              <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
            ) : (
              <span className="text-[#94a3b8]">O texto com as correspondências destacadas aparecerá aqui.</span>
            )}
          </div>
        </div>

        {/* Lista de matches */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Lista de Matches ({matches.length})
          </h3>
          {matches.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Nenhuma correspondência encontrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div
                  key={`${m.index}-${i}`}
                  className="rounded-lg border border-[#161f30] bg-[#0b1020] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="font-mono text-sm text-[#3ddc97]">
                      {m.text === '' ? '(vazio)' : m.text}
                    </code>
                    <span className="text-xs text-[#94a3b8]">posição {m.index}</span>
                  </div>
                  {m.groups.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.groups.map((g, gi) => (
                        <span
                          key={gi}
                          className="rounded border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-2 py-1 font-mono text-xs text-[#00d4ff]"
                        >
                          grupo {gi + 1}: {g === '' ? '(vazio)' : g}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.namedGroups && Object.keys(m.namedGroups).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(m.namedGroups).map(([name, value]) => (
                        <span
                          key={name}
                          className="rounded border border-[#e8b86d]/40 bg-[#e8b86d]/10 px-2 py-1 font-mono text-xs text-[#e8b86d]"
                        >
                          {name}: {value === '' ? '(vazio)' : value}
                        </span>
                      ))}
                    </div>
                  )}
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
            <li>• A flag "g" é necessária para listar todas as ocorrências</li>
            <li>• Use grupos com parênteses () para capturar partes do match</li>
            <li>• Use (?&lt;nome&gt;...) para grupos nomeados</li>
            <li>• Todo o processamento acontece localmente no navegador</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/testador-regex')({
  component: TestadorRegexPage,
});
