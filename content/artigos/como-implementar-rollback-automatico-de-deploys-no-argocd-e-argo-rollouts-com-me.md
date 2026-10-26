---
title: "Como Fazer Rollback Automático no Argo Rollouts com Prometheus"
slug: "como-implementar-rollback-automatico-de-deploys-no-argocd-e-argo-rollouts-com-me"
category: "Cloud e DevOps"
description: "Configure Progressive Delivery com Argo Rollouts e Prometheus. Aprenda a usar AnalysisTemplate para acionar rollbacks automáticos no Kubernetes."
date: "2026-10-26 15:38:47.371883+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/34804017/pexels-photo-34804017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como Fazer Rollback Automático no Argo Rollouts com Prometheus"
imageAuthor: "Daniil Komov"
---

# Como Implementar Rollback Automático de Deploys no ArgoCD e Argo Rollouts com Métricas do Prometheus

No modelo tradicional de entrega contínua, o processo de deployment é frequentemente tratado de forma binária: o código novo substitui a versão anterior inteiramente de uma só vez. Embora ferramentas de GitOps como o ArgoCD facilitem a sincronização de manifestos declarativos no Kubernetes, falhas em nível de aplicação — como picos de latência ou taxa elevada de erros 5xx — nem sempre são capturadas pelos testes de *liveness* e *readiness* nativos.

Para solucionar esse desafio, utiliza-se a estratégia de **Progressive Delivery** (entrega progressiva), combinando o **ArgoCD** ao **Argo Rollouts** e integrando análises em tempo real alimentadas pelo **Prometheus**. Este artigo detalha o passo a passo técnico para implementar um pipeline resiliente com *rollback* automático baseado em métricas reais de desempenho.

---

## Arquitetura da Solução

O ArgoCD gerencia o estado desejado dos recursos no cluster Kubernetes. No entanto, para estratégias avançadas de deployment (como *Canary* ou *Blue-Green*), utiliza-se o **Argo Rollouts**, um Custom Resource Definition (CRD) que substitui o objeto nativo `Deployment` do Kubernetes.

Ao executar uma atualização, o Argo Rollouts consulta métricas no Prometheus por meio de um recurso chamado `AnalysisTemplate`. Se a métrica violar os limites definidos durante a fase de validação, a implantação é interrompida imediatamente e o tráfego é redirecionado para a versão estável anterior.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de decisão do Argo Rollouts avaliando métricas do Prometheus para aprovar ou reverter um canary deployment
motivo: Ilustra visualmente a integração entre a aplicação Canary, a coleta de métricas pelo Prometheus e a ação de rollback executada pelo controller do Argo Rollouts
[/IMAGEM]

---

## Pré-requisitos

Para aplicar os passos deste tutorial, você precisará de:

- Um cluster Kubernetes operacional com acesso administrativo.
- **ArgoCD** instalado e sincronizando seus manifestos.
- **Argo Rollouts Controller** e o plugin de CLI `kubectl-argo-rollouts` instalados.
- **Prometheus** coletando métricas HTTP/gRPC das suas aplicações (via métricas exportadas por Ingress Controller, Service Mesh como Istio/Linkerd, ou instrumentação nativa da aplicação).

---

## Passo 1: Criando a AnalysisTemplate

O recurso `AnalysisTemplate` define a consulta que será executada no Prometheus, a frequência de avaliação e os critérios de aceitação ou falha. 

No exemplo abaixo, criamos uma análise para medir a taxa de erros HTTP 5xx utilizando PromQL. Se a taxa de erro for superior a 1% (`0.01`), a verificação falha.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: taxa-de-erro-prometheus
  namespace: producao
spec:
  metrics:
  - name: success-rate
    interval: 30s
    successCondition: result[0] <= 0.01
    failureLimit: 3
    provider:
      prometheus:
        address: http://prometheus-k8s.monitoring.svc.cluster.local:9090
        query: |
          sum(rate(http_requests_total{status=~"5..",app="minha-aplicacao"}[2m]))
          /
          sum(rate(http_requests_total{app="minha-aplicacao"}[2m]))
```

### Detalhes dos Campos:
- **`interval`**: Frequência das consultas ao Prometheus.
- **`successCondition`**: Expressão condicional avaliada sobre o resultado da consulta. Neste caso, a taxa de erro deve ser menor ou igual a 0,01 (1%).
- **`failureLimit`**: Quantidade máxima de falhas consecutivas permitidas antes de marcar a análise como com falha e disparar o rollback.

---

## Passo 2: Configurando o Recurso Rollout

Substitua o manifesto `Deployment` padrão pelo recurso `Rollout`. Configure a estratégia de *Canary Deployment* fazendo referência à `AnalysisTemplate` criada no Passo 1.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: minha-aplicacao
  namespace: producao
spec:
  replicas: 5
  strategy:
    canary:
      analysis:
        templates:
        - templateName: taxa-de-erro-prometheus
        startingStep: 1
      steps:
      - setWeight: 20
      - pause: { duration: 5m }
      - setWeight: 50
      - pause: { duration: 10m }
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: minha-aplicacao
  template:
    metadata:
      labels:
        app: minha-aplicacao
    spec:
      containers:
      - name: app
        image: meu-registry/minha-aplicacao:v2.0.0
        ports:
        - containerPort: 8080
```

### Entendendo a Estratégia de Deploy:
1. O Argo Rollouts direciona 20% do tráfego para a nova versão (versão Canary).
2. O processo faz uma pausa de 5 minutos enquanto a `AnalysisTemplate` executa checagens a cada 30 segundos.
3. Se o limite de falhas não for atingido, o tráfego é aumentado para 50% por mais 10 minutos.
4. Caso ocorra degradação e a métrica violar a condição configurada, o deploy é abortado imediatamente e 100% do tráfego retorna para a versão estável anterior.

---

## Passo 3: Integrando com o ArgoCD

O ArgoCD reconhece o recurso `Rollout` como um recurso nativo por meio dos CRDs do Argo. Para garantir a sincronização:

1. Faça o commit dos manifestos da `AnalysisTemplate` e do `Rollout` no repositório Git monitorado pelo ArgoCD.
2. O ArgoCD aplicará as mudanças no cluster.
3. Durante o deploy, a interface gráfica do ArgoCD exibirá o progresso das etapas do Rollout e o estado das análises associadas.

---

## Passo 4: Testando o Rollback Automático

Para validar o funcionamento do mecanismo em um ambiente de testes ou staging:

1. Lance uma versão da aplicação contendo uma falha proposital (por exemplo, gerando respostas HTTP 500 para parte das requisições).
2. Atualize a tag da imagem no repositório Git e aguarde a sincronização do ArgoCD.
3. Acompanhe a execução da análise via CLI do Argo Rollouts:

```bash
kubectl argo rollouts get rollout minha-aplicacao -n producao --watch
```

4. Observe o momento em que a métrica do Prometheus ultrapassa o limite de 1% de erros. A análise mudará para o estado `Failed` e o Argo Rollouts executará o aborto automático, restaurando os pods da versão estável anterior.

---

## Boas Práticas e Recomendações

- **Ajuste o período de aquecimento (*Warm-up*)**: Aplicações podem levar alguns segundos para inicializar caches ou conexões com banco de dados. Configure pausas adequadas antes de iniciar a análise para evitar falsos positivos.
- **Combine múltiplas métricas**: Além da taxa de erro, adicione verificações de latência (p95 ou p99) e consumo de CPU/memória à sua `AnalysisTemplate`.
- **Defina métricas por ambiente**: Ambientes de homologação costumam aceitar margens de erro diferentes das toleradas em produção.
