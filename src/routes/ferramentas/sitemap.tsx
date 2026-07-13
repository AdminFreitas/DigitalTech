import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface URLEntry {
  id: string;
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  lastmod: string;
}

export function SitemapPage() {
  const [urls, setUrls] = useState<URLEntry[]>([
    {
      id: '1',
      url: 'https://example.com/',
      changefreq: 'weekly',
      priority: '1.0',
      lastmod: new Date().toISOString().split('T')[0],
    },
  ]);

  const addURL = () => {
    setUrls([
      ...urls,
      {
        id: Date.now().toString(),
        url: '',
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeURL = (id: string) => {
    setUrls(urls.filter((u) => u.id !== id));
  };

  const updateURL = (id: string, field: keyof URLEntry, value: string) => {
    setUrls(
      urls.map((u) =>
        u.id === id ? { ...u, [field]: value } : u
      )
    );
  };

  const generateSitemap = () => {
    const validUrls = urls.filter((u) => u.url.trim());

    if (validUrls.length === 0) {
      return '';
    }

    const urlEntries = validUrls
      .map(
        (u) => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  };

  const sitemap = generateSitemap();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemap);
    alert('Sitemap copiado para a Ã¡rea de transferÃªncia!');
  };

  const downloadSitemap = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(sitemap));
    element.setAttribute('download', 'sitemap.xml');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <ToolLayout
      title="Sitemap"
      description="Gerador de sitemap XML para auxiliar na indexaÃ§Ã£o do seu site."
    >
      <div className="space-y-8">
        {/* URLs List */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            URLs do Site
          </h3>

          <div className="space-y-4">
            {urls.map((entry, index) => (
              <div key={entry.id} className="space-y-3 rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div>
                  <label className="block mb-2 text-xs font-medium text-[#94a3b8]">
                    URL {index + 1}
                  </label>
                  <input
                    type="url"
                    value={entry.url}
                    onChange={(e) => updateURL(entry.id, 'url', e.target.value)}
                    placeholder="https://example.com/pagina"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-xs font-medium text-[#94a3b8]">
                      FrequÃªncia
                    </label>
                    <select
                      value={entry.changefreq}
                      onChange={(e) =>
                        updateURL(entry.id, 'changefreq', e.target.value as URLEntry['changefreq'])
                      }
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-sm text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none"
                    >
                      <option value="always">Sempre</option>
                      <option value="hourly">HorÃ¡ria</option>
                      <option value="daily">DiÃ¡ria</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                      <option value="never">Nunca</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-medium text-[#94a3b8]">
                      Prioridade
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={entry.priority}
                      onChange={(e) => updateURL(entry.id, 'priority', e.target.value)}
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-medium text-[#94a3b8]">
                      Ãšltima modificaÃ§Ã£o
                    </label>
                    <input
                      type="date"
                      value={entry.lastmod}
                      onChange={(e) => updateURL(entry.id, 'lastmod', e.target.value)}
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>
                </div>

                {urls.length > 1 && (
                  <button
                    onClick={() => removeURL(entry.id)}
                    className="text-sm text-[#e8b86d] hover:text-[#e8b86d]/80 transition-colors"
                  >
                    Remover URL
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addURL}
            className="mt-4 rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            + Adicionar URL
          </button>
        </div>

        {/* Output Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            XML Gerado
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96">
              {sitemap || '<!-- Sitemap XML aparecerÃ¡ aqui -->'}
            </pre>

            <div className="absolute right-4 top-4 flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!sitemap}
                className="rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copiar
              </button>
              <button
                onClick={downloadSitemap}
                disabled={!sitemap}
                className="rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#3ddc97] transition-all hover:border-[#3ddc97] hover:bg-[#3ddc97]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Baixar
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Salve o arquivo como <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">sitemap.xml</code></li>
            <li>â€¢ Coloque o arquivo na raiz do seu site</li>
            <li>â€¢ Adicione a URL do sitemap no arquivo robots.txt</li>
            <li>â€¢ Submeta o sitemap no Google Search Console</li>
            <li>â€¢ Prioridade 1.0 Ã© a mais alta, 0.0 Ã© a mais baixa</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/sitemap')({
  component: SitemapPage,
});

