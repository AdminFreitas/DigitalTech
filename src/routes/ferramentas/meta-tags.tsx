import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function MetaTagsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [viewport, setViewport] = useState(true);
  const [charset, setCharset] = useState('utf-8');

  const generateMetaTags = () => {
    const tags: string[] = [];

    if (charset) {
      tags.push(`<meta charset="${charset}" />`);
    }

    if (viewport) {
      tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`);
    }

    if (title) {
      tags.push(`<title>${title}</title>`);
      tags.push(`<meta name="title" content="${title}" />`);
    }

    if (description) {
      tags.push(`<meta name="description" content="${description}" />`);
    }

    if (keywords) {
      tags.push(`<meta name="keywords" content="${keywords}" />`);
    }

    if (author) {
      tags.push(`<meta name="author" content="${author}" />`);
    }

    return tags.join('\n');
  };

  const metaTags = generateMetaTags();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(metaTags);
    alert('Meta tags copiadas para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Meta Tags"
      description="Gerador e analisador de meta tags para otimizaÃ§Ã£o de SEO."
    >
      <div className="space-y-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              TÃ­tulo da PÃ¡gina
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o tÃ­tulo da pÃ¡gina..."
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
            <p className="mt-1 text-xs text-[#94a3b8]">
              Ideal: 50-60 caracteres
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              DescriÃ§Ã£o (Meta Description)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descriÃ§Ã£o da pÃ¡gina..."
              rows={3}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
            <p className="mt-1 text-xs text-[#94a3b8]">
              Ideal: 150-160 caracteres (atual: {description.length})
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Palavras-chave
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Separe as palavras-chave com vÃ­rgula..."
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Autor
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Digite o nome do autor..."
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={viewport}
                onChange={(e) => setViewport(e.target.checked)}
                className="h-4 w-4 rounded border-[#161f30] bg-[#0b1020] text-[#00d4ff]"
              />
              <span className="text-sm text-[#f8fafc]">Incluir meta viewport</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="text-sm text-[#f8fafc]">Charset:</label>
              <select
                value={charset}
                onChange={(e) => setCharset(e.target.value)}
                className="rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-1 text-sm text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none"
              >
                <option value="utf-8">UTF-8</option>
                <option value="iso-8859-1">ISO-8859-1</option>
                <option value="windows-1252">Windows-1252</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            CÃ³digo Gerado
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97]">
              {metaTags || '<!-- Meta tags aparecerÃ£o aqui -->'}
            </pre>

            <button
              onClick={copyToClipboard}
              disabled={!metaTags}
              className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas de SEO
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ O tÃ­tulo deve ter entre 50-60 caracteres para aparecer completo no Google</li>
            <li>â€¢ A meta description ideal tem 150-160 caracteres</li>
            <li>â€¢ Use palavras-chave relevantes, mas nÃ£o faÃ§a keyword stuffing</li>
            <li>â€¢ Cada pÃ¡gina deve ter meta tags Ãºnicas</li>
            <li>â€¢ A meta viewport Ã© essencial para responsividade mobile</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/meta-tags')({
  component: MetaTagsPage,
});

