import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function PixelHelperPage() {
  const [pixelId, setPixelId] = useState('');
  const [pixelType, setPixelType] = useState('facebook');

  const generatePixelCode = () => {
    if (!pixelId.trim()) return '';

    if (pixelType === 'facebook') {
      return `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>`;
    } else if (pixelType === 'google') {
      return `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pixelId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pixelId}');
</script>`;
    } else if (pixelType === 'tiktok') {
      return `<!-- TikTok Pixel -->
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["track","trackLink","trackForm","trackCustom","trackPage","trackPageView"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;++i)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||{},n=0;n<ttq.methods.length;++n)ttq[ttq.methods[n]].bind(ttq,t);return e};
    ttq.load=function(e,t){var n={"pixel_code":e};n.user_id=t,ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e].push(n),
    ttq.track("PageView")};
    ttq.load('${pixelId}');
  }(window,document,'ttq');
</script>`;
    }

    return '';
  };

  const pixelCode = generatePixelCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixelCode);
    alert('CÃ³digo do pixel copiado!');
  };

  return (
    <ToolLayout
      title="Pixel Helper"
      description="Ferramenta para auxiliar na implementaÃ§Ã£o e depuraÃ§Ã£o de pixels de rastreamento."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              Tipo de Pixel
            </label>
            <select
              value={pixelType}
              onChange={(e) => setPixelType(e.target.value)}
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            >
              <option value="facebook">Facebook Pixel</option>
              <option value="google">Google Analytics</option>
              <option value="tiktok">TikTok Pixel</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
              ID do Pixel
            </label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder={
                pixelType === 'facebook'
                  ? 'Ex: 123456789'
                  : pixelType === 'google'
                    ? 'Ex: G-XXXXXXXXXX'
                    : 'Ex: C5XXXXXXXXX'
              }
              className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            CÃ³digo Gerado
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96 font-mono">
              {pixelCode || '<!-- CÃ³digo do pixel aparecerÃ¡ aqui -->'}
            </pre>

            <button
              onClick={copyToClipboard}
              disabled={!pixelCode}
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
            <li>â€¢ Coloque o cÃ³digo no <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">&lt;head&gt;</code> da pÃ¡gina</li>
            <li>â€¢ Teste com ferramentas de depuraÃ§Ã£o da plataforma</li>
            <li>â€¢ Verifique se o pixel estÃ¡ disparando corretamente</li>
            <li>â€¢ Use o Facebook Pixel Helper para validar</li>
            <li>â€¢ Implemente eventos customizados para melhor rastreamento</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/pixel-helper')({
  component: PixelHelperPage,
});

