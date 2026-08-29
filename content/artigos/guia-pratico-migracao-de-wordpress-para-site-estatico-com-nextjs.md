---
title: "Guia prático: migração de WordPress para site estático com Next.js"
slug: "guia-pratico-migracao-de-wordpress-para-site-estatico-com-nextjs"
category: "Desenvolvimento Web"
description: "Saiba como migrar do WordPress para um site estático usando Next.js, com passos práticos para extrair conteúdo, configurar ambiente e garantir performance e segurança."
date: "2026-08-29 06:24:51.005525+00:00"
readTime: "4"
image: "https://images.unsplash.com/photo-1642143231828-786fbd515a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8N3x8R3VpYSUyMHByJUMzJUExdGljbyUyMG1pZ3JhJUMzJUE3JUMzJUEzbyUyMFdvcmRQcmVzcyUyMHNpdGV8ZW58MHwwfHx8MTc4Nzk4NDY4N3ww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Guia prático: migração de WordPress para site estático com Next.js"
imageAuthor: "PiggyBank"
---

# Guia prático: migração de WordPress para site estático com Next.js

## Por que migrar para um site estático?

Sites estáticos oferecem vantagens significativas em comparação ao WordPress, especialmente por conta de:

- **Performance**: carregamento mais rápido, graças à ausência de consultas ao banco de dados
- **Segurança**: redução de vetores de ataque, pois não há código PHP ou plugins executando no servidor
- **Escalabilidade**: fácil distribuição via CDNs e serviços como Vercel ou Netlify
- **Custo**: redução dos gastos com hospedagem, já que arquivos HTML estáticos são mais leves
- **Manutenção**: menor necessidade de atualizações e correções de segurança

No entanto, essa migração exige planejamento. Enquanto o WordPress é um CMS robusto, sites estáticos requerem uma abordagem diferente para gerenciar conteúdo. Este guia apresenta os passos práticos para realizar essa transição sem perder funcionalidades essenciais.

## Pré-requisitos para a migração

Antes de iniciar, verifique se você tem:

- Acesso ao painel de administração do WordPress
- Ambiente de desenvolvimento configurado com Node.js e npm/yarn
- Conhecimento básico de Next.js (ou disposição para aprender)
- Ferramentas para extrair o conteúdo do WordPress (como o plugin "WP REST API" ou scripts personalizados)

## Passo 1: Extrair o conteúdo do WordPress

Existem duas abordagens principais para extrair o conteúdo:

### 1. Usar a API REST do WordPress

A API REST do WordPress permite acessar posts, páginas, categorias e outros dados de forma estruturada. Para ativá-la:

1. Instale e ative o plugin "WP REST API" (geralmente incluído por padrão em versões recentes do WordPress)
2. Acesse a URL `https://seudominio.com/wp-json/wp/v2/posts` para verificar se os posts estão acessíveis
3. Use ferramentas como `curl` ou scripts em Python/JavaScript para baixar os dados:

```javascript
const axios = require('axios');

async function fetchPosts() {
  const response = await axios.get('https://seudominio.com/wp-json/wp/v2/posts?per_page=100');
  return response.data;
}

fetchPosts().then(posts => {
  console.log(posts); // Manipule os dados conforme necessário
});
```

### 2. Exportar via plugin ou ferramenta nativa

O WordPress oferece uma ferramenta nativa de exportação (Tools > Export) que gera um arquivo XML com todo o conteúdo. Esse arquivo pode ser convertido para JSON ou Markdown posteriormente.

## Passo 2: Estruturar o projeto Next.js

Crie um novo projeto Next.js:

```bash
npx create-next-app@latest meu-site-estatico
cd meu-site-estatico
```

Instale dependências úteis:

```bash
npm install gray-matter gray-matter-loader @next/mdx @mdx-js/loader
```

Essas bibliotecas auxiliam no processamento de arquivos Markdown (gerados a partir do conteúdo do WordPress) com frontmatter para metadados.

## Passo 3: Converter o conteúdo para formato estático

### Opção A: Usar Markdown

Converta os posts exportados para arquivos Markdown com frontmatter. Exemplo de estrutura:

```markdown
---
title: "Meu Primeiro Post"
date: "2023-10-15"
tags: ["tecnologia", "web"]
---

Conteúdo do post em Markdown.
```

### Opção B: Usar JSON

Se preferir, armazene o conteúdo em arquivos JSON e processe-os no Next.js:

```javascript
// posts/[slug].js
import posts from '../../data/posts.json';

export default function Post({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const post = posts.find(p => p.slug === params.slug);
  return { props: { post } };
}
```

## Passo 4: Configurar rotas no Next.js

No Next.js, as rotas são criadas automaticamente com base na estrutura de arquivos na pasta `pages`:

- `pages/index.js` → `/`
- `pages/posts/[slug].js` → `/posts/slug-do-post`

Exemplo de página para listar posts:

```javascript
// pages/index.js
import fs from 'fs';
import path from 'path';

export default function Home({ posts }) {
  return (
    <div>
      <h1>Meu Blog Estático</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  const posts = filenames.map(filename => {
    const fileContents = fs.readFileSync(path.join(postsDirectory, filename), 'utf8');
    const { data } = require('gray-matter')(fileContents);
    return { slug: filename.replace('.md', ''), ...data };
  });
  return { props: { posts } };
}
```

## Passo 5: Estilizar o site

Use CSS Modules, Tailwind CSS ou outro framework de sua preferência. Exemplo com CSS Modules:

```css
/* styles/Home.module.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
```

```javascript
import styles from '../styles/Home.module.css';

// ... no componente
<div className={styles.container}>
  <h1 className={styles.title}>Meu Blog Estático</h1>
  {/* ... */}
</div>
```

## Passo 6: Lidar com armadilhas comuns

### 1. URLs antigas (SEO)

Se o site antigo tinha URLs como `/2023/10/meu-post`, será necessário:

- Configurar redirecionamentos no Next.js para evitar erros 404
- Usar `getStaticPaths` para gerar as páginas estaticamente:

```javascript
export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: 'meu-post' } },
      // ... outras URLs
    ],
    fallback: false,
  };
}
```

### 2. Comentários

Sites estáticos não oferecem suporte nativo a comentários. Soluções alternativas incluem:

- **Disqus**: Integração fácil via script
- **Staticman**: Serviço que armazena comentários em repositórios GitHub
- **Terceiros**: Usar serviços como Commento

Exemplo de integração com Disqus:

```javascript
// pages/posts/[slug].js
import { useEffect } from 'react';
```
