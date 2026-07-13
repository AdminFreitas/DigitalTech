import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface RobotRule {
  id: string;
  userAgent: string;
  disallow: string[];
  allow: string[];
}

export function RobotsPage() {
  const [rules, setRules] = useState<RobotRule[]>([
    {
      id: '1',
      userAgent: '*',
      disallow: [],
      allow: [],
    },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml');
  const [crawlDelay, setCrawlDelay] = useState('');

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now().toString(),
        userAgent: '*',
        disallow: [],
        allow: [],
      },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter((r) => r.id !== id));
    }
  };

  const updateRule = (id: string, field: keyof RobotRule, value: any) => {
    setRules(
      rules.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const addDisallow = (id: string) => {
    setRules(
      rules.map((r) =>
        r.id === id ? { ...r, disallow: [...r.disallow, ''] } : r
      )
    );
  };

  const removeDisallow = (id: string, index: number) => {
    setRules(
      rules.map((r) =>
        r.id === id
          ? { ...r, disallow: r.disallow.filter((_, i) => i !== index) }
          : r
      )
    );
  };

  const updateDisallow = (id: string, index: number, value: string) => {
    setRules(
      rules.map((r) =>
        r.id === id
          ? {
              ...r,
              disallow: r.disallow.map((d, i) => (i === index ? value : d)),
            }
          : r
      )
    );
  };

  const generateRobots = () => {
    const lines: string[] = [];

    rules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent}`);

      rule.allow.forEach((path) => {
        if (path.trim()) {
          lines.push(`Allow: ${path}`);
        }
      });

      rule.disallow.forEach((path) => {
        if (path.trim()) {
          lines.push(`Disallow: ${path}`);
        }
      });

      if (crawlDelay && rule.userAgent !== '*') {
        lines.push(`Crawl-delay: ${crawlDelay}`);
      }

      lines.push('');
    });

    if (sitemapUrl.trim()) {
      lines.push(`Sitemap: ${sitemapUrl}`);
    }

    return lines.join('\n').trim();
  };

  const robotsContent = generateRobots();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(robotsContent);
    alert('Robots.txt copiado para a Ã¡rea de transferÃªncia!');
  };

  const downloadRobots = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(robotsContent));
    element.setAttribute('download', 'robots.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <ToolLayout
      title="Robots.txt"
      description="Gerador e validador de arquivo robots.txt para controle de rastreamento."
    >
      <div className="space-y-8">
        {/* Rules Section */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Regras de Rastreamento
          </h3>

          <div className="space-y-6">
            {rules.map((rule, ruleIndex) => (
              <div key={rule.id} className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    User-agent
                  </label>
                  <input
                    type="text"
                    value={rule.userAgent}
                    onChange={(e) => updateRule(rule.id, 'userAgent', e.target.value)}
                    placeholder="Ex: Googlebot, * (todos)"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Use * para aplicar a todos os bots
                  </p>
                </div>

                {/* Allow Paths */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Permitir (Allow)
                  </label>
                  <div className="space-y-2">
                    {rule.allow.map((path, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => updateRule(rule.id, 'allow', rule.allow.map((p, i) => i === index ? e.target.value : p))}
                          placeholder="/pagina-publica/"
                          className="flex-1 rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                        />
                        <button
                          onClick={() => updateRule(rule.id, 'allow', rule.allow.filter((_, i) => i !== index))}
                          className="text-[#e8b86d] hover:text-[#e8b86d]/80 transition-colors"
                        >
                          âœ•
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disallow Paths */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Bloquear (Disallow)
                  </label>
                  <div className="space-y-2">
                    {rule.disallow.map((path, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => updateDisallow(rule.id, index, e.target.value)}
                          placeholder="/admin/ /privado/"
                          className="flex-1 rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                        />
                        <button
                          onClick={() => removeDisallow(rule.id, index)}
                          className="text-[#e8b86d] hover:text-[#e8b86d]/80 transition-colors"
                        >
                          âœ•
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addDisallow(rule.id)}
                    className="mt-2 text-sm text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                  >
                    + Adicionar caminho
                  </button>
                </div>

                {rules.length > 1 && (
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="text-sm text-[#e8b86d] hover:text-[#e8b86d]/80 transition-colors"
                  >
                    Remover regra
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRule}
            className="mt-4 rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            + Adicionar regra
          </button>
        </div>

        {/* Global Settings */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            ConfiguraÃ§Ãµes Globais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                URL do Sitemap
              </label>
              <input
                type="url"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                Crawl Delay (segundos)
              </label>
              <input
                type="number"
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(e.target.value)}
                placeholder="Deixe em branco para desabilitar"
                className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-3 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              />
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Arquivo Gerado
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96">
              {robotsContent || '# Robots.txt aparecerÃ¡ aqui'}
            </pre>

            <div className="absolute right-4 top-4 flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!robotsContent}
                className="rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copiar
              </button>
              <button
                onClick={downloadRobots}
                disabled={!robotsContent}
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
            <li>â€¢ Salve como <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">robots.txt</code> na raiz do site</li>
            <li>â€¢ Use <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">Disallow: /</code> para bloquear tudo</li>
            <li>â€¢ Use <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">Allow</code> para exceÃ§Ãµes especÃ­ficas</li>
            <li>â€¢ Sempre inclua o Sitemap para melhor indexaÃ§Ã£o</li>
            <li>â€¢ Diferentes bots podem ter diferentes regras</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/robots')({
  component: RobotsPage,
});

