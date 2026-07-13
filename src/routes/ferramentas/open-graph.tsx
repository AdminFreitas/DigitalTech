import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function OpenGraphPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [type, setType] = useState('website');
  const [siteName, setSiteName] = useState('');

  const generateOpenGraph = () => {
    const tags: string[] = [];

    if (title) tags.push(`<meta property="og:title" content="${title}" />`);
    if (description) tags.push(`<meta property="og:description" content="${description}" />`);
    if (url) tags.push(`<meta property="og:url" content="${url}" />`);
    if (image) tags.push(`<meta property="og:image" content="${image}" />`);
    if (type) tags.push(`<meta property="og:type" content="${type}" />`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName}" />`);

    return tags.join('\n');
  };

  const openGraph = generateOpenGraph();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(openGraph);
    alert('Open Graph tags copiadas para a Ã¡rea de transferÃªncia!');
  };

  return (
    <ToolLayout
      title="Open Graph"
      description="Gerador de meta tags Open Graph para compartilhamento em redes sociais."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              TÃ­tulo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o tÃ­tulo..."
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              DescriÃ§Ã£o
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descriÃ§Ã£o..."
              rows={3}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              URL da Imagem
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/imagem.jpg"
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
            <p className="mt-1 text-xs text-[#94a3b8]">Recomendado: 1200x630px</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              >
                <option value="website">Website</option>
                <option value="article">Artigo</option>
                <option value="blog">Blog</option>
                <option value="video">VÃ­deo</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Nome do Site
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Seu site..."
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Tags Geradas
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97]">
              {openGraph || '<!-- Open Graph tags aparecerÃ£o aqui -->'}
            </pre>

            <button
              onClick={copyToClipboard}
              disabled={!openGraph}
              className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copiar
            </button>
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Open Graph melhora o compartilhamento em redes sociais</li>
            <li>â€¢ A imagem deve ter pelo menos 1200x630px</li>
            <li>â€¢ Use tÃ­tulos e descriÃ§Ãµes atrativas</li>
            <li>â€¢ Teste no Facebook Sharing Debugger</li>
            <li>â€¢ Mantenha os dados atualizados</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/open-graph')({
  component: OpenGraphPage,
});

