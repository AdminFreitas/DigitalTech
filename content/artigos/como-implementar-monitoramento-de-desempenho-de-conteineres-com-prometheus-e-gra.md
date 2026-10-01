---
title: "Monitoramento de Desempenho de Contêineres com Prometheus e Grafana"
slug: "como-implementar-monitoramento-de-desempenho-de-conteineres-com-prometheus-e-gra"
category: "Cloud e DevOps"
description: "Aprenda a implementar monitoramento de desempenho de contêineres no Kubernetes com Prometheus e Grafana, solução de observabilidade dinâmica e automatizada"
date: "2026-10-01 15:52:32.528839+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1585123607190-72ec2979a269?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8SW1wbGVtZW50YXIlMjBNb25pdG9yYW1lbnRvJTIwRGVzZW1wZW5obyUyMENvbnQlQzMlQUFpbmVyZXMlMjBQcm9tZXRoZXVzfGVufDB8MHx8fDE3OTA4Njk5MDV8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Monitoramento de Desempenho de Contêineres com Prometheus e Grafana"
imageAuthor: "Sharad Bhat"
---

# Como Implementar Monitoramento de Desempenho de Contêineres com Prometheus e Grafana no Kubernetes

Em ambientes orquestrados pelo Kubernetes, contêineres são criados, destruídos e reescalados continuamente. Diferente de servidores dedicados ou máquinas virtuais tradicionais, onde os recursos de hardware permanecem estáticos por longos períodos, a natureza efêmera dos contêineres exige uma estratégia de observabilidade dinâmica e automatizada.

A combinação do **Prometheus** com o **Grafana** consolidou-se como o padrão da indústria para solucionar esse desafio. O Prometheus atua como o motor de coleta e armazenamento de séries temporais, enquanto o Grafana fornece a camada de visualização gráfica e exploração de dados.

Neste artigo, você entenderá o funcionamento interno dessa arquitetura e aprenderá a implementar um ambiente completo de monitoramento de contêineres passo a passo.

---

## Arquitetura do Monitoramento: Como os Componentes se Integram

Para monitorar o desempenho de contêineres de forma eficaz, é necessário capturar métricas do próprio cluster (nós e plano de controle) e das aplicações rodando nos pods.

No ecossistema Kubernetes, o agente responsável por expor o consumo de recursos de cada contêiner é o **cAdvisor** (Container Advisor), que já vem integrado ao **kubelet** em cada nó do cluster.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de coleta de métricas entre Kubernetes, cAdvisor, Prometheus e Grafana
motivo: Ilustra como as métricas são extraídas dos nós do Kubernetes pelo Prometheus e enviadas para exibição no Grafana.
[/IMAGEM]

O ciclo de vida da coleta de métricas segue quatro etapas principais:

1. **Exposição**: O `cAdvisor` coleta estatísticas de CPU, memória, rede e I/O de disco diretamente dos *cgroups* do Linux e as disponibiliza em um endpoint HTTP (`/metrics`).
2. **Raspagem (Scraping)**: O servidor Prometheus realiza requisições periódicas a esse endpoint usando o modelo *pull*.
3. **Armazenamento**: O Prometheus grava os dados recebidos em seu banco de dados de séries temporais (TSDB).
4. **Visualização**: O Grafana executa consultas em linguagem **PromQL** no Prometheus e gera dashboards interativos em tempo real.

---

## Métricas Essenciais de Contêineres

Nem todas as métricas possuem o mesmo impacto na operação diária. Focar nos indicadores corretos previne alertas falsos e otimiza a retenção de dados.

### 1. CPU: Uso vs. Throttling
* **`container_cpu_usage_seconds_total`**: Mede o consumo acumulado de tempo de CPU por contêiner.
* **`container_cpu_cfs_throttled_seconds_total`**: Indica se o contêiner está sofrendo limitação forçada (*throttling*) por atingir o limite de CPU estipulado na sua configuração. Essa limitação reduz a performance da aplicação sem necessariamente derrubá-la.

### 2. Memória: Working Set vs. OOMKilled
* **`container_memory_working_set_bytes`**: Representa a memória real em uso que não pode ser liberada facilmente pelo sistema operacional. Esta é a métrica principal usada pelo Kubernetes para decidir se um contêiner deve ser encerrado por falta de memória (OOMKilled).
* **`container_memory_usage_bytes`**: Inclui arquivos em cache do sistema. Utilizá-la isoladamente pode dar a falsa impressão de que a aplicação está prestes a estourar o limite de memória.

---

## Passo a Passo de Implementação

A abordagem mais eficiente para implantar essa stack no Kubernetes é o uso do **Prometheus Operator** via Helm Chart `kube-prometheus-stack`. Ele provisiona automaticamente o Prometheus Server, o Grafana, o Alertmanager e as configurações de raspagem do cluster.

### Pré-requisitos
* Um cluster Kubernetes ativo (versão 1.24 ou superior).
* Ferramenta de linha de comando `kubectl` configurada.
* Gerenciador de pacotes `Helm` (versão 3+) instalado.

### Passo 1: Adicionar o Repositório Helm
Adicione o repositório oficial da comunidade Prometheus ao seu ambiente local:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Passo 2: Criar um Namespace Dedicado
Por boas práticas de governança e isolamento de recursos, crie um namespace exclusivo para o monitoramento:

```bash
kubectl create namespace monitoring
```

### Passo 3: Instalar a Stack `kube-prometheus-stack`
Execute o comando de instalação para provisionar todos os componentes necessários:

```bash
helm install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring
```

Este comando instala:
* O Operador do Prometheus;
* A instância do Prometheus Server;
* O servidor do Grafana;
* Agentes de exportação como o `node-exporter` (para nós físicos/virtuais) e `kube-state-metrics` (para objetos do Kubernetes).

### Passo 4: Confirmar a Inicialização
Verifique se todos os pods do ambiente de monitoramento estão com status `Running`:

```bash
kubectl get pods -n monitoring
```

---

## Acessando o Grafana e Visualizando Dados

Após a instalação, o Grafana estará em execução dentro do cluster. Para acessar a interface web a partir de sua máquina local, utilize o encaminhamento de porta (*port-forward*).

### 1. Obter a Senha do Administrador
O Helm gera uma senha aleatória para o usuário `admin` durante o deploy. Recupere a senha com o seguinte comando:

```bash
kubectl get secret --namespace monitoring prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

### 2. Encaminhar a Porta Local
Exponha a porta do serviço do Grafana para a sua máquina:

```bash
kubectl port-forward -n monitoring svc/prometheus-stack-grafana 3000:80
```

Agora você pode acessar o Grafana abrindo `http://localhost:3000` no seu navegador, informando o usuário `admin` e a senha recuperada.

### 3. Painéis Pré-configurados
O pacote `kube-prometheus-stack` instala automaticamente dashboards otimizados. No menu lateral do Grafana, navegue até **Dashboards** para explorar visões como:
* **Kubernetes / Compute Resources / Pod**: Exibe o consumo individual de CPU e Memória de contêineres específicos.
* **Node Exporter / Nodes**: Mostra o estado de saúde do hardware dos nós do cluster.

---

## Escrevendo Consultas Práticas em PromQL

Para personalizar seus painéis ou criar regras de alerta, é fundamental saber construir consultas na linguagem **PromQL**.

### Exemplo 1: Identificar Uso do Limite de CPU por Pod
A consulta abaixo calcula a porcentagem de CPU utilizada em relação ao limite (*limit*) configurado no manifesto do Kubernetes:

```promql
sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{namespace="default"})
by (pod)
/
sum(kube_pod_container_resource_limits{resource="cpu", namespace="default"})
by (pod) * 100
```

### Exemplo 2: Detectar Risco de OOMKilled
Para listar os contêineres do namespace `default` que estão consumindo mais de 85% do limite de memória alocado:

```promql
(
  container_memory_working_set_bytes{namespace="default", container!=""}
  /
  container_spec_memory_limit_bytes{namespace="default", container!=""}
) * 100 > 85
```

---

## Recomendação de Boas Práticas para Produção

1. **Ajustar a Retenção de Dados**: O tempo de retenção padrão do Prometheus é de 15 dias. Em clusters com alto volume de métricas, avalie o impacto no volume persistente (PVC) e ajuste a retenção conforme a capacidade do storage.
2. **Evitar Alta Cardinalidade**: Não utilize atributos com valores altamente dinâmicos (como IDs de transação, UUIDs ou timestamps) em rótulos (*labels*) de métricas customizadas das suas aplicações. Isso faz o banco de dados do Prometheus consumir memória de
