# DigitalTech — Conclusão (com base no repositório real)

## O que foi corrigido AGORA, direto no código clonado, testado antes de entregar

| Arquivo (destino no repo) | O que mudou |
|---|---|
| `.github/workflows/static.yml` | Trigger `principal` → `main` (branch que não existia); removida chamada a `npm run artigos:process` (script inexistente) |
| `.github/workflows/publicar-artigos-agente.yml` | Mesma correção de branch nos dois pontos que referenciavam `principal` |
| `src/routes/index.tsx` | Removidos os 2 arrays hardcoded (`featured`/`recent`) com "Em breve" fixo. Agora importa `listarArtigos()` de `content.ts` — os 6 artigos reais de `content/artigos/*.md` passam a aparecer de verdade na home. Badge "Em breve" removido do `ArticleCard`. Link "Ver todos →" corrigido de `#` para `/artigos` |
| `src/routes/artigos/$slug.tsx` | Adicionadas as meta tags Open Graph e Twitter Card que não existiam — compartilhar um artigo agora mostra o título real da matéria, não o nome genérico do site |
| `src/routes/sobre.tsx` (novo) | Página real, substituindo o link morto `#` |
| `src/routes/termos.tsx` (novo) | Rascunho padrão de Termos de Uso — **revisar com um advogado antes de publicar**, principalmente depois de ativar anúncios/afiliados |
| `src/components/Footer.tsx` | Links "Sobre o DigitalTech" e "Termos de Uso" agora apontam para as páginas reais acima |

**Como aplicar:** substitua cada arquivo pelo caminho correspondente no seu projeto local e dê `git push origin main`. Com o `static.yml` corrigido, esse push finalmente deve dispará-lo.

## O que ficou de fora de propósito (não é esquecimento)

- **`/noticias` continua com tema claro e dados estáticos.** É uma frente separada (JSON-LD, sitemap de 48h, IndexNow, FAQ) que construímos em rodadas anteriores, mas que assumia rota `$categoria/$slug` — a rota real é `$slug`. Prefiro não portar isso agora em cima de um arquivo que acabei de reescrever, pra não empilhar risco. Fica como próximo passo.
- **Links `#` em "Newsletter", "Sugestões", "Favoritos" no rodapé** — não são bug de rota, são funcionalidades que ainda não existem. Corrigir o link sem construir a funcionalidade só troca um problema por outro.
- **`/projetos` com "Em breve"** — não mexi. Pelo que você já me contou em conversas anteriores (Meu Treino, Linha do Tempo da Vida ainda em prototipagem no Manus), esse badge parece verdadeiro, diferente do dos artigos.
- **Newsletter sem backend real** (Beehiiv ou similar) — confirmado como problema real, mas integração de serviço externo exige uma conta/API key seguida seguida sua, não é algo que eu resolvo sem essa credencial.

## O roteiro de monetização — só o que dá pra afirmar sem inventar número

Não vou repetir tabela de R$/mês — não existe dado de tráfego real pra sustentar isso, e apresentar estimativa de comunidade como projeção seria o mesmo erro já identificado nesta conversa.

**O que é verificável e sequencial:**

1. **Depoy funcionando + conteúdo real no ar** (feito acima). Sem isso, nada abaixo importa.
2. **Indexação**: submeter `sitemap.xml` no Google Search Console e no Bing Webmaster Tools. Sem isso o Google não sabe que os 6 artigos existem, não importa quão bons sejam.
3. **Elegibilidade institucional pro AdSense**: domínio próprio (✅ já tem), conteúdo original que cumpra as políticas do Google (✅ agora aparece de verdade), site com Sobre/Contato/Privacidade/Termos (✅ completo agora). Google não publica número mínimo de artigos ou de tráfego — não dá pra prometer prazo.
4. **Findability por IA**: o `robots.txt` liberando GPTBot/ClaudeBot/PerplexityBot e o `llms.txt` que entreguei em rodada anterior continuam válidos e não dependem de tráfego — só de estarem publicados. Vale subir junto nesse mesmo push.
5. **Afiliados**: não dependem de aprovação prévia, mas só geram clique real com tráfego real — o que volta pro item 2.
6. **Newsletter, patrocínio, serviços, paywall**: todos dependem de audiência que ainda não existe. Não têm prazo honesto pra estimar hoje.

O bloqueio nunca foi estratégia de monetização — era o deploy nunca ter ido ao ar e a home nunca ter mostrado o conteúdo real que já existia. Isso está corrigido nos arquivos acima; o resto é, de fato, tempo e tráfego.
