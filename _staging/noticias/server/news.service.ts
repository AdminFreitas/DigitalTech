import type { News, NewsCategory } from "../shared/types";

/**
 * Mock news data for development
 * In production, this would be fetched from the database
 */
export const MOCK_NEWS: News[] = [
  {
    id: 1,
    title: "Como modelos de linguagem mudaram o desenvolvimento em 2026",
    slug: "modelos-de-linguagem-2026",
    summary:
      "Um balanço prático sobre produtividade, riscos e o que ficou para trás depois da virada generativa.",
    content: `# Como modelos de linguagem mudaram o desenvolvimento em 2026

## Introdução

Os modelos de linguagem transformaram fundamentalmente a forma como desenvolvemos software em 2026. Este artigo explora os impactos práticos dessa revolução.

## Produtividade

A produtividade dos desenvolvedores aumentou significativamente com o uso de LLMs para:

- Geração de código boilerplate
- Documentação automática
- Testes unitários
- Refatoração de código legado

## Riscos e Desafios

Apesar dos benefícios, surgiram novos desafios:

- Qualidade inconsistente do código gerado
- Dependência de ferramentas externas
- Questões de segurança e privacidade
- Viés nos modelos de treinamento

## Conclusão

Os LLMs vieram para ficar, mas devem ser usados com cautela e bom senso.`,
    coverImage: "https://images.unsplash.com/photo-1677442d019cecf8d6b5e0c6f5f5f5f5?w=800",
    coverImageAlt: "Inteligência Artificial",
    category: "ia" as NewsCategory,
    categorySlug: "ia",
    tags: '["IA", "LLM", "Desenvolvimento"]',
    author: "Michel Freitas",
    status: "published",
    featured: 1,
    breaking: 0,
    pinned: 1,
    priority: 10,
    views: 1250,
    viewsLast7Days: 450,
    readingTime: 8,
    seoTitle: "Modelos de Linguagem em 2026 - Impacto no Desenvolvimento",
    seoDescription:
      "Análise completa de como LLMs transformaram o desenvolvimento de software em 2026",
    publishedAt: new Date("2026-06-24"),
    createdAt: new Date("2026-06-24"),
    updatedAt: new Date("2026-06-24"),
  },
  {
    id: 2,
    title: "Padrões assíncronos que todo back-end Python deveria usar",
    slug: "padroes-assincronos-python",
    summary:
      "Do asyncio cru ao TaskGroup — o que finalmente virou idiomático em 2026.",
    content: `# Padrões Assíncronos em Python

## TaskGroup: O Novo Padrão

Python 3.11 introduziu TaskGroup, que simplifica a programação assíncrona:

\`\`\`python
async with asyncio.TaskGroup() as tg:
    task1 = tg.create_task(some_async_func())
    task2 = tg.create_task(another_async_func())
\`\`\`

## Vantagens

- Melhor tratamento de erros
- Sintaxe mais clara
- Melhor performance

## Conclusão

TaskGroup é o futuro da programação assíncrona em Python.`,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    coverImageAlt: "Python Programming",
    category: "engenharia" as NewsCategory,
    categorySlug: "engenharia",
    tags: '["Python", "Async", "Backend"]',
    author: "Michel Freitas",
    status: "published",
    featured: 1,
    breaking: 0,
    pinned: 0,
    priority: 8,
    views: 890,
    viewsLast7Days: 320,
    readingTime: 6,
    seoTitle: "Padrões Assíncronos Python - TaskGroup e Async",
    seoDescription: "Guia completo de padrões assíncronos modernos em Python",
    publishedAt: new Date("2026-06-22"),
    createdAt: new Date("2026-06-22"),
    updatedAt: new Date("2026-06-22"),
  },
  {
    id: 3,
    title: "OWASP Top 10: o que mudou no front-end em 2026",
    slug: "owasp-top10-frontend-2026",
    summary:
      "Os ataques do ano, com exemplos reais e mitigação aplicada — sem fórmulas mágicas.",
    content: `# OWASP Top 10 no Front-end

## Principais Ameaças

1. Injeção de código
2. XSS (Cross-Site Scripting)
3. CSRF (Cross-Site Request Forgery)
4. Insecure Deserialization
5. Broken Authentication

## Mitigação

- Validar todas as entradas
- Usar Content Security Policy
- Implementar CORS corretamente
- Manter dependências atualizadas

## Conclusão

Segurança deve ser prioridade desde o início do desenvolvimento.`,
    coverImage: "https://images.unsplash.com/photo-1550439062-7cdcb8b1d4d7?w=800",
    coverImageAlt: "Segurança",
    category: "seguranca" as NewsCategory,
    categorySlug: "seguranca",
    tags: '["Segurança", "OWASP", "Frontend"]',
    author: "Michel Freitas",
    status: "published",
    featured: 1,
    breaking: 0,
    pinned: 0,
    priority: 7,
    views: 1100,
    viewsLast7Days: 380,
    readingTime: 9,
    seoTitle: "OWASP Top 10 2026 - Segurança no Front-end",
    seoDescription: "Análise das principais vulnerabilidades de segurança no front-end",
    publishedAt: new Date("2026-06-20"),
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date("2026-06-20"),
  },
  {
    id: 4,
    title: "PostgreSQL 17: o que vale apertar o botão de upgrade",
    slug: "postgresql-17-upgrade",
    summary: "Análise das principais melhorias e quando fazer o upgrade.",
    content: `# PostgreSQL 17: Vale a Pena Fazer Upgrade?

## Principais Melhorias

- Melhor performance em queries complexas
- Novo sistema de índices
- Melhor suporte a JSON
- Replicação mais robusta

## Quando Fazer Upgrade

Se você usa PostgreSQL em produção, considere fazer upgrade quando:

- Tiver tempo de downtime planejado
- Tiver backup atualizado
- Tiver testado em staging

## Conclusão

PostgreSQL 17 é uma versão sólida que vale a pena o upgrade.`,
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=800",
    coverImageAlt: "Banco de Dados",
    category: "dados" as NewsCategory,
    categorySlug: "dados",
    tags: '["PostgreSQL", "Database", "DevOps"]',
    author: "Michel Freitas",
    status: "published",
    featured: 0,
    breaking: 0,
    pinned: 0,
    priority: 5,
    views: 650,
    viewsLast7Days: 200,
    readingTime: 4,
    seoTitle: "PostgreSQL 17 - Guia de Upgrade",
    seoDescription: "Análise das melhorias do PostgreSQL 17 e quando fazer upgrade",
    publishedAt: new Date("2026-06-20"),
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date("2026-06-20"),
  },
  {
    id: 5,
    title: "Saindo do júnior: as habilidades que ninguém te ensina",
    slug: "saindo-do-junior",
    summary: "Guia prático sobre as habilidades soft que todo desenvolvedor precisa.",
    content: `# Saindo do Júnior: Habilidades Essenciais

## Comunicação

A capacidade de comunicar ideias é tão importante quanto o código que você escreve.

## Pensamento Crítico

Questione suposições, proponha alternativas, considere trade-offs.

## Ownership

Assuma responsabilidade pelos seus projetos do início ao fim.

## Aprendizado Contínuo

O mercado de tech muda rapidamente. Dedique tempo para aprender.

## Conclusão

Essas habilidades são tão importantes quanto conhecimento técnico.`,
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    coverImageAlt: "Carreira",
    category: "carreira" as NewsCategory,
    categorySlug: "carreira",
    tags: '["Carreira", "Desenvolvimento", "Soft Skills"]',
    author: "Michel Freitas",
    status: "published",
    featured: 0,
    breaking: 0,
    pinned: 0,
    priority: 4,
    views: 920,
    viewsLast7Days: 290,
    readingTime: 6,
    seoTitle: "Saindo do Júnior - Habilidades Essenciais",
    seoDescription: "Guia completo sobre habilidades necessárias para evoluir na carreira",
    publishedAt: new Date("2026-06-18"),
    createdAt: new Date("2026-06-18"),
    updatedAt: new Date("2026-06-18"),
  },
  {
    id: 6,
    title: "Workers, Edge e o fim do back-end em uma única região",
    slug: "workers-edge-backend",
    summary:
      "Como a computação distribuída está mudando a arquitetura de aplicações.",
    content: `# Workers e Edge Computing

## O Novo Paradigma

A computação distribuída permite executar código mais perto do usuário, reduzindo latência.

## Cloudflare Workers

Workers permitem executar código JavaScript em mais de 200 data centers globais.

## Benefícios

- Menor latência
- Melhor performance
- Escalabilidade automática
- Custo reduzido

## Conclusão

Edge computing é o futuro da web.`,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    coverImageAlt: "Cloud",
    category: "cloud" as NewsCategory,
    categorySlug: "cloud",
    tags: '["Cloud", "Edge", "Cloudflare"]',
    author: "Michel Freitas",
    status: "published",
    featured: 0,
    breaking: 0,
    pinned: 0,
    priority: 3,
    views: 780,
    viewsLast7Days: 250,
    readingTime: 5,
    seoTitle: "Workers e Edge Computing - O Futuro da Web",
    seoDescription: "Análise de como edge computing está transformando a arquitetura web",
    publishedAt: new Date("2026-06-15"),
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-15"),
  },
];

/**
 * Get mock news data
 * In production, use database queries instead
 */
export function getMockNews(filter?: { category?: NewsCategory }): News[] {
  if (filter?.category) {
    return MOCK_NEWS.filter((n) => n.category === filter.category);
  }
  return MOCK_NEWS;
}

export function getMockNewsBySlug(slug: string): News | undefined {
  return MOCK_NEWS.find((n) => n.slug === slug);
}

export function searchMockNews(query: string): News[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_NEWS.filter(
    (n) =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.summary?.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery)
  );
}
