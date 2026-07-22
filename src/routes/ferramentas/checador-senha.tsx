import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolLayout } from "@/components/ferramentas/ToolLayout";

export const Route = createFileRoute("/ferramentas/checador-senha")({
  component: ChecadorSenhaPage,
});

// Converte a senha em SHA-1 hexadecimal usando a Web Crypto API do próprio
// navegador — a senha nunca sai da máquina do usuário nessa etapa.
async function sha1Hex(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-1", dados);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// Consulta a API k-Anonymity do HaveIBeenPwned (Pwned Passwords):
// manda só os 5 primeiros caracteres do hash, nunca a senha nem o hash
// completo. A API devolve todos os sufixos que começam com esse prefixo,
// e a comparação final acontece aqui no navegador.
async function verificarVazamento(senha: string): Promise<number> {
  const hash = await sha1Hex(senha);
  const prefixo = hash.slice(0, 5);
  const sufixoAlvo = hash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefixo}`);
  if (!res.ok) throw new Error("Não foi possível consultar o serviço agora.");

  const texto = await res.text();
  for (const linha of texto.split("\n")) {
    const [sufixo, contagem] = linha.trim().split(":");
    if (sufixo === sufixoAlvo) return parseInt(contagem, 10);
  }
  return 0;
}

function calcularEntropia(senha: string): number {
  let tamanhoAlfabeto = 0;
  if (/[a-z]/.test(senha)) tamanhoAlfabeto += 26;
  if (/[A-Z]/.test(senha)) tamanhoAlfabeto += 26;
  if (/[0-9]/.test(senha)) tamanhoAlfabeto += 10;
  if (/[^a-zA-Z0-9]/.test(senha)) tamanhoAlfabeto += 32;
  if (tamanhoAlfabeto === 0 || senha.length === 0) return 0;
  return senha.length * Math.log2(tamanhoAlfabeto);
}

function classificarForca(entropia: number) {
  if (entropia === 0) return { label: "—", cor: "#475569", nivel: 0 };
  if (entropia < 28) return { label: "Muito fraca", cor: "#ef4444", nivel: 1 };
  if (entropia < 36) return { label: "Fraca", cor: "#f97316", nivel: 2 };
  if (entropia < 60) return { label: "Média", cor: "#e8b86d", nivel: 3 };
  if (entropia < 90) return { label: "Forte", cor: "#3ddc97", nivel: 4 };
  return { label: "Muito forte", cor: "#00d4ff", nivel: 5 };
}

const CRITERIOS = [
  { label: "8 ou mais caracteres", teste: (s: string) => s.length >= 8 },
  { label: "Letra minúscula", teste: (s: string) => /[a-z]/.test(s) },
  { label: "Letra maiúscula", teste: (s: string) => /[A-Z]/.test(s) },
  { label: "Número", teste: (s: string) => /[0-9]/.test(s) },
  { label: "Símbolo (!@#$...)", teste: (s: string) => /[^a-zA-Z0-9]/.test(s) },
];

function ChecadorSenhaPage() {
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [vazamentos, setVazamentos] = useState<number | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState("");

  const entropia = calcularEntropia(senha);
  const forca = classificarForca(entropia);

  const checar = async () => {
    if (!senha) return;
    setVerificando(true);
    setErro("");
    setVazamentos(null);
    try {
      const n = await verificarVazamento(senha);
      setVazamentos(n);
    } catch {
      setErro("Não foi possível consultar o banco de vazamentos agora. Tente de novo em instantes.");
    } finally {
      setVerificando(false);
    }
  };

  return (
    <ToolLayout
      title="Checador de Senha"
      description="Entropia, força e vazamentos conhecidos — verificado com a base pública do Have I Been Pwned, sem enviar sua senha pra lugar nenhum."
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-[#94a3b8]">Sua senha</label>
          <div className="flex gap-2">
            <input
              type={mostrar ? "text" : "password"}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setVazamentos(null);
                setErro("");
              }}
              placeholder="Digite uma senha para testar"
              className="flex-1 rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-3 text-[#f8fafc] outline-none focus:border-[#00d4ff]"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="shrink-0 rounded-lg border border-[#161f30] bg-[#161f30] px-4 text-sm text-[#94a3b8] hover:text-[#f8fafc]"
            >
              {mostrar ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {senha && (
          <>
            {/* Barra de força */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-[#94a3b8]">Força</span>
                <span style={{ color: forca.cor }} className="font-semibold">
                  {forca.label}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#0b1020]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(forca.nivel / 5) * 100}%`, backgroundColor: forca.cor }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#475569]">
                Entropia estimada: {entropia.toFixed(1)} bits
              </p>
            </div>

            {/* Checklist de critérios */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CRITERIOS.map((c) => {
                const ok = c.teste(senha);
                return (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    <span style={{ color: ok ? "#3ddc97" : "#475569" }}>{ok ? "✓" : "○"}</span>
                    <span className={ok ? "text-[#f8fafc]" : "text-[#475569]"}>{c.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Verificação de vazamento */}
            <div className="border-t border-[#161f30] pt-5">
              <button
                type="button"
                onClick={checar}
                disabled={verificando}
                className="rounded-lg bg-[#00d4ff] px-5 py-2.5 text-sm font-semibold text-[#0b1020] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {verificando ? "Verificando..." : "Checar vazamentos conhecidos"}
              </button>

              {erro && <p className="mt-3 text-sm text-[#ef4444]">{erro}</p>}

              {vazamentos !== null && !erro && (
                <div
                  className="mt-4 rounded-lg border p-4 text-sm"
                  style={{
                    borderColor: vazamentos > 0 ? "#ef444440" : "#3ddc9740",
                    backgroundColor: vazamentos > 0 ? "#ef444410" : "#3ddc9710",
                    color: vazamentos > 0 ? "#ef4444" : "#3ddc97",
                  }}
                >
                  {vazamentos > 0 ? (
                    <>
                      ⚠ Essa senha já apareceu em{" "}
                      <strong>{vazamentos.toLocaleString("pt-BR")}</strong> vazamento(s)
                      conhecido(s). Não use ela em lugar nenhum.
                    </>
                  ) : (
                    <>✓ Essa senha não foi encontrada nos vazamentos conhecidos até agora.</>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-[#475569]">
                A senha é transformada em hash SHA-1 direto no seu navegador. Só os 5 primeiros
                caracteres do hash são enviados pra API pública do Have I Been Pwned — a senha
                completa nunca sai da sua máquina.
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
