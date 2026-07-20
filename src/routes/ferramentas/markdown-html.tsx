import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return '';

  let html = markdown;

  // Escapa HTML existente para segurança
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Blocos de código ```codigo```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre><code>${code.trim()}</code></pre>`);

  // Código inline `codigo`
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Títulos (# até ######)
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Linha horizontal
  html = html.replace(/^(-{3,}|\*{3,})$/gm, '<hr />');

  // Citação
  html = html.replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>');

  // Negrito e itálico
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Imagens ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // Links [texto](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Listas não ordenadas
  html = html.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>\n${m}</ul>\n`);

  // Listas ordenadas
  html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');

  // Parágrafos: linhas soltas que não são tags de bloco
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|hr|img)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n\n');

  return html.trim();
}

const EXEMPLO = `# Título Principal

## Subtítulo

Este é um parágrafo com **texto em negrito** e *texto em itálico*.

- Item de lista 1
- Item de lista 2
- Item de lista 3

> Isto é uma citação.

Um trecho de código: \`const x = 10;\`

[Link para o DigitalTech](https://digitaltech.com)

---

\`\`\`
function ola() {
  console.log("Olá, mundo!");
}
\`\`\``;

export function MarkdownHtmlPage() {
  const [markdown, setMarkdown] = useState(EXEMPLO);
  const [toast, setToast] = useState<string | null>(null);

  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    showToast('HTML copiado!');
  };

  const clear = () => {
    setMarkdown('');
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'convertido.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Arquivo HTML baixado!');
  };

  return (
    <ToolLayout
      title="Markdown para HTML"
      description="Cole o texto em Markdown e copie o HTML pronto, com preview ao vivo."
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
            onClick={copyHtml}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Copiar HTML
          </button>
          <button
            onClick={downloadHtml}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Baixar HTML
          </button>
          <button
            onClick={clear}
            className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
          >
            Limpar
          </button>
        </div>

        {/* Editor + Preview lado a lado */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              Markdown
            </h3>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Cole seu Markdown aqui..."
              rows={18}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-3 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm resize-none"
            />
          </div>

          <div>
            <h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              Preview
            </h3>
            <div
              className="markdown-preview h-[456px] overflow-y-auto rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-3 text-[#f8fafc]"
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-[#94a3b8]">O preview aparecerá aqui...</p>' }}
            />
          </div>
        </div>

        {/* Código HTML gerado */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            HTML Gerado
          </h3>
          <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96 font-mono whitespace-pre-wrap break-all">
            {html || '// O HTML gerado aparecerá aqui'}
          </pre>
        </div>

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• Use # até ###### para títulos</li>
            <li>• **negrito**, *itálico* e `código inline`</li>
            <li>• Listas com - ou * no início da linha</li>
            <li>• Links: [texto](url) e imagens: ![alt](url)</li>
            <li>• Blocos de código com ``` no início e no fim</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/markdown-html')({
  component: MarkdownHtmlPage,
});
