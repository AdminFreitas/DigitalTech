import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface SmsService {
  name: string;
  url: string;
  note: string;
}

const SMS_SERVICES: SmsService[] = [
  {
    name: 'receive-sms-online.info',
    url: 'https://receive-sms-online.info/',
    note: 'Vários países, atualização manual da caixa de mensagens.',
  },
  {
    name: 'receivesms.co',
    url: 'https://receivesms.co/',
    note: 'Lista de números por país, histórico de SMS recebidos visível a qualquer visitante.',
  },
  {
    name: 'sms-online.co',
    url: 'https://sms-online.co/',
    note: 'Vários números ativos simultaneamente, sem cadastro.',
  },
  {
    name: 'receive-smss.com',
    url: 'https://receive-smss.com/',
    note: 'Interface simples, foco em números dos EUA e Europa.',
  },
];

type Step = 'frontend' | 'serverless' | 'provider';

const ROADMAP: Record<Step, { title: string; description: string; items: string[] }> = {
  frontend: {
    title: '1. Onde vocês estão hoje',
    description: 'Site estático (frontend puro), sem servidor próprio guardando segredos.',
    items: [
      'Nenhuma chave de API paga pode ficar exposta no código do navegador',
      'Por isso, receber SMS real de forma privada não é possível só com frontend',
    ],
  },
  serverless: {
    title: '2. Passo intermediário: functions serverless',
    description: 'Vercel, Netlify e Cloudflare Pages permitem adicionar "functions" sem sair do modelo de deploy estático.',
    items: [
      'Uma function roda no servidor deles, não no navegador do usuário',
      'É onde a chave de API do provedor de SMS ficaria guardada com segurança (variável de ambiente)',
      'O frontend chama a sua própria function, e ela chama o provedor de SMS por trás',
    ],
  },
  provider: {
    title: '3. Escolher um provedor de números',
    description: 'Serviços pagos que alugam números reais e expõem API para consultar SMS recebidos.',
    items: [
      'Twilio — mais caro, mais confiável, documentação excelente',
      '5sim.net — números avulsos baratos, focado em verificação única',
      'sms-activate.io — similar ao 5sim, boa cobertura de países',
      'Todos exigem conta, saldo pré-pago e uma chamada autenticada feita pelo backend',
    ],
  },
};

export function TelefoneTemporarioPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const copyServiceUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    showToast('Link copiado!');
  };

  return (
    <ToolLayout
      title="Telefone Temporário"
      description="Central de acesso a serviços públicos de SMS temporário, e roteiro para integrar um provedor real."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        <div className="rounded-lg border border-[#f87171] bg-[#f87171]/10 p-4 text-sm text-[#f87171]">
          ⚠ <strong>Estes números são públicos e compartilhados</strong> — qualquer pessoa no mundo
          pode ver os SMS recebidos neles. Use apenas para testar se o SEU sistema consegue disparar
          um SMS com sucesso (ex: confirmar que o formato do código está correto). Nunca use para
          contas reais, recuperação de senha, autenticação de dois fatores ou qualquer dado sensível.
        </div>

        {/* Serviços públicos */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Serviços Públicos de SMS Temporário
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SMS_SERVICES.map((service) => (
              <div key={service.name} className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                <div className="font-mono text-sm text-[#00d4ff]">{service.name}</div>
                <p className="mt-1 text-xs text-[#94a3b8]">{service.note}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1.5 text-xs text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
                  >
                    Abrir em nova aba
                  </a>
                  <button
                    onClick={() => copyServiceUrl(service.url)}
                    className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-3 py-1.5 text-xs text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#94a3b8]">
            Por serem sites de terceiros com termos próprios (e não oferecerem API pública para
            embutir), a ferramenta abre-os em nova aba em vez de tentar carregá-los aqui dentro.
          </p>
        </div>

        {/* Roteiro para versão real integrada */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Roteiro para uma Versão Integrada de Verdade
          </h3>
          <div className="space-y-4">
            {(Object.keys(ROADMAP) as Step[]).map((key) => {
              const step = ROADMAP[key];
              return (
                <div key={key} className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                  <div className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                    {step.title}
                  </div>
                  <p className="mt-1 text-sm text-[#94a3b8]">{step.description}</p>
                  <ul className="mt-2 space-y-1">
                    {step.items.map((item, i) => (
                      <li key={i} className="text-sm text-[#94a3b8]">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exemplo de function serverless */}
        <div>
          <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
            Exemplo — Netlify/Vercel Function (esqueleto, não funcional sem conta no provedor)
          </h3>
          <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 font-mono text-xs text-[#3ddc97]">
{`// api/sms/comprar-numero.ts (roda no servidor, nunca no navegador)
export default async function handler(req, res) {
  const apiKey = process.env.SMS_PROVIDER_API_KEY; // segredo, nunca no frontend

  const response = await fetch('https://provedor-de-sms.exemplo/api/numero', {
    headers: { Authorization: \`Bearer \${apiKey}\` },
  });

  const data = await response.json();
  res.status(200).json(data); // devolve só o necessário pro frontend
}`}
          </pre>
        </div>

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• Para testes internos da equipe, considere comprar um número dedicado de baixo custo em vez de usar números públicos</li>
            <li>• Se decidirem integrar um provedor pago, comecem pelo 5sim ou sms-activate — mais baratos para testes pontuais</li>
            <li>• A ferramenta de E-mail Temporário, ao lado, já funciona de forma real e privada — use-a como referência</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/telefone-temporario')({
  component: TelefoneTemporarioPage,
});
