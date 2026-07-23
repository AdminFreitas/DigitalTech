import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

const API_BASE = 'https://api.mail.tm';

interface Domain {
  domain: string;
}

interface InboxMessage {
  id: string;
  from: { address: string; name?: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

interface MessageDetail extends InboxMessage {
  text?: string;
  html?: string[];
}

interface Session {
  address: string;
  password: string;
  token: string;
}

type Status = 'idle' | 'creating' | 'ready' | 'error';

const REFRESH_OPTIONS = [
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: 'Manual', value: 0 },
];

function randomLocalPart(): string {
  return `dt${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 12) + 'Aa1!';
}

function extractVerificationInfo(text: string): { code: string | null; link: string | null } {
  const codeMatch = text.match(/\b\d{4,8}\b/);
  const linkMatch = text.match(/https?:\/\/\S*(verify|confirm|token|activate|validacao|confirmar)\S*/i);
  return {
    code: codeMatch ? codeMatch[0] : null,
    link: linkMatch ? linkMatch[0].replace(/["')>,.]+$/, '') : null,
  };
}

export function EmailTemporarioPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [toast, setToast] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const createInbox = useCallback(async () => {
    setStatus('creating');
    setError(null);
    setMessages([]);
    setSelected(null);
    try {
      const domainsRes = await fetch(`${API_BASE}/domains`);
      if (!domainsRes.ok) throw new Error('Não foi possível obter domínios disponíveis.');
      const domainsData = await domainsRes.json();
      const domains: Domain[] = domainsData['hydra:member'] ?? domainsData;
      if (!domains || domains.length === 0) throw new Error('Nenhum domínio disponível no momento.');

      const domain = domains[Math.floor(Math.random() * domains.length)].domain;
      const address = `${randomLocalPart()}@${domain}`;
      const password = randomPassword();

      const createRes = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      if (!createRes.ok) throw new Error('Não foi possível criar a caixa de e-mail.');

      const tokenRes = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      if (!tokenRes.ok) throw new Error('Não foi possível autenticar a caixa de e-mail.');
      const tokenData = await tokenRes.json();

      setSession({ address, password, token: tokenData.token });
      setStatus('ready');
      showToast('Caixa de e-mail criada!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao criar e-mail.');
      setStatus('error');
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: InboxMessage[] = data['hydra:member'] ?? data;
      setMessages(list);
    } catch {
      // falha silenciosa em polling — não interrompe a experiência
    }
  }, [session]);

  const openMessage = async (id: string) => {
    if (!session) return;
    setSelectedLoading(true);
    try {
      const res = await fetch(`${API_BASE}/messages/${id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error('Não foi possível abrir esta mensagem.');
      const data: MessageDetail = await res.json();
      setSelected(data);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, seen: true } : m)));
    } catch {
      showToast('Erro ao abrir mensagem.');
    } finally {
      setSelectedLoading(false);
    }
  };

  // Polling automático
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (session && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchMessages, refreshInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, refreshInterval, fetchMessages]);

  useEffect(() => {
    if (session) fetchMessages();
  }, [session, fetchMessages]);

  const copyAddress = async () => {
    if (!session) return;
    await navigator.clipboard.writeText(session.address);
    showToast('E-mail copiado!');
  };

  const encerrarSessao = () => {
    setSession(null);
    setMessages([]);
    setSelected(null);
    setStatus('idle');
  };

  const selectedText = selected?.text ?? (selected?.html ? selected.html.join(' ') : '');
  const verificationInfo = selectedText ? extractVerificationInfo(selectedText) : { code: null, link: null };

  const copyCode = async () => {
    if (!verificationInfo.code) return;
    await navigator.clipboard.writeText(verificationInfo.code);
    showToast('Código copiado!');
  };

  return (
    <ToolLayout
      title="E-mail Temporário"
      description="Crie uma caixa de e-mail descartável de verdade para testar fluxos de cadastro e confirmação."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        <div className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 p-4 text-sm text-[#e8b86d]">
          ⚠ Esta caixa de e-mail é real, mas pública/descartável — nunca use para dados sensíveis,
          contas pessoais ou recuperação de senha de contas importantes. Ideal para testar se o
          e-mail de confirmação do seu sistema está sendo enviado corretamente.
        </div>

        {/* Estado inicial */}
        {status === 'idle' && (
          <button
            onClick={createInbox}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Criar e-mail temporário
          </button>
        )}

        {status === 'creating' && (
          <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-8 text-center text-[#94a3b8]">
            Criando caixa de e-mail...
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#f87171] bg-[#f87171]/10 p-4 text-sm text-[#f87171]">
              ✕ {error}
            </div>
            <button
              onClick={createInbox}
              className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {status === 'ready' && session && (
          <>
            {/* Endereço em destaque */}
            <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-6 text-center">
              <div className="text-xs uppercase tracking-wide text-[#94a3b8]">Seu e-mail temporário</div>
              <div className="mt-2 break-all font-mono text-xl text-[#00d4ff]">{session.address}</div>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAddress}
                className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
              >
                Copiar E-mail
              </button>
              <button
                onClick={fetchMessages}
                className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
              >
                Atualizar Caixa de Entrada
              </button>
              <button
                onClick={createInbox}
                className="rounded-lg border border-[#94a3b8] bg-[#94a3b8]/10 px-4 py-2 text-sm text-[#94a3b8] transition-all hover:bg-[#94a3b8]/20"
              >
                Nova Caixa
              </button>
              <button
                onClick={encerrarSessao}
                className="rounded-lg border border-[#f87171] bg-[#f87171]/10 px-4 py-2 text-sm text-[#f87171] transition-all hover:bg-[#f87171]/20"
              >
                Encerrar Sessão
              </button>

              <div className="ml-auto flex items-center gap-2 text-sm text-[#94a3b8]">
                <span>Atualização automática:</span>
                {REFRESH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRefreshInterval(opt.value)}
                    className={`rounded px-2 py-1 text-xs transition-all ${
                      refreshInterval === opt.value
                        ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                        : 'hover:bg-[#161f30]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout dividido: caixa de entrada / mensagem */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                  Caixa de Entrada ({messages.length})
                </h3>
                <div className="max-h-[28rem] space-y-2 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#94a3b8]">
                      Nenhuma mensagem recebida ainda. Envie um e-mail de teste para o endereço acima.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => openMessage(m.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          selected?.id === m.id
                            ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                            : 'border-[#161f30] bg-[#0b1020] hover:bg-[#161f30]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm text-[#f8fafc]">
                            {m.from?.name || m.from?.address || 'Remetente desconhecido'}
                          </span>
                          {!m.seen && (
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                          )}
                        </div>
                        <div className="truncate text-sm font-medium text-[#f8fafc]">{m.subject}</div>
                        <div className="truncate text-xs text-[#94a3b8]">{m.intro}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#f8fafc]">
                  Mensagem
                </h3>
                <div className="h-[28rem] overflow-y-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                  {selectedLoading && <p className="text-sm text-[#94a3b8]">Carregando...</p>}
                  {!selectedLoading && !selected && (
                    <p className="text-sm text-[#94a3b8]">Selecione uma mensagem na caixa de entrada.</p>
                  )}
                  {!selectedLoading && selected && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold text-[#f8fafc]">{selected.subject}</div>
                        <div className="text-xs text-[#94a3b8]">
                          De: {selected.from?.address} · {new Date(selected.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {(verificationInfo.code || verificationInfo.link) && (
                        <div className="space-y-2 rounded-lg border border-[#3ddc97] bg-[#3ddc97]/10 p-3">
                          {verificationInfo.code && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-[#3ddc97]">
                                Código detectado: <code className="font-mono">{verificationInfo.code}</code>
                              </span>
                              <button
                                onClick={copyCode}
                                className="rounded px-2 py-1 text-xs text-[#3ddc97] hover:bg-[#3ddc97]/10"
                              >
                                Copiar
                              </button>
                            </div>
                          )}
                          {verificationInfo.link && (
                            <div className="truncate text-sm text-[#3ddc97]">
                              Link detectado:{' '}
                              <a
                                href={verificationInfo.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                {verificationInfo.link}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap text-sm text-[#f8fafc]">
                        {selected.text || 'Sem conteúdo em texto simples para esta mensagem.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• A caixa é criada via mail.tm, um serviço público — nada é enviado aos servidores do DigitalTech</li>
            <li>• Códigos e links de confirmação são detectados automaticamente quando possível</li>
            <li>• "Nova Caixa" descarta o endereço atual e cria outro, todo novo teste começa do zero</li>
            <li>• Para produção, sempre use e-mails reais — esta ferramenta é só para testes de desenvolvimento</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/email-temporario')({
  component: EmailTemporarioPage,
});
