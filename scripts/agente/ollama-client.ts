const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

/**
 * Envia um prompt para o Ollama local e retorna a resposta em texto.
 * Por padrão aponta para http://localhost:11434 (Ollama rodando na
 * mesma máquina/runner). Ajuste OLLAMA_BASE_URL se o Ollama estiver
 * em outro endereço.
 */
export async function perguntarOllama(prompt: string): Promise<string> {
  const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!resp.ok) {
    throw new Error(`Ollama respondeu ${resp.status}: ${await resp.text()}`);
  }

  const data = (await resp.json()) as { response: string };
  return data.response;
}
