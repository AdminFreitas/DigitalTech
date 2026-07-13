---
slug: workers-edge-backend
title: "Workers, Edge e o fim do back-end em uma única região"
category: Cloud & DevOps
excerpt: "Latência, custo e arquitetura — o que muda na prática."
date: 2026-06-15
readTime: 5 min
published: true
---
## O problema que Edge Computing resolve

Uma API hospedada em São Paulo responde bem para usuários brasileiros. Para alguém na Europa ou Ásia, a latência pode passar de 200ms só de ida e volta na rede — antes de qualquer processamento.

A resposta da indústria foi Edge Computing [Computação na Borda]: rodar código não em um datacenter centralizado, mas em dezenas de pontos de presença distribuídos globalmente. O código executa no servidor mais próximo do usuário.

## O que são Workers

Workers são funções que rodam no edge. Cloudflare Workers e Vercel Edge Functions são os exemplos mais usados. A diferença para uma função serverless [sem servidor] tradicional está em onde elas rodam e como são executadas.

| Característica | Serverless tradicional | Edge Workers |
|---|---|---|
| Localização | Região fixa | Próximo ao usuário |
| Cold start | 100ms a 1s+ | < 5ms |
| Runtime | Node.js completo | Subset restrito |
| Banco de dados | Qualquer | Limitado |
| Custo | Por execução | Por requisição |

## Quando faz sentido usar

**Faz sentido:**
- Middleware de autenticação (verificar token antes de redirecionar)
- Personalização de resposta por localização geográfica
- Cache inteligente com invalidação granular
- A/B testing [Teste A/B] sem round-trip [ida e volta] para o servidor
- Redirecionamentos e rewrites de URL

**Não faz sentido:**
- Lógica de negócio complexa que acessa banco relacional
- Processamento pesado de dados
- Operações que precisam de estado compartilhado entre requisições

## O limite real: o banco de dados

O maior obstáculo para adotar Edge amplamente é o banco de dados. Uma função rodando em Frankfurt não pode se conectar eficientemente a um PostgreSQL em São Paulo — a latência de rede anula o ganho do edge.

As soluções disponíveis:

**Para leitura:** distribuir dados com banco vetorial ou CDN [Content Delivery Network — Rede de Distribuição de Conteúdo] de dados como Cloudflare KV.

**Para escrita:** aceitar que operações que escrevem no banco vão ter latência — e isolar essas operações do caminho crítico.

**Para casos onde todo o dado precisa ser próximo:** PlanetScale, Turso ou CockroachDB oferecem bancos distribuídos globalmente — mas com custo e complexidade maiores.

## Arquitetura híbrida — a abordagem prática

Para a maioria das aplicações, a combinação que funciona:

```
Usuário → Edge Worker (auth, cache, roteamento)
              ↓
         Back-end regional (lógica de negócio + banco)
```

O Worker cuida do que pode ser resolvido sem tocar o banco. O back-end cuida do resto. Você ganha latência nas operações de leitura e nos endpoints mais frequentes sem refatorar tudo.

## O que monitorar

Edge Workers têm limitações de CPU por invocação (geralmente 50ms). Se a sua função está fazendo processamento pesado, ela vai ser encerrada. Monitore:

- Tempo de execução por invocação
- Taxa de erros por região
- Cache hit rate [taxa de acerto do cache]

## Conclusão

Edge Computing não é substituto do back-end — é uma camada adicional para otimizar o que está no caminho crítico entre o usuário e a sua aplicação. Aplicado onde faz sentido, reduz latência, melhora a experiência do usuário e pode reduzir custo de processamento no servidor central.
