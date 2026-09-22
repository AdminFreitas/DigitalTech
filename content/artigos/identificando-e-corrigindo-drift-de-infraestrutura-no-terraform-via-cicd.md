---
title: "Corrigindo Drift de Infraestrutura no Terraform"
slug: "identificando-e-corrigindo-drift-de-infraestrutura-no-terraform-via-cicd"
category: "Cloud e DevOps"
description: "Aprenda a identificar e corrigir drift de infraestrutura no Terraform via pipelines de CI/CD, garantindo a consistência da sua infraestrutura como código"
date: "2026-09-22 19:58:30.478949+00:00"
readTime: "2"
image: "https://images.pexels.com/photos/14909211/pexels-photo-14909211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Corrigindo Drift de Infraestrutura no Terraform"
imageAuthor: "life._.kor"
---

# Identificando e Corrigindo Drift de Infraestrutura no Terraform via CI/CD

## Introdução
O Terraform é uma ferramenta amplamente utilizada para gerenciar infraestrutura como código (IaC). Com o tempo, contudo, a configuração real dos recursos pode divergir do código declarado, gerando o chamado *drift* de infraestrutura. A automação via pipelines de CI/CD é a forma mais eficiente de identificar e corrigir essas divergências continuamente.

## O que é Drift de Infraestrutura?
O *drift* de infraestrutura ocorre quando o estado real dos recursos em nuvem ou *on-premises* se afasta da configuração declarada no código de IaC. Isso pode acontecer por alterações manuais realizadas diretamente no painel do provedor, intervenções emergenciais, atualizações automáticas de segurança ou execução de scripts externos.

## Identificando o Drift
Para identificar o *drift*, utiliza-se o comando `terraform plan` ou `terraform apply` acompanhado do parâmetro `-detailed-exitcode`. O Terraform compara a infraestrutura real com o estado esperado e reporta as divergências encontradas, retornando um código de saída específico caso detecte alterações.

## Corrigindo o Drift via CI/CD
A forma mais eficaz de mitigar o *drift* é integrar a verificação a pipelines de *Continuous Integration/Continuous Deployment* (CI/CD). A automação da detecção e correção envolve as seguintes etapas:

### 1. Configuração do ambiente de CI/CD
Defina o ambiente de execução em uma ferramenta de automação, como Jenkins, GitLab CI/CD ou CircleCI.

### 2. Adição do Terraform ao pipeline
Instale a CLI do Terraform no agente de *build* e configure as variáveis de ambiente e credenciais necessárias para a autenticação no provedor de nuvem.

### 3. Execução do `terraform plan`
Configure uma etapa no pipeline para executar o `terraform plan` com a opção `-detailed-exitcode`. Se houver divergência entre o código e o ambiente real, o comando retornará um código de saída diferente de zero.

### 4. Correção automática do drift
Caso o *drift* seja detectado, o pipeline pode ser configurado para executar o `terraform apply` automaticamente, restaurando o estado declarado. É fundamental garantir que a conta utilizada pela automação tenha as permissões necessárias para alterar os recursos afetados.

## Conclusão
A detecção e a correção automatizadas do *drift* de infraestrutura via CI/CD são fundamentais para manter a consistência e a confiabilidade do ambiente. Ao integrar o Terraform às rotinas de CI/CD, a infraestrutura permanece alinhada ao código, reduzindo riscos operacionais e alterações não documentadas.
