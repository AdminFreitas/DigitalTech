---
title: "Como Monitorar Custos Ocultos no Kubernetes com Grafana"
slug: "como-monitorar-custos-ocultos-no-kubernetes-com-prometheus-e-grafana"
category: "Cloud e DevOps"
description: "Veja como identificar desperdício de recursos e monitorar custos ocultos no Kubernetes utilizando métricas do Prometheus e painéis do Grafana."
date: "2026-08-30 19:35:59.955907+00:00"
readTime: "4"
image: "https://images.pexels.com/photos/21852967/pexels-photo-21852967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como Monitorar Custos Ocultos no Kubernetes com Grafana"
imageAuthor: "Jakub Zerdzicki"
---

# Como Monitorar Custos Ocultos no Kubernetes com Prometheus e Grafana

A flexibilidade do Kubernetes no gerenciamento de workloads em nuvem traz um desafio recorrente para equipes de infraestrutura e DevOps: a imprevisibilidade da fatura. A abstração promovida pelos containers facilita a implantação de aplicações, mas frequentemente esconde gargalos financeiros causados por provisionamento excessivo, recursos ociosos e métricas mal configuradas.

O objetivo deste artigo é demonstrar como mapear esses custos ocultos utilizando ferramentas de código aberto já consolidadas na pilha de observabilidade — **Prometheus** e **Grafana** —, sem a necessidade de adquirir soluções SaaS dispendiosas.

## A Origem dos Custos Ocultos no Kubernetes

Para controlar gastos, é necessário entender onde o dinheiro é desperdiçado. No Kubernetes, os maiores vilões do orçamento geralmente não são falhas diretas de código, mas desalinhamentos de configuração:

1. **Diferença entre Requests e Uso Real:** O Kubernetes aloca nós com base nos *Requests* (recursos reservados), não no consumo real. Se um pod solicita 4 CPUs, mas utiliza em média 0,5 CPU, a infraestrutura paga pelas 4 CPUs reservadas.
2. **Nodes Ociosos (Pod Packing ineficiente):** Fragmentação no agendamento de pods pode fazer com que novos nós sejam criados enquanto nós existentes mantêm capacidade ociosa não aproveitada.
3. **Volumes de Armazenamento Órfãos:** *PersistentVolumeClaims* (PVCs) mantidos ativos após a exclusão de *Deployments* ou *StatefulSets* continuam gerando cobranças no provedor de nuvem.
4. **Tráfego de Rede de Egress:** Transferências de dados entre diferentes zonas de disponibilidade (Multi-AZ) dentro do mesmo cluster geram custos variáveis que costumam passar despercebidos.

[IMAGEM]
tipo: diagrama
assunto: Arquitetura de observabilidade mostrando a coleta de dados dos nós e pods pelo Prometheus e sua exibição no Grafana.
motivo: Ajudar o leitor a entender o fluxo de dados entre os componentes da pilha open-source.
[/IMAGEM]

## Arquitetura de Coleta de Métricas para FinOps

Para mensurar custos no Kubernetes usando Prometheus, dependemos da extração correta de métricas do plano de controle e dos nós. A estrutura base envolve:

- **kube-state-metrics:** Fornece o estado dos objetos da API do Kubernetes (requests, limits, status de pods e PVCs).
- **Node Exporter / cAdvisor:** Fornece o consumo real de hardware (CPU, memória, disco e rede).
- **OpenCost (Opcional/Integrável):** Projeto de especificação aberta que traduz métricas do Prometheus diretamente em valores monetários com base em tabelas de preços de provedores de nuvem.

### Passo 1: Extraindo a Diferença entre Reserva e Consumo

A métrica primária para identificar desperdício é o *Gap de Ociosidade*. Podemos calcular a CPU reservada versus a CPU efetivamente consumida usando **PromQL**.

**CPU Reservada (Requests):**
```promql
sum(kube_pod_container_resource_requests{resource="cpu"}) by (namespace)
```

**CPU Consumida (Uso Real):**
```promql
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (namespace)
```

**Cálculo da Porcentagem de Desperdício por Namespace:**
```promql
(
  sum(kube_pod_container_resource_requests{resource="cpu"}) by (namespace)
  -
  sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (namespace)
)
/
sum(kube_pod_container_resource_requests{resource="cpu"}) by (namespace) * 100
```

Se o resultado dessa última consulta for um valor alto (por exemplo, acima de 60%), significa que o *namespace* está reservando mais da metade dos recursos de CPU sem necessidade.

### Passo 2: Identificando Armazenamento Desperdiçado

Volumes alocados e desvinculados de pods em execução continuam acumulando custos no provedor de nuvem. A seguinte consulta PromQL identifica PVCs que não estão vinculados a nenhum pod ativo:

```promql
kube_persistentvolumeclaim_info unless on (persistentvolumeclaim, namespace) kube_pod_spec_volumes_persistentvolumeclaim_info
```

[IMAGEM]
tipo: screenshot
assunto: Painel do Grafana exibindo um gráfico comparativo entre CPU Request e CPU Uso Real ao longo do tempo.
motivo: Demonstrar como a visualização dos dados facilita a identificação de momentos de superdimensionamento de recursos.
[/IMAGEM]

## Estruturando o Painel no Grafana

Com as consultas validadas no Prometheus, o próximo passo é montar um painel funcional no Grafana voltado para a gestão de custos (*FinOps*).

Ao criar o painel, priorize os seguintes indicadores principais (KPIs):

- **Custo Estável vs. Custo Variável:** Separe recursos com valor fixo (nós alocados) dos de consumo flutuante (tráfego de rede e armazenamento).
- **Top 5 Namespaces Ofensores:** Tabela ordenando os namespaces com maior volume de recursos ociosos.
- **Taxa de Eficiência de CPU e Memória:** Métrica em gauge (0-100%) mostrando a relação entre o consumo real e a capacidade total alocada do cluster.

## Como Não Quebrar o Orçamento do Próprio Prometheus

Coletar métricas em clusters de grande porte pode gerar uma alta cardinalidade no Prometheus, aumentando os custos de infraestrutura de monitoramento. Para evitar que a ferramenta de observabilidade se torne o próprio gargalo financeiro, adote as seguintes práticas:

1. **Ajuste o Intervalo de Coleta (Scrape Interval):** Para análise de custos de longo prazo, intervalos de 30s ou 60s são suficientes. Evite coletas em sub-segundos.
2. **Aplique Filtragem de Métricas (Metric Relabeling):** Descarte métricas de alta cardinalidade do *cAdvisor* que não agregam valor financeiro.

Exemplo de configuração no Prometheus para descartar métricas desnecessárias do container:

```yaml
metric_relabel_configs:
  - source_labels: [__name__]
    regex: '(container_tasks_state|container_memory_failures_total)'
    action: drop
```

3. **Use Downsampling para Históricos Longos:** Utilize soluções de armazenamento de longo prazo com retenção compactada (como Thanos ou Cortex) em vez de manter séries temporais brutas no Prometheus por meses.

## Conclusão

Garantir a visibilidade dos custos do Kubernetes não exige ferramentas pagas de alto custo. Combinando métricas nativas do `kube-state-metrics` e do `node-exporter` com consultas PromQL bem direcionadas no Grafana, sua equipe ganha clareza sobre o consumo real da infraestrutura.

A otimização de custos em nuvem é um processo contínuo: identifique o desperdício, ajuste os *requests* e *limits* das aplicações e mantenha o monitoramento ajustado para não gerar custos desnecessários na própria coleta de dados.
