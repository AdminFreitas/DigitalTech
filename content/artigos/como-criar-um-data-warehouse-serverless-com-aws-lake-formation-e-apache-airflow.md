---
title: "Criar Data Warehouse Serverless com AWS Lake Formation"
slug: "como-criar-um-data-warehouse-serverless-com-aws-lake-formation-e-apache-airflow"
category: "Cloud e DevOps"
description: "Aprenda a criar um data warehouse serverless seguro e escalável com AWS Lake Formation e Apache Airflow, otimizando a gestão de dados em larga escala"
date: "2026-09-06 18:47:03.611811+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1682559736721-c2e77ff4c650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NHx8Q3JpYXIlMjBEYXRhJTIwV2FyZWhvdXNlJTIwU2VydmVybGVzcyUyMEFXU3xlbnwwfDB8fHwxNzg4NzIwNDA0fDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Criar Data Warehouse Serverless com AWS Lake Formation"
imageAuthor: "Lightsaber Collection"
---

# Como Criar um Data Warehouse Serverless com AWS Lake Formation e Apache Airflow

A gestão de dados em larga escala exige duas premissas fundamentais: governança rigorosa de acesso e orquestração confiável de pipelines. À medida que o volume de informações cresce, arquiteturas tradicionais baseadas em clusters fixos se tornam custosas e difíceis de manter.

A combinação do **AWS Lake Formation** com o **Apache Airflow** oferece uma solução moderna e serverless. O Lake Formation simplifica a criação do data lake e aplica políticas de segurança centralizadas — como controle de acesso em nível de coluna e linha. O Apache Airflow atua como a camada de orquestração, agendando, monitorando e garantindo a execução sequencial dos fluxos de transformação de dados.

Neste artigo, você verá como integrar essas ferramentas para estruturar um repositório analítico escalável, seguro e totalmente auditável.

## Arquitetura de Referência: Componentes e Interações

Para construir um data warehouse serverless, a melhor abordagem é desacoplar o armazenamento, a governança, a engine de consulta e o motor de orquestração.

[IMAGEM]
tipo: diagrama
assunto: Arquitetura serverless integrada com AWS Lake Formation, Amazon S3, AWS Glue, Amazon Athena e Apache Airflow
motivo: Ilustrar visualmente como os componentes de armazenamento, governança, processamento e orquestração se conectam
[/IMAGEM]

A arquitetura proposta divide-se nas seguintes camadas:

- **Armazenamento:** Amazon S3, estruturado em camadas (por exemplo: Raw, Staging e Analytics) utilizando formatos otimizados como Parquet.
- **Catálogo e Governança:** AWS Glue Data Catalog gerenciado pelo AWS Lake Formation, centralizando os metadados e as permissões de acesso.
- **Processamento e Consulta:** AWS Glue (para tarefas de ETL) e Amazon Athena (para executar consultas SQL diretamente no S3 sem necessidade de servidores).
- **Orquestração:** Apache Airflow, responsável por gerenciar a sequência de tarefas, dependências e tratamentos de erro.

## Passo 1: Configurando a Governança com AWS Lake Formation

O AWS Lake Formation abstrai a complexidade do gerenciamento de políticas diretamente no IAM e S3, permitindo conceder acesso granular a tabelas e colunas com base na identidade do serviço ou usuário.

### 1. Registrando os Locais de Armazenamento
1. No console do AWS Lake Formation, navegue até **Data lake locations**.
2. Registre os buckets do Amazon S3 que armazenam os dados operacionais e analíticos.

### 2. Criando o Banco de Dados no Catálogo
Defina um novo banco de dados no AWS Glue Data Catalog por meio do Lake Formation. Esse banco de dados conterá os metadados referentes às tabelas mantidas no S3.

### 3. Definindo Permissões de Acesso
O Lake Formation permite definir permissões usando **LF-Tags** (atributos para controle de acesso baseado em tags) ou atribuição direta a papéis IAM (*IAM Roles*).

Para conceder permissão limitada ao papel do Airflow:
- Selecione a tabela desejada no console.
- Clique em **Grant** e especifique o IAM Role utilizado pelos *workers* do Airflow.
- Selecione apenas as colunas necessárias, garantindo que dados sensíveis (PII) fiquem inacessíveis para o pipeline específico.

## Passo 2: Integrando o Apache Airflow ao Ambiente

O Apache Airflow gerencia pipelines por meio de DAGs (*Directed Acyclic Graphs*). Para interagir com o ambiente gerenciado pelo Lake Formation, o Airflow deve utilizar credenciais AWS vinculadas a uma role autorizada no catálogo.

### Requisitos de Permissões para a Role do Airflow
A *execution role* do Airflow precisa conter permissões IAM para:
1. Submeter chamadas de API ao Amazon Athena e AWS Glue.
2. Gravar os resultados das consultas do Athena em um bucket S3 específico de saída.
3. Acessar o AWS Lake Formation para descriptografar os metadados do catálogo.

### Exemplo Prático: DAG de Orquestração
O código abaixo ilustra uma DAG em Python utilizando provedores Amazon para executar um job de transformação no AWS Glue e, em seguida, rodar uma consulta de agregação via Amazon Athena.

```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.amazon.aws.operators.glue import GlueJobOperator
from airflow.providers.amazon.aws.operators.athena import AthenaOperator

default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'pipeline_serverless_lakeformation',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False,
) as dag:

    executar_etl_glue = GlueJobOperator(
        task_id='executar_etl_glue',
        job_name='job_processamento_vendas',
        script_location='s3://meu-bucket-scripts/glue_etl.py',
        aws_conn_id='aws_default',
    )

    gerar_agregado_athena = AthenaOperator(
        task_id='gerar_agregado_athena',
        query='''
            CREATE TABLE IF NOT EXISTS analytics.vendas_mensais AS
            SELECT 
                categoria,
                DATE_TRUNC('month', data_venda) AS mes,
                SUM(valor) AS total_vendas
            FROM staging.vendas_brutas
            GROUP BY categoria, DATE_TRUNC('month', data_venda);
        ''',
        database='analytics',
        output_location='s3://meu-bucket-athena-results/queries/',
        aws_conn_id='aws_default',
    )

    executar_etl_glue >> gerar_agregado_athena
```

## Melhores Práticas e Otimização

1. **Uso de Formatos Colunares e Particionamento:** Mantenha os dados em Parquet ou ORC e aplique particionamento por datas ou regiões. Isso reduz significativamente a quantidade de dados varridos pelo Athena, diminuindo custos e tempo de execução.
2. **Governança por LF-Tags:** Em cenários corporativos com centenas de tabelas, prefira gerenciar acessos associando LF-Tags a tabelas e papéis IAM, em vez de atribuir permissões tabela por tabela.
3. **Isolamento de Ambientes:** Separe os ambientes de desenvolvimento, homologação e produção utilizando bancos de dados distintos no AWS Glue Data Catalog e roles de execução isoladas no Airflow.
4. **Monitoramento de Custos:** Defina limites de dados varridos por consulta no Amazon Athena para evitar surpresas em pipelines com alto volume de processamento.

## Conclusão

A integração entre AWS Lake Formation e Apache Airflow oferece um modelo de arquitetura de dados escalável, seguro e econômico. O Lake Formation garante a governança e o controle de acesso granular sem exigir a manutenção de infraestrutura complexa de banco de dados, enquanto o Apache Airflow provê flexibilidade na orquestração dos fluxos de trabalho. O resultado é um pipeline automatizado, em conformidade com políticas de privacidade de dados e totalmente alinhado aos princípios do modelo serverless.
