---
title: "Como Apresentar um Post-Mortem em Entrevistas de SRE"
slug: "como-apresentar-um-post-mortem-ficticio-para-demonstrar-maturidade-em-entrevista"
category: "Carreira"
description: "Aprenda a estruturar e apresentar um post-mortem fictício em entrevistas de SRE para demonstrar cultura blameless, observabilidade e maturidade técnica."
date: "2026-09-11 13:08:54.898177+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1646062595969-a1c236cec3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8N3x8QXByZXNlbnRhciUyMFBvc3QlMjBNb3J0ZW0lMjBGaWN0JUMzJUFEY2lvJTIwRGVtb25zdHJhcnxlbnwwfDB8fHwxNzg5MTMyMTE0fDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Apresentar um Post-Mortem em Entrevistas de SRE"
imageAuthor: "Stanisław Trajer"
---

Em processos seletivos para posições avançadas de Engenharia de Confiabilidade de Sistemas (SRE — *Site Reliability Engineering*), perguntas teóricas sobre comandos do Linux ou sintaxe de Kubernetes frequentemente dão lugar a cenários sistêmicos complexos. Os entrevistadores buscam avaliar não apenas a bagagem técnica do candidato, mas sua capacidade de raciocínio crítico sob pressão, visão arquitetural e compromisso com a melhoria contínua.

Uma das estratégias mais eficazes para demonstrar essa maturidade é conduzir a explicação de um *post-mortem* de incidente fictício — ou baseado em uma experiência real sanitizada. Este artigo detalha como construir, estruturar e apresentar um *post-mortem* técnico de alto nível durante uma entrevista de SRE.

---

## O que é um Post-Mortem e por que ele importa em Entrevistas

Um *post-mortem* é uma análise detalhada realizada após a resolução de um incidente grave. O objetivo principal do documento não é encontrar culpados, mas entender as causas fundamentais da falha, avaliar a eficácia da resposta operacional e estabelecer ações corretivas para evitar recorrências.

Quando um candidato apresenta espontaneamente um *post-mortem* bem estruturado ao responder a perguntas do tipo "conte-me sobre uma falha crítica que você enfrentou", ele sinaliza instantaneamente:

- **Cultura Blameless (Sem Culpabilização):** Foco em falhas de processos e sistemas, não em erros individuais.
- **Domínio de Observabilidade:** Entendimento de métricas (SLIs, SLOs), logs e rastreamento distribuído.
- **Pensamento Sistêmico:** Capacidade de enxergar dependências em cascata em arquiteturas distribuídas.
- **Metodologia de Resolução:** Disciplina para investigar usando hipóteses testáveis.

---

## Anatomia de um Incidente Fictício Verossímil

Para que o exercício seja convincente, a falha precisa refletir a complexidade de sistemas modernos de produção. Evite cenários simplistas como "o disco encheu e limpamos os logs". Opte por falhas resultantes da interação entre múltiplos componentes.

### Exemplo de cenário verossímil:
Um aumento atípico no tráfego de leitura gera exaustão do pool de conexões do banco de dados relacional, fazendo com que o serviço de autenticação passe a falhar por *timeout*, o que por sua vez trava as filas de mensagens do *broker* e afeta o checkout da aplicação.

[IMAGEM]
tipo: diagrama
assunto: Diagrama de arquitetura mostrando o efeito cascata da exaustão do pool de conexões até a queda do checkout
motivo: Ilustrar visualmente como uma falha localizada se propaga por dependências em microsserviços
[/IMAGEM]

---

## Passo a Passo para Conduzir a Apresentação na Entrevista

### 1. Contextualização e Impacto Negocial
Inicie definindo o cenário e o impacto do incidente no negócio. O foco inicial deve ser a severidade e a extensão do problema.

- **Severidade:** Exemplo: Sev-1 (Indisponibilidade total ou parcial de funcionalidade crítica).
- **Métricas afetadas:** Violação do SLO de latência (p99 > 2000ms) e degradação da taxa de sucesso de requisições de 99,9% para 82%.
- **Duração:** Tempo até detecção (MTTD) e tempo até resolução/mitigação (MTTR).

### 2. A Cronologia dos Fatos (Timeline)
Apresente a sequência cronológica dos eventos técnicos com precisão de timestamps hipotéticos. Isso demonstra organização e apreço por métricas de observabilidade.

- `14:00`: Deploy da versão v2.4.1 do microsserviço de pagamentos.
- `14:05`: Alerta do Prometheus dispara: latência da API de checkout excede SLO.
- `14:10`: PagerDuty aciona o engenheiro de sobreaviso (*on-call*).
- `14:15`: Identificada saturação de CPU nos pods de autenticação e alta taxa de erros HTTP 504.
- `14:25`: Mitigação temporária aplicada via rollback da versão e aumento do limite do HPA (*Horizontal Pod Autoscaler*).
- `14:35`: Serviço restabelecido e métricas normalizadas.

### 3. Análise de Causa Raiz e Fatores Contribuintes
Evite apontar uma "causa única e simples". Sistemas complexos falham por uma combinação de fatores.

Use a técnica dos **5 Porquês** ou a análise de fatores contribuintes:

1. *Por que a API travou?* Porque o pool de conexões com o banco esgotou.
2. *Por que o pool esgotou?* Porque uma query não otimizada foi introduzida no deploy v2.4.1.
3. *Por que a query foi executada em produção sem índice?* Porque o ambiente de staging não possuía volume de dados equivalente para disparar o alerta de performance no pipeline de CI/CD.
4. *Por que a aplicação não degradou graciosamente?* Faltou a implementação do padrão *Circuit Breaker* no cliente da API.

### 4. Ações Corretivas e Preventivas (Action Items)
O ponto alto do *post-mortem* é demonstrar como o sistema se tornará mais resiliente após a falha. Separe as ações em curto, médio e longo prazo, atribuindo responsabilidades claras.

```text
[Ação Curto Prazo]   - Criar índice emergencial no banco de dados e aplicar Circuit Breaker na API.
[Ação Médio Prazo]  - Adicionar testes de carga automatizados no pipeline de CI/CD com dados sintéticos.
[Ação Longo Prazo]  - Revisar arquitetura de conexões do banco, avaliando o uso de um proxy de conexões (ex: PgBouncer).
```

---

## Modelo de Post-Mortem Simplificado para Uso em Entrevistas

Abaixo está um modelo em texto claro que você pode praticar para estruturar sua fala durante o processo seletivo:

```markdown
# Post-Mortem: Indisponibilidade na API de Checkout (Incidente #4092)

## Resumo
Em 10 de Outubro, a API de Checkout apresentou taxa de erro de 18% durante 35 minutos devido à exaustão de recursos no banco de dados primário.

## Impacto
- Pedidos não processados: ~1.200 requisições falharam.
- Violação de SLO: Latência p99 subiu para 4.5s (limite definido: 500ms).

## Causa Raiz
Falta de indexação na tabela de cupons combinada com a ausência de timeout agressivo na camada de integração, resultando em retenção indevida de conexões HTTP e SQL.

## Resposta e Mitigação
1. Rollback do deploy executado às 14:25.
2. Scale-out manual do banco de leitura para aliviar carga.

## Lições Aprendidas
- Nossos alertas de pré-exaustão de pool de conexões estavam configurados com limiar muito alto (95%).
- O pipeline de deploy não validava planos de execução de queries SQL (EXPLAIN ANALYZE).
```

---

## Erros Comuns ao Apresentar um Post-Mortem na Entrevista

- **Culpar as pessoas:** Dizer que "o estagiário subiu o código errado" demonstra imaturidade cultural. Em SRE, se um erro humano derrubou a produção, a falha está na ausência de travas no sistema.
- **Focar apenas na solução rápida:** Mostrar apenas a mitigação (ex: "dei reboot no servidor") sem explicar a investigação de fundo indica postura reativa, não proativa.
- **Ignorar dados e métricas:** Falar de incidentes sem citar taxas de erro, métricas de tempo (MTTD/MTTR) ou impacto em SLOs torna o relato vago.

---

## Conclusão

A capacidade de analisar falhas de forma metódica é o que diferencia engenheiros juniores de profissionais sêniores e especialistas. Ao conduzir um *post-mortem* fictício bem estruturado durante uma entrevista, você comprova na prática que possui visão holística de engenharia, disciplina operacional e a mentalidade necessária para manter sistemas críticos em funcionamento.
