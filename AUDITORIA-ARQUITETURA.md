# Auditoria de Arquitetura — DigitalTech

Baseado nos diagnósticos reais que vocês rodaram (`tsc`, `depcheck`, `knip`, `jscpd`) e na
inspeção direta do repositório clonado em 18/07/2026. Todo item abaixo foi conferido no código
real antes de entrar nesta lista — nada aqui é suposição.

## 1. Por que o projeto ficou bagunçado (causa raiz)

Ao longo do desenvolvimento, vários arquivos que deveriam ir para pastas específicas
(`.github/workflows/`, `src/components/`, `src/routes/`) foram colados inteiros dentro de
`src/routes/noticias/` — provavelmente porque era a pasta "ativa" no momento do download. O
Cursor corrigiu os 3 arquivos que realmente pertenciam ali, mas os **originais nunca foram
apagados**, e outros arquivos do mesmo lote (workflows, `Footer.tsx`, `home-index.tsx`, um
`.md` de anotações) ficaram esquecidos no lugar errado. Ao mesmo tempo, ao corrigir `contato.tsx`,
uma cópia de segurança (`contato1.tsx`) ficou pra trás com sua própria rota ativa. O resultado:
arquivos duplicados, rotas fantasmas acessíveis em produção, e confusão sobre qual arquivo é o
"de verdade".

## 2. EXCLUIR — duplicatas confirmadas byte-a-byte ou funcionalmente idênticas

Cada um foi comparado com `diff` contra o arquivo real antes de entrar aqui.

| Arquivo | Por quê | Confirmação |
|---|---|---|
| `src/routes/noticias/Footer.tsx` | Cópia idêntica de `src/components/Footer.tsx` | `diff` = 100% idêntico |
| `src/routes/artigos/styles.css` | Cópia de `src/styles.css` (só um comentário difere) | `diff` = 1 linha de comentário |
| `src/routes/noticias/home-index.tsx` | Cópia **desatualizada** de `src/routes/index.tsx` — cria a rota fantasma `/noticias/home-index`, acessível em produção | `diff`: falta a seção "Sobre" adicionada depois |
| `src/routes/contato1.tsx` | Versão anterior de `contato.tsx`, de antes da correção do cabeçalho duplicado — cria a rota fantasma `/contato1` | `diff`: ainda tem o `<header>` local que foi removido |
| `src/routes/noticias/static.yml` | Cópia sem função — o real está em `.github/workflows/static.yml` | Confirmado: `.github/workflows/` já tem o correto |
| `src/routes/noticias/publicar-artigos-agente.yml` | Mesma situação | Idem |
| `src/routes/noticias/CONCLUSAO.md` | Anotação de chat que foi parar dentro do código-fonte por engano | — |
| `src/components/noticias/NewsFooter.tsx` | Arquivo órfão, nenhuma rota importa | `knip`: 0 referências |

## 3. EXCLUIR — pasta inteira de protótipos abandonados

`_staging/` — **2,1 MB, 234 arquivos**, dois apps completos gerados pelo Manus (tRPC + Drizzle +
Postgres + OAuth) para "notícias" e "categorias" que nunca foram integrados ao site real.
`knip` confirma **zero referências** de qualquer arquivo dentro de `src/` para dentro de
`_staging/`. Isso sozinho é a maior parte da bagunça do projeto.

## 4. EXCLUIR (recomendado, passo separado) — componentes shadcn/ui nunca usados

`knip` encontrou **46 arquivos** em `src/components/ui/` sem nenhuma importação em lugar
nenhum do projeto (accordion, alert-dialog, avatar, calendar, carousel, chart, command,
dialog, drawer, dropdown-menu, form, menubar, navigation-menu, pagination, popover, select,
sidebar, slider, table, tabs, tooltip, e mais). Isso é sobra normal de template inicial —
ninguém usa todos os componentes de um kit de UI. `depcheck` confirma o mesmo padrão nas
dependências: **43 dos 70 pacotes do `package.json` não são usados em lugar nenhum**
(a maioria são os pacotes `@radix-ui/*` que sustentam exatamente esses componentes não usados).

Separei isso em passo próprio (seção 6) porque é um volume grande — melhor revisar e commitar
sozinho, pra reverter fácil se algo quebrar.

## 5. CORRIGIR — os 14 erros reais de TypeScript

Já corrigidos nos 3 arquivos anexados a esta mensagem:

| Arquivo | Erro | Causa | Correção aplicada |
|---|---|---|---|
| `artigos/$slug.tsx` | 7x "artigo is possibly undefined" | O `loader` já garante que `artigo` existe (lança `notFound()` senão), mas o tipo de `useLoaderData()` do TanStack Router não propaga essa garantia pro TypeScript | Adicionada guarda `if (!artigo) return null;` logo no início do componente |
| `artigos/index.tsx` | 3x erro de tipo em `to={\`/artigos/\${slug}\`}` | Link com URL montada por template string não bate com as rotas tipadas geradas pelo TanStack Router | Trocado para o padrão tipado: `to="/artigos/$slug" params={{ slug }}` — mesmo padrão que já funciona em `/noticias` |
| `categorias/$categoria.tsx` | 1x erro em `to="/#categorias"` | Hash embutido direto na string não é uma rota válida | Trocado para `to="/" hash="categorias"` (prop separada, como o TanStack Router espera) |

Bônus: os dois últimos arquivos também usavam `pt-28` fixo — padronizei para
`pt-[var(--header-clearance)]`, mesmo padrão do resto do site.

## 6. Estrutura-alvo (arquitetura limpa)

Depois da limpeza, a área de conteúdo do site fica assim — cada pasta com uma responsabilidade
só, sem arquivo solto:

```
src/
├── routes/                    # 1 arquivo = 1 rota (convenção do TanStack Router)
│   ├── __root.tsx              # layout raiz: Header + Outlet + Footer
│   ├── index.tsx                # home
│   ├── contato.tsx
│   ├── sobre.tsx
│   ├── termos.tsx
│   ├── politica-de-privacidade.tsx
│   ├── artigos/
│   │   ├── index.tsx            # listagem
│   │   └── $slug.tsx            # artigo individual
│   ├── noticias/
│   │   ├── index.tsx
│   │   └── $slug.tsx
│   ├── categorias/
│   │   └── $categoria.tsx
│   └── ferramentas/              # (fica pra próxima rodada)
│
├── components/                 # componentes reutilizados por MAIS DE UMA rota
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchModal.tsx
│   ├── noticias/
│   │   ├── NewsCard.tsx
│   │   └── dados.ts
│   └── ferramentas/
│       └── ToolLayout.tsx
│
├── lib/                        # lógica pura, sem JSX — leitura de conteúdo, formatação
│   ├── content.ts               # lê content/artigos/*.md
│   ├── ferramentas.ts
│   └── utils.ts
│
└── styles.css                   # 1 arquivo de estilo global só
```

Regra prática pra manter isso daqui pra frente: **se um arquivo `.tsx` faz `createFileRoute(...)`,
ele mora em `src/routes/` e só lá.** Se dois lugares importam o mesmo componente, ele vai pra
`src/components/`. Nada de `.yml`, `.md` ou `.css` duplicado dentro de `src/routes/`.

## 7. Não mexido nesta rodada (por decisão sua)

- **Ferramentas**: `src/data/ferramentas.json`, `src/data/ferramentas.ts` e
  `src/lib/ferramentas.ts` são **três arquivos diferentes** relacionados a ferramentas — isso
  provavelmente explica por que algumas funcionam e outras dão 404 (rota lendo de um arquivo,
  dado cadastrado no outro). Fica anotado pra quando chegar a vez.
- **Duplicação pequena de código** entre `ferramentas/*.tsx` (blocos de botão copiar/baixar
  repetidos, achados pelo `jscpd`) — não é bug, só falta extrair num componente
  compartilhado. Também fica pra depois.
