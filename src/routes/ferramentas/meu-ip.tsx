import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  postal?: string;
  org?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export function MeuIpPage() {
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const fetchIp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('Falha ao consultar o serviço de IP.');
      const data = await response.json();
      if (data.error) throw new Error(data.reason || 'Não foi possível obter o IP.');
      setInfo(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(message);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIp();
  }, [fetchIp]);

  const copyIp = async () => {
    if (!info?.ip) {
      showToast('IP ainda não disponível.');
      return;
    }
    await navigator.clipboard.writeText(info.ip);
    showToast('IP copiado!');
  };

  const fields: { label: string; value: string | undefined }[] = info
    ? [
        { label: 'Cidade', value: info.city },
        { label: 'Região', value: info.region },
        { label: 'País', value: info.country_name },
        { label: 'CEP aproximado', value: info.postal },
        { label: 'Provedor (ISP)', value: info.org },
        { label: 'Fuso horário', value: info.timezone },
        {
          label: 'Coordenadas',
          value:
            info.latitude !== undefined && info.longitude !== undefined
              ? `${info.latitude}, ${info.longitude}`
              : undefined,
        },
      ]
    : [];

  return (
    <ToolLayout
      title="Qual é o meu IP"
      description="Consulte seu endereço IP público e informações de localização aproximada."
    >
      <div className="space-y-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#3ddc97] bg-[#0b1020] px-4 py-3 text-sm text-[#3ddc97] shadow-lg">
            ✓ {toast}
          </div>
        )}

        {/* IP em destaque */}
        <div className="rounded-lg border border-[#161f30] bg-[#0b1020] p-8 text-center">
          <div className="text-xs uppercase tracking-wide text-[#94a3b8]">Seu endereço IP</div>
          {loading ? (
            <div className="mt-3 font-mono text-3xl text-[#94a3b8]">Consultando...</div>
          ) : error ? (
            <div className="mt-3 text-lg text-[#f87171]">✕ {error}</div>
          ) : (
            <div className="mt-3 font-mono text-3xl text-[#00d4ff]">{info?.ip}</div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchIp}
            className="rounded-lg border border-[#00d4ff] bg-[#00d4ff]/10 px-4 py-2 text-sm text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20"
          >
            Consultar novamente
          </button>
          <button
            onClick={copyIp}
            className="rounded-lg border border-[#e8b86d] bg-[#e8b86d]/10 px-4 py-2 text-sm text-[#e8b86d] transition-all hover:bg-[#e8b86d]/20"
          >
            Copiar IP
          </button>
        </div>

        {/* Informações adicionais */}
        {info && (
          <div>
            <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
              Informações de Localização Aproximada
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="rounded-lg border border-[#161f30] bg-[#0b1020] p-4">
                    <div className="text-xs text-[#94a3b8]">{f.label}</div>
                    <div className="mt-1 font-mono text-sm text-[#f8fafc]">{f.value}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>• O IP exibido é o público, usado pela sua rede para acessar a internet</li>
            <li>• A localização é aproximada, baseada no provedor de internet, não no GPS</li>
            <li>• Esta ferramenta consulta o serviço externo ipapi.co para obter os dados</li>
            <li>• Se você usa VPN ou proxy, o IP exibido será o deles, não o da sua rede local</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/meu-ip')({
  component: MeuIpPage,
});
