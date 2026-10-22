---
title: "Otimização de Recursos em Cloud Híbrida com Autoscaling"
slug: "otimizacao-de-recursos-em-cloud-hibrida-autoscaling-e-monitoramento-com-promethe"
category: "Cloud e DevOps"
description: "Aprenda a otimizar recursos em nuvens híbridas combinando autoscaling, Prometheus e Grafana para reduzir custos e melhorar o desempenho"
date: "2026-10-22 14:15:27.481520+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1667984390527-850f63192709?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NXx8T3RpbWl6YSVDMyVBNyVDMyVBM28lMjBSZWN1cnNvcyUyMENsb3VkJTIwSCVDMyVBRGJyaWRhJTIwQXV0b3NjYWxpbmd8ZW58MHwwfHx8MTc5MjY3ODUxMnww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Otimização de Recursos em Cloud Híbrida com Autoscaling"
imageAuthor: "Growtika"
---

# Otimização de Recursos em Cloud Híbrida: Autoscaling e Monitoramento com Prometheus e Grafana

A adoção de ambientes de nuvem híbrida — que combinam infraestrutura local (*on-premises*) e provedores de nuvem pública — tornou-se o padrão para muitas organizações que buscam flexibilidade, conformidade e resiliência. No entanto, gerenciar a alocação de recursos em dois ecossistemas distintos traz desafios complexos de custos e desempenho.

Sem visibilidade centralizada e automação adaptativa, a tendência é o superdimensionamento (*overprovisioning*) de máquinas virtuais e contêineres, gerando desperdício financeiro. Este artigo apresenta uma abordagem prática para equilibrar o consumo de computação em cloud híbrida utilizando Prometheus, Grafana e mecanismos de *autoscaling*.

---

## O Desafio da Alocação de Recursos na Cloud Híbrida

Em uma infraestrutura local, a capacidade de hardware é finita e pré-paga. Na nuvem pública, a capacidade é virtualmente ilimitada, mas cobrada pelo uso contínuo (*pay-as-you-go*).

O objetivo principal do gerenciamento híbrido é maximizar o uso da infraestrutura *on-premises* (que possui custo fixo) e recorrer à nuvem pública apenas quando houver picos imprevistos ou demanda sazonal — técnica conhecida como *cloud bursting*.

Para aplicar essa estratégia de forma eficiente, é essencial dispor de:
1. **Observabilidade unificada:** capacidade de metrificar aplicações independentemente de onde estejam rodando.
2. **Gatilhos automáticos de dimensionamento:** regras baseadas em dados reais de consumo, e não apenas em horários fixos.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de trabalho de cloud bursting integrando cluster local e nuvem pública via métricas do Prometheus
motivo: Ajudar o leitor a visualizar como os dados de consumo orientam a migração de cargas de trabalho entre o datacenter local e a nuvem pública
[/IMAGEM]

---

## Coleta de Métricas Granulares com Prometheus

O Prometheus é o padrão de fato para monitoramento de ambientes de contêineres e orquestração com Kubernetes. Em um cenário híbrido, a arquitetura recomendada envolve uma instância ou cluster do Prometheus em cada ambiente, agregando métricas de infraestrutura e aplicação.

### Métricas Críticas para Autoscaling
Para tomar decisões precisas de dimensionamento, o foco deve ir além do uso básico de CPU e memória. As seguintes métricas são cruciais:

- **Consumo de CPU por contêiner/pod (`container_cpu_usage_seconds_total`):** identifica saturação no processamento.
- **Uso de memória RAM em relação ao limite (`container_memory_working_set_bytes`):** previne falhas por falta de memória (*Out of Memory - OOM*).
- **Taxa de requisições por segundo (RPS):** coletada via NGINX Ingress, Istio ou pela própria aplicação.
- **Tamanho de filas de mensagens:** métricas de RabbitMQ, Kafka ou SQS que sinalizam gargalos de processamento.

---

## Visualização e Tomada de Decisão com Grafana

Ter dados consolidados é o primeiro passo; enxergá-los de forma acionável é o segundo. O Grafana atua como a camada de visualização unificada, conectando-se aos servidores Prometheus locais e da nuvem.

[IMAGEM]
tipo: screenshot
assunto: Dashboard do Grafana mostrando métricas de CPU, memória e tamanho de fila em um cluster híbrido
motivo: Exemplificar como organizar os dados de monitoramento para identificar o momento ideal de acionar o dimensionamento automático
[/IMAGEM]

### Configurando o Dashboard de Eficiência
Um painel focado em otimização de recursos deve destacar:
- **Saturation vs. Capacity:** percentual de uso atual comparado ao teto da infraestrutura local.
- **Pod Density:** quantidade de contêineres por nó físico ou virtual.
- **Cost Impact:** estimativa do impacto financeiro do consumo atual na nuvem pública.

--- 

## Estratégia Prática: Autoscaling Orientado a Métricas Customizadas

O Kubernetes oferece o *Horizontal Pod Autoscaler* (HPA) nativo, que por padrão escala cargas de trabalho com base no uso de CPU e memória. Contudo, em ambientes híbridos, métricas de aplicação (como RPS ou tamanho da fila) costumam anteceder o aumento do consumo de CPU, permitindo reagir antes da degradação do serviço.

Para integrar o Prometheus ao HPA do Kubernetes, utilizam-se ferramentas como o **KEDA** (Kubernetes Event-driven Autoscaling) ou o **Prometheus Adapter**.

### Passo a Passo: Configurando Autoscaling com KEDA e Prometheus

Abaixo está um exemplo de configuração declarativa do KEDA (`ScaledObject`) que observa uma métrica no Prometheus (tamanho de uma fila de mensagens) e escala as instâncias do serviço proporcionalmente.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-autoscaler
  namespace: producao
spec:
  scaleTargetRef:
    name: processador-de-pedidos
  minReplicaCount: 2
  maxReplicaCount: 20
  cooldownPeriod: 300
  pollingInterval: 15
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus-server.monitoring.svc.cluster.local:9090
      metricName: fila_pedidos_pendentes
      query: sum(rabbitmq_queue_messages{queue="pedidos"})
      threshold: '50'
```

### Como Funciona este Fluxo:
1. O KEDA consulta a API do Prometheus a cada 15 segundos (`pollingInterval`).
2. Se a consulta retornar mais de 50 mensagens por pod (`threshold`), novas réplicas da aplicação são criadas.
3. Se os recursos do cluster local atingirem o limite físico, o *Cluster Autoscaler* provisiona novos nós temporários na nuvem pública para absorver a demanda extra.
4. Quando a fila diminui, o sistema reduz primeiro os nós da nuvem pública, contendo os custos.

---

## Recomendações de FinOps para Ambientes Híbridos

A automação do *autoscaling* resolve o dimensionamento operacional, mas exige salvaguardas financeiras para evitar surpresas no faturamento:

* **Estabeleça limites máximos rígidos (`maxReplicaCount`):** nunca deixe o limite superior desconfigurado ou excessivamente alto em instâncias de nuvem pública.
* **Monitore o tráfego de saída (*Egress Costs*):** a transferência de dados entre a nuvem pública e a infraestrutura local gera custos. Evite transitar grandes volumes de dados desnecessariamente entre os dois locais.
* **Utilize instâncias spot/preemptíveis na nuvem:** para workloads tolerantes a falhas, combine o *autoscaling* com instâncias *spot*, reduzindo em até 80% o custo de computação temporária.

---

## Conclusão

A otimização de recursos em cloud híbrida exige abandonar o dimensionamento estático em prol de um modelo orientado a dados. Integrando o monitoramento contínuo do Prometheus, a visibilidade centralizada do Grafana e acionadores de *autoscaling* como o KEDA, é possível garantir performance consistente nos picos de demanda, mantendo o controle rigoroso dos custos operacionais.
