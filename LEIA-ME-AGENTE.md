# Agente de Notícias — DigitalTech (versão 100% gratuita, com Ollama)

Arquivos para copiar para dentro do seu repositório `AdminFreitas/DigitalTech`,
mantendo esta mesma estrutura de pastas:

```
.github/workflows/agente-noticias.yml
scripts/agente/*.ts
```

Nenhuma ferramenta paga é usada: o texto é gerado pelo **Ollama** (instalado
do zero a cada execução, dentro do próprio GitHub Actions), as imagens vêm
do Unsplash/Pexels (free tier) e o banco é o Neon (free tier).

## 1. Instalar dependências

```bash
npm install @neondatabase/serverless rss-parser
npm install -D tsx
```

(Não precisa mais do `@anthropic-ai/sdk` — removido nesta versão.)

## 2. Ajustar o schema em `publicar.ts`

O arquivo assume uma tabela `artigos` com colunas como `titulo`, `slug`,
`corpo_md`, `tags`, `categoria`, `imagem_url`, etc. (comentário no topo do
arquivo). Ajuste as queries SQL se seu schema real for diferente.

## 3. Ajustar os feeds RSS (opcional)

Em `buscar-topico.ts` há uma lista `FEEDS` com fontes de notícias de
tecnologia em português. Troque ou adicione feeds conforme o foco do seu
blog (ex: feeds específicos de IA, cibersegurança, etc.).

## 4. Conseguir as chaves de API gratuitas

- **DATABASE_URL**: connection string do Neon (console.neon.tech → seu
  projeto → "Connection Details").
- **UNSPLASH_ACCESS_KEY**: crie um app gratuito em
  https://unsplash.com/developers → copie o "Access Key".
- **PEXELS_API_KEY** (opcional, usado como fallback): crie em
  https://www.pexels.com/api/.

Não é preciso nenhuma chave para o Ollama — ele roda localmente dentro do
próprio runner do GitHub Actions.

## 5. Cadastrar os secrets no GitHub

**Settings → Secrets and variables → Actions → New repository secret**:
`DATABASE_URL`, `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`.

## 6. Testar

- **Actions → Agente de Notícias DigitalTech → Run workflow** para disparar
  manualmente antes de confiar no cron.
- Repare que cada execução instala o Ollama e baixa o modelo do zero (o
  runner é descartado ao final), então a primeira parte do log sempre leva
  alguns minutos — isso é esperado e não custa nada além do tempo de
  execução gratuito do Actions.

## Como funciona o pipeline

1. `buscar-topico.ts` — lê feeds RSS gratuitos de tecnologia, ignora
   notícias já publicadas e usa o Ollama para transformar a escolhida em um
   "tópico" (título em pt-BR, palavras-chave para imagem, categoria).
2. `gerar-artigo.ts` — usa o Ollama, com o resumo da notícia original como
   contexto, para escrever o artigo completo em Markdown.
3. `gerar-imagem.ts` — busca uma foto livre de direitos (Unsplash, com
   fallback para Pexels).
4. `publicar.ts` — insere o artigo pronto na tabela `artigos` do Neon.
5. `index.ts` — orquestra os passos acima; é o que o Actions executa.

## Observações importantes

- **Modelo do Ollama**: usei `llama3.2:3b` por ser leve o bastante para
  rodar em CPU (o runner do GitHub não tem GPU). Se as respostas saírem
  fracas ou o JSON vier malformado, pode trocar para um modelo maior no
  workflow (ex: `llama3.1:8b`) — só vai demorar mais para baixar e rodar.
  Se quiser mais velocidade, `llama3.2:1b` é ainda mais leve.
- **JSON malformado**: modelos locais menores erram formato de JSON com mais
  frequência que APIs maiores. Se isso acontecer com frequência nos logs,
  me avise — dá pra adicionar uma camada extra que tenta corrigir/repetir a
  geração automaticamente.
- Como você pediu publicação direta (sem rascunho), vale acompanhar de perto
  os primeiros artigos pelos logs do Actions.
- Sempre credite a foto (autor + link) — exigido pelas licenças do
  Unsplash/Pexels.
