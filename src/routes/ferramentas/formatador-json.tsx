import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface ParseResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

function getLineAndColumn(text: string, position: number): { line: number; column: number } {
  const upToError = text.slice(0, position);
  const lines = upToError.split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

function parseJson(text: string): ParseResult {
  if (!text.trim()) {
    return { valid: false, error: 'O campo está vazio.' };
  }
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'JSON inválido.';
    const positionMatch = message.match(/position (\d+)/);
    if (positionMatch) {
      const position = Number(positionMatch[1]);
      const { line, column } = getLineAndColumn(text, position);
      return { valid: false, error: message, line, column };
    }
    const lineMatch = message.match(/line (\d+) column (\d+)/i);
    if (lineMatch) {
      return {
        valid: false,
        error: message,
        line: Number(lineMatch[1]),
        column: Number(lineMatch[2]),
      };
    }
    return { valid: false, error: message };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightJson(json: string): string {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+\.?\d*([eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-[#e8b86d]'; // number
      if (/^"/.test(match)) {
        cls = /:\s*$/.test(match) ? 'text-[#00d4ff]' : 'text-[#3ddc97]'; // key vs string
      } else if (/true|false/.test(match)) {
        cls = 'text-[#f87171]';
      } else if (/null/.test(match)) {
        cls = 'text-[#94a3b8]';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export function FormatadorJsonPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const validation = useMemo(() => parseJson(input), [input]);

  const charCount = input.length;
  const lineCount = input === '' ? 0 : input.split('\n').length;

  const formatJson = () => {
    const result = parseJson(input);
    if (!result.valid) {
      showToast('Não foi possível formatar: JSON inválido.');
      return;
    }
    const parsed = JSON.parse(input);
    setOutput(JSON.stringify(parsed, null, 2));
  };

  const minifyJson = () => {
    const result = parseJson(input);
    if (!result.valid) {
      showToast('Não foi possível minificar: JSON inválido.');
      return;
    }
    const parsed = JSON.parse(input);
    setOutput(JSON.stringify(parsed));
  };

  const copyOutput = async () => {
    if (!output) {
      showToast('Nada para copiar.');
      return;
    }
    await navigator.clipboard.writeText(output);
    showToast('JSON copiado!');
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const downloadJson = () => {
    if (!output) {
      showToast('Gere um resultado antes de baixar.');
      return;
    }
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Arquivo JSON baixado!');
  };

  return (
    <ToolLayout
      title="Formatador de JSON"
      description="Formate, minifique e valide JSON diretamente no navegador."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={formatJson}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Formatar
          </button>
          <button
            onClick={minifyJson}
            className="rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 px-4 py-2 text-sm text-[#3ddc97] transition-all hover:bg-[#3ddc97]/20"
          >
            Minificar
          </button>
          <button
            onClick={copyOutput}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Copiar
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

        {/* Status de validação */}
        <div
          className={`rounded-lg border p-4 text-sm ${
            input.trim() === ''
              ? 'border-[#161f30] bg-[#0b1020] text-[#94a3b8]'
              : validation.valid
                ? 'border-[#3ddc97] bg-[#3ddc97]/10 text-[#3ddc97]'
                : 'border-[#f87171] bg-[#f87171]/10 text-[#f87171]'
          }`}
        >
          {input.trim() === '' && 'Cole um JSON para validar.'}
          {input.trim() !== '' && validation.valid && '✓ JSON válido.'}
          {input.trim() !== '' && !validation.valid && (
            <span>
              ✕ JSON inválido: {validation.error}
              {validation.line && validation.column && (
                <span>
                  {' '}
                  (linha {validation.line}, coluna {validation.column})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Caracteres</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{charCount}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Linhas</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{lineCount}</div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Status</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">
              {input.trim() === '' ? '—' : validation.valid ? 'Válido' : 'Inválido'}
            </div>
          </div>
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
            <div className="text-xs text-[#94a3b8]">Saída (chars)</div>
            <div className="mt-1 font-mono text-lg text-[#f8fafc]">{output.length}</div>
          </div>
        </div>

        {/* Layout dividido: entrada / resultado */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
              Entrada
            </h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Cole seu JSON aqui, ex: {"nome": "DigitalTech"}'
              spellCheck={false}
              className="h-96 w-full resize-none rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm text-[#f8fafc] outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div>
            <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
              Resultado
            </h3>
            <pre className="h-96 w-full overflow-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-sm">
              {output ? (
                <code dangerouslySetInnerHTML={{ __html: highlightJson(output) }} />
              ) : (
                <span className="text-[#94a3b8]">
                  O resultado formatado ou minificado aparecerá aqui.
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• Formatar indenta o JSON com 2 espaços para leitura</li>
            <li>• Minificar remove espaços e quebras de linha desnecessárias</li>
            <li>• Erros de sintaxe mostram a linha e coluna aproximadas</li>
            <li>• Todo o processamento acontece localmente no navegador</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/formatador-json')({
  component: FormatadorJsonPage,
});
