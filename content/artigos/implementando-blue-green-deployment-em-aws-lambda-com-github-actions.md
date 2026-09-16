---
title: "Blue-Green Deployment em AWS Lambda com GitHub Actions"
slug: "implementando-blue-green-deployment-em-aws-lambda-com-github-actions"
category: "Cloud e DevOps"
description: "Aprenda a implementar Blue-Green Deployment em AWS Lambda usando GitHub Actions, AWS CodeDeploy e SAM para garantir deploys sem downtime."
date: "2026-09-16 13:56:32.579282+00:00"
readTime: "4"
image: "https://images.pexels.com/photos/9121346/pexels-photo-9121346.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Blue-Green Deployment em AWS Lambda com GitHub Actions"
imageAuthor: "Jan van der Wolf"
---

# Implementando Blue-Green Deployment em AWS Lambda com GitHub Actions

O modelo de arquitetura serverless elimina a complexidade do gerenciamento de servidores, mas não isenta as equipes de engenharia da responsabilidade de realizar atualizações seguras. Atualizar uma função AWS Lambda aplicando 100% do novo código diretamente no tráfego de produção expõe a aplicação ao risco de indisponibilidade instantânea caso exista algum bug não detectado nos testes de homologação.

A estratégia de Blue-Green Deployment (e sua variação comum em serverless, o Canary Deployment) resolve esse problema ao permitir a coexistência de duas versões da aplicação: a versão estável atual (Blue) e a nova versão atualizada (Green). O tráfego de usuários é gradualmente migrado entre elas, garantindo uma transição controlada.

Neste artigo, veremos como estruturar essa estratégia combinando AWS Lambda, AWS CodeDeploy, AWS SAM (Serverless Application Model) e automação via GitHub Actions.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de tráfego entre versões da AWS Lambda gerenciado por Alias e CodeDeploy durante um Blue-Green deployment
motivo: Ilustra como o tráfego de produção é gradualmente desviado da versão Blue para a versão Green
[/IMAGEM]

## Conceitos-Chave: Versões, Aliases e CodeDeploy

Para aplicar o Blue-Green Deployment em funções AWS Lambda, precisamos entender como a AWS lida com a imutabilidade e o roteamento de código:

- **Lambda Versions**: Uma versão do Lambda é um snapshot imutável do código e das configurações de ambiente da função. Uma vez publicada, uma versão não pode ser alterada.
- **Lambda Aliases**: Um Alias funciona como um ponteiro mutável para uma versão específica (por exemplo, um alias chamado `live` apontando para a `Versão 1`). O tráfego de produção deve sempre apontar para o Alias, nunca diretamente para uma versão física.
- **AWS CodeDeploy**: É o serviço da AWS responsável por orquestrar a mudança de peso do tráfego do Alias ao longo do tempo.

Em vez de mudar o ponteiro do Alias de 0% para 100% instantaneamente, o AWS CodeDeploy aceita configurações de tráfego progressivo, como:

- **Canary10Percent5Minutes**: Transfere 10% do tráfego para a nova versão (Green) e aguarda 5 minutos. Se nenhum alarme for disparado, transfere os 90% restantes de uma só vez.
- **Linear10PercentEvery1Minute**: Aumenta o tráfego da nova versão em 10% a cada minuto até atingir 100% de migração.

## Estruturando a Infraestrutura com AWS SAM

Utilizar o AWS SAM (ou CloudFormation) permite declarar a estratégia de implantação diretamente no código da infraestrutura. No arquivo `template.yaml`, definimos a função Lambda juntamente com as regras de deploy e os alarmes de saúde.

```yaml
Transform: AWS::Serverless-2016-10-31

Resources:
  MinhaFuncaoLambda:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: index.handler
      Runtime: nodejs18.x
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          -!Ref ErrosLambdaAlarm

  ErrosLambdaAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Dispara se a Lambda apresentar erros durante a transição de versão
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 60
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      Dimensions:
        - Name: FunctionName
          Value:!Ref MinhaFuncaoLambda
```

Note a propriedade `AutoPublishAlias: live`. Quando o SAM detecta alterações no código da função, ele publica uma nova versão imutável e aciona o CodeDeploy para mover o alias `live` da versão antiga para a nova conforme a regra `Canary10Percent5Minutes`.

## Automatizando a Implantação no GitHub Actions

Para tornar o processo contínuo e repetível, o pipeline do GitHub Actions assume a responsabilidade de realizar o build dos artefatos e disparar a atualização na AWS.

Abaixo está um exemplo funcional de workflow `.github/workflows/deploy.yml`:

```yaml
name: Pipeline de Deploy Serverless

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do código
        uses: actions/checkout@v3

      - name: Configurar credenciais AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Instalar AWS SAM CLI
        uses: aws-actions/setup-sam@v2

      - name: Build da aplicação
        run: sam build

      - name: Deploy da aplicação
        run: |
          sam deploy \
            --no-confirm-changeset \
            --no-fail-on-empty-changeset \
            --stack-name minha-aplicacao-serverless \
            --s3-bucket meu-bucket-de-deploy \
            --capabilities CAPABILITY_IAM
```

## Mecanismo de Rollback Automático

Uma das principais vantagens dessa abordagem é a capacidade de reverter o deploy automaticamente sem necessidade de intervenção humana ou criação de novos commits de emergência.

Durante o período em que o tráfego está dividido (por exemplo, os 5 minutos da estratégia Canary), o AWS CodeDeploy monitora continuamente o alarme `ErrosLambdaAlarm` do Amazon CloudWatch.

Se a nova versão da função (Green) começar a gerar exceções, o CloudWatch altera o estado do alarme para `ALARM`. O CodeDeploy detecta esse evento imediatamente, interrompe a transição e retorna 100% do tráfego para a versão antiga (Blue). A versão problemática é descartada com risco e impacto minimizados.

## Boas Práticas e Cuidados Essenciais

Apesar das vantagens do Blue-Green Deployment em plataformas serverless, a equipe deve se atentar a alguns detalhes arquiteturais:

- **Retrocompatibilidade de Banco de Dados**: Como duas versões do código rodam em paralelo durante a janela de implantação, qualquer alteração no esquema do banco de dados deve ser retrocompatível com ambas as versões do código.
- **Idempotência e Estado**: Funções Lambda devem permanecer estritamente *stateless*. Não armazene estado na memória local da instância assumindo que a requisição seguinte cairá na mesma versão.
- **Métricas Relevantes**: Além da métrica padronizada de erros da Lambda, considere incluir métricas customizadas de negócio ou latência no alarme do CloudWatch associado ao deploy.
