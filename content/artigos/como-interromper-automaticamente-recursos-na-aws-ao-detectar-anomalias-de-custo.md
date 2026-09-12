---
title: "Como Interromper Recursos na AWS ao Detectar Anomalias de Custo"
slug: "como-interromper-automaticamente-recursos-na-aws-ao-detectar-anomalias-de-custo"
category: "Cloud e DevOps"
description: "Aprenda a automatizar a contenção de custos na AWS integrando Cost Anomaly Detection, EventBridge e Lambda para interromper recursos em tempo real."
date: "2026-09-12 18:53:30.380788+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1775994121064-e75fa6f3e84c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MXx8aW50ZXJyb21wZXIlMjBhdXRvbWF0aWNhbWVudGUlMjByZWN1cnNvcyUyMEFXUyUyMGRldGVjdGFyfGVufDB8MHx8fDE3ODkyMzkyMDB8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Interromper Recursos na AWS ao Detectar Anomalias de Custo"
imageAuthor: "Bernd 📷 Dittrich"
---

# Como interromper automaticamente recursos na AWS ao detectar anomalias de custo com EventBridge e Lambda

Em ambientes de computação em nuvem, um loop infinito em uma aplicação, uma configuração incorreta de Auto Scaling ou a alocação não planejada de instâncias de alto desempenho podem resultar em surpresas desagradáveis na fatura ao final do mês. A gestão de custos (FinOps) deixou de ser apenas uma tarefa mensal de análise financeira e passou a exigir mecanismos de resposta em tempo real.

A AWS oferece ferramentas nativas para monitorar e detectar variações atípicas de gastos. No entanto, apenas receber um e-mail de alerta pode ser insuficiente se o evento ocorrer fora do horário comercial. A solução ideal envolve a detecção ativa seguida de uma mitigação automatizada, funcionando como um disjuntor de emergência para a sua infraestrutura.

Abaixo, detalhamos a construção de uma arquitetura orientada a eventos que detecta anomalias de custo e executa automaticamente uma ação de contenção usando AWS Cost Anomaly Detection, Amazon EventBridge e AWS Lambda.

---

## Arquitetura da Solução

O fluxo de resposta automática é composto por três componentes principais:

1. **AWS Cost Anomaly Detection**: Monitora os padrões de uso utilizando aprendizado de máquina para identificar picos de custo fora do comportamento normal.
2. **Amazon EventBridge**: Captura o evento de anomalia gerado pelo monitor de custos e o roteia para o destino apropriado.
3. **AWS Lambda**: Função serverless acionada pelo EventBridge que executa o código de mitigação (como desligar instâncias de teste/desenvolvimento ou reduzir grupos de Auto Scaling).

[IMAGEM]
tipo: diagrama
assunto: Fluxo de dados entre AWS Cost Anomaly Detection, Amazon EventBridge, AWS Lambda e os recursos afetados na conta AWS.
motivo: Permitir que o leitor visualize a sequência de eventos desde a detecção da anomalia até a execução da ação de contenção.
[/IMAGEM]

---

## Passo 1: Configurar o AWS Cost Anomaly Detection

O primeiro passo é garantir que o monitoramento de custos esteja ativo no console do AWS Billing.

1. Acesse o **AWS Billing and Cost Management Console**.
2. No menu lateral, selecione **Cost Anomaly Detection**.
3. Clique em **Get started** ou **Create monitor**.
4. Selecione o tipo de monitoramento. Para a maioria das organizações, a opção **AWS services** (que analisa cada serviço individualmente) oferece o melhor equilíbrio entre granularidade e precisão.
5. Defina um **Alert subscription** (Assinatura de Alerta) atribuindo um valor limite de impacto financeiro (por exemplo, anomalias com impacto superior a US$ 50,00).

Assim que ativado, o serviço passa a avaliar continuamente os registros de custo e uso da conta.

---

## Passo 2: Criar a regra no Amazon EventBridge

Quando o AWS Cost Anomaly Detection identifica um desvio significativo, ele emite um evento no barramento padrão do Amazon EventBridge. Precisamos capturar esse evento específico.

1. Acesse o serviço **Amazon EventBridge** no console AWS.
2. Vá para **Rules** (Regras) e clique em **Create rule**.
3. Dê um nome claro à regra, como `rule-cost-anomaly-interruption`.
4. Em **Event bus**, mantenha a opção `default`.
5. Na seção **Event pattern** (Padrão de Evento), selecione a opção para inserir o padrão em JSON:

```json
{
  "source": ["aws.ce"],
  "detail-type": ["Cost Anomaly Detection Notification"]
}
```

Esse padrão garante que a regra seja acionada apenas quando o Cost Explorer (`aws.ce`) emitir um alerta de anomalia de custo.

---

## Passo 3: Criar a função AWS Lambda para mitigação

A função Lambda receberá os detalhes da anomalia e executará a ação de resposta. Para evitar interrupções acidentais em ambiente de produção, é recomendável filtrar os recursos afetados por **Tags** (como `Environment=Development` ou `AutoStop=True`).

Abaixo está um exemplo em Python (usando o SDK `boto3`) que intercepta o evento e desliga instâncias EC2 identificadas com a tag de interrupção automática:

```python
import boto3
import json
import os

def lambda_handler(event, context):
    print("Evento de anomalia recebido:", json.dumps(event))
    
    # Extrai detalhes da anomalia enviados pelo EventBridge
    detail = event.get('detail', {})
    impact_amount = float(detail.get('impact', {}).get('totalImpact', 0))
    
    # Limite mínimo de segurança dentro da Lambda (exemplo: $50)
    THRESHOLD = float(os.environ.get('THRESHOLD_AMOUNT', '50.0'))
    
    if impact_amount < THRESHOLD:
        print(f"Impacto de ${impact_amount} abaixo do limite de ${THRESHOLD}. Nenhuma ação tomada.")
        return {
            'statusCode': 200,
            'body': json.dumps('Anomalia dentro do limite aceitável.')
        }
    
    ec2 = boto3.client('ec2')
    
    # Busca instâncias com a tag AutoStop=true que estão rodando
    response = ec2.describe_instances(
        Filters=[
            {'Name': 'tag:AutoStop', 'Values': ['true']},
            {'Name': 'instance-state-name', 'Values': ['running']}
        ]
    )
    
    instances_to_stop = []
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instances_to_stop.append(instance['InstanceId'])
            
    if instances_to_stop:
        print(f"Parando instâncias: {instances_to_stop}")
        ec2.stop_instances(InstanceIds=instances_to_stop)
    else:
        print("Nenhuma instância elegível encontrada para interrupção.")
        
    return {
        'statusCode': 200,
        'body': json.dumps(f'Interrupção concluída para {len(instances_to_stop)} instâncias.')
    }
```

--- 

## Passo 4: Configurar a política de privilégio mínimo (IAM)

A função Lambda necessita de uma role do AWS Identity and Access Management (IAM) que siga o princípio do menor privilégio. Ela deve ter permissão apenas para listar e interromper os recursos específicos alvos da automação, além de gravar logs no Amazon CloudWatch.

Exemplo de política IAM estrita para o cenário de EC2:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:StopInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/AutoStop": "true"
        }
      }
    }
  ]
}
```

---

## Boas práticas e cuidados operacionais

A implementação de automações de interrupção exige cautela para evitar indisponibilidades desnecessárias em serviços essenciais.

* **Nunca aplique ações automáticas sem filtros em produção**: Sempre utilize tags rígidas para identificar workloads que podem ser interrompidos sem causar perda irrecuperável de dados ou desrespeito a SLAs.
* **Defina notificações em paralelo**: Além de acionar a Lambda de mitigação, configure a regra do EventBridge para enviar uma mensagem a um tópico Amazon SNS, notificando a equipe de DevOps via Slack, Teams ou e-mail sobre a ação executada.
* **Ambientes de homologação primeiro**: Valide todo o fluxo em uma conta de desenvolvimento ou testes gerando eventos simulados no EventBridge antes de implantar em contas de produção.
* **Considere o atraso inerente da métrica**: O AWS Cost Anomaly Detection não opera em milissegundos; a detecção ocorre em intervalos que variam de alguns minutos a algumas horas após o processamento dos dados de telemetria de custos pela AWS. Por isso, essa automação atua como contenção de danos, não como prevenção imediata de execução.

---

## Conclusão

A integração entre AWS Cost Anomaly Detection, Amazon EventBridge e AWS Lambda transforma o monitoramento passivo de custos em uma postura defensiva ativa. Ao automatizar a resposta a anomalias financeiras, as equipes de engenharia garantem que eventuais falhas operacionais não resultem em faturas astronômicas, mantendo o controle sobre a governança em nuvem.
