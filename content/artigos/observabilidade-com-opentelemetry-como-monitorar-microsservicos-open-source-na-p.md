---
title: "Observabilidade com OpenTelemetry"
slug: "observabilidade-com-opentelemetry-como-monitorar-microsservicos-open-source-na-p"
category: "Open Source"
description: "Guia prático para instrumentar microsserviços open source com OpenTelemetry e otimizar o desempenho do sistema"
date: "2026-10-01 21:31:39.175421+00:00"
readTime: "4"
image: "https://images.unsplash.com/photo-1527167151437-87cf28fb6b38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8Nnx8T2JzZXJ2YWJpbGlkYWRlJTIwT3BlblRlbGVtZXRyeSUyME1vbml0b3JhciUyME1pY3Jvc3NlcnZpJUMzJUE3b3MlMjBPcGVufGVufDB8MHx8fDE3OTA4OTAyNzB8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Observabilidade com OpenTelemetry"
imageAuthor: "Julio Gutierrez"
---

# Observabilidade com OpenTelemetry: Como Monitorar Microsserviços Open Source na Prática

Em arquiteturas de microsserviços, entender a jornada completa de uma requisição pode se tornar um desafio complexo. Quando um ecossistema envolve dezenas ou centenas de serviços independentes desenvolvidos em tecnologias open source, a identificação de gargalos de desempenho e falhas exige uma estratégia de observabilidade padronizada.

O OpenTelemetry (OTel) emergiu como o padrão da Cloud Native Computing Foundation (CNCF) para a geração, coleta e exportação de dados de telemetria — especificamente métricas, rastreamentos (traces) e logs. Neste artigo, abordamos a estrutura do OpenTelemetry, como instrumentar aplicações open source e como utilizar essas informações para otimizar o desempenho do sistema.

## Os Três Pilares da Observabilidade no OpenTelemetry

Para monitorar microsserviços de forma abrangente, o OpenTelemetry se consolida sobre três pilares fundamentais:

- **Traces (Rastreamentos distribuídos):** mapeiam o caminho exato percorrido por uma requisição ao longo da rede de microsserviços, destacando o tempo gasto em cada etapa (*span*).
- **Metrics (Métricas):** medidas numéricas agregadas em intervalos de tempo, úteis para analisar o uso de CPU, memória, taxa de requisições por segundo e latência média.
- **Logs:** registros de texto estruturados ou não estruturados que fornecem contexto detalhado sobre eventos específicos na aplicação.

## A Arquitetura do OpenTelemetry

O ecossistema OpenTelemetry é dividido em componentes principais que garantem sua neutralidade em relação a fornecedores (*vendor-agnostic*):

1. **API:** define os tipos de dados e abstrações para a instrumentação.
2. **SDK:** implementação da API para linguagens específicas (Python, Go, Java, Node.js, entre outras), responsável pelo processamento e pela amostragem dos dados.
3. **OpenTelemetry Collector:** agente e proxy independente que recebe, processa e exporta dados de telemetria para *backends* de armazenamento.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de dados entre o OpenTelemetry SDK, o Collector e os backends de visualização como Jaeger e Prometheus
motivo: Visualizar como a aplicação desacopla a geração de dados do processamento e do envio para os sistemas de análise.
[/IMAGEM]

## Passo a Passo: Instrumentando uma Aplicação Python em Microsserviços

A seguir, veja um exemplo prático de como instrumentar um microsserviço Python e enviar dados para o OpenTelemetry Collector.

### Passo 1: Configurar o OpenTelemetry Collector

Crie um arquivo de configuração denominado `otel-collector-config.yaml`. Este arquivo define o recebimento via OTLP (*OpenTelemetry Protocol*) e o envio para ferramentas open source como Jaeger (para traces) e Prometheus (para métricas).

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### Passo 2: Instrumentar a Aplicação

Instale as dependências necessárias no ambiente Python da sua aplicação:

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp
```

No código da aplicação, configure o provedor de rastreamento (`TracerProvider`) e adicione um exportador OTLP:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

# Identificação do serviço
resource = Resource.create({"service.name": "servico-pedidos"})

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="localhost:4317", insecure=True))
provider.add_span_processor(processor)

trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Exemplo de criação de span manual para medir processamento
def processar_pedido(pedido_id):
    with tracer.start_as_current_span("processar_pedido") as span:
        span.set_attribute("pedido.id", pedido_id)
        # Lógica de negócio da aplicação
        return True
```

## Estratégias para Otimizar o Desempenho do Sistema

Após implementar a instrumentação, a análise dos dados permite identificar gargalos estruturais e otimizar a infraestrutura.

### 1. Análise de Latência P95 e P99

Métricas de latência média podem ocultar picos pontuais de lentidão. Analise o percentil 95 (P95) e o percentil 99 (P99) nas consultas de banco de dados ou em chamadas HTTP entre microsserviços para localizar transações lentas.

### 2. Configuração de Estratégias de Amostragem (Sampling)

Em sistemas de alto tráfego, rastrear 100% das requisições pode gerar sobrecarga de CPU e alto consumo de armazenamento. Utilize estratégias de amostragem para otimizar custos:

- **Head-based sampling:** a decisão de amostrar o *trace* ocorre no início da requisição, diretamente no SDK.
- **Tail-based sampling:** a decisão ocorre no Collector, permitindo reter 100% dos *traces* que resultarem em erro ou alta latência e descartando requisições sem anomalias.

### 3. Padronização com Convenções Semânticas

Adote as convenções semânticas do OpenTelemetry para os nomes de atributos (como `http.status_code` ou `db.system`). Essa prática facilita a correlação automática de dados entre serviços distintos e diferentes painéis de visualização.

## Considerações Práticas

- **Overhead de Rede:** certifique-se de utilizar comunicação gRPC comprimida ou processamento em lote (*batching*) no Collector para minimizar o impacto do tráfego na rede interna.
- **Adoção Gradual:** em ambientes distribuídos de grande escala, recomenda-se introduzir a instrumentação do OpenTelemetry gradualmente, priorizando os microsserviços mais críticos para o fluxo da aplicação.

O uso do OpenTelemetry simplifica a gestão de ecossistemas open source em microsserviços, garantindo autonomia na escolha de ferramentas de análise e fornecendo visibilidade clara sobre o desempenho de toda a infraestrutura.
