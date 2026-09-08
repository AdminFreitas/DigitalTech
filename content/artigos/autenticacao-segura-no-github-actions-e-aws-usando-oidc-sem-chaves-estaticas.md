---
title: "Autenticação OIDC no GitHub Actions e AWS Sem Chaves"
slug: "autenticacao-segura-no-github-actions-e-aws-usando-oidc-sem-chaves-estaticas"
category: "Cloud e DevOps"
description: "Aprenda a autenticar o GitHub Actions na AWS com OIDC e tokens JWT temporários, eliminando chaves de acesso estáticas e aumentando a segurança no CI/CD."
date: "2026-09-08 19:41:40.265160+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1774901128281-a884cd447af5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8Nnx8QXV0ZW50aWNhJUMzJUE3JUMzJUEzbyUyMFNlZ3VyYSUyMEdpdEh1YiUyMEFjdGlvbnMlMjBBV1N8ZW58MHwwfHx8MTc4ODg5NjQ4OXww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Autenticação OIDC no GitHub Actions e AWS Sem Chaves"
imageAuthor: "Bernd 📷 Dittrich"
---

# Autenticação Segura no GitHub Actions e AWS usando OIDC sem Chaves Estáticas

Gerenciar credenciais em pipelines de Integração e Entrega Contínua (CI/CD) é um dos maiores desafios de segurança em nuvem. Tradicionalmente, para permitir que o GitHub Actions interaja com recursos na Amazon Web Services (AWS), engenheiros criavam usuários IAM dedicados e geravam pares de chaves de acesso de longa duração (`AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`), armazenando-os como segredos (*secrets*) no repositório.

Embora funcional, esse modelo apresenta riscos significativos: credenciais estáticas podem ser vazadas acidentalmente em logs, reutilizadas de forma indevida se expostas e exigem processos complexos de rotação periódica.

A solução recomendada pela AWS e pelo GitHub para eliminar esse risco é a utilização do protocolo **OpenID Connect (OIDC)**. Com o OIDC, o GitHub Actions autentica-se diretamente na AWS utilizando tokens JWT (JSON Web Token) temporários de curta duração, eliminando a necessidade de armazenar credenciais estáticas.

---

## Como Funciona a Autenticação via OIDC?

Em vez de utilizar uma chave fixa, a autenticação baseada em OIDC estabelece uma relação de confiança federada entre o GitHub e a AWS.

1. **Solicitação do Token**: Quando o pipeline é executado, o runner do GitHub Actions solicita um token de identidade (JWT) ao provedor OIDC do próprio GitHub.
2. **Envio à AWS**: O runner envia esse token para o serviço AWS Security Token Service (STS), solicitando assumir uma *Role* (função) IAM específica.
3. **Validação de Confiança**: A AWS valida a assinatura do token no provedor OIDC do GitHub configurado na conta. Ela verifica se os metadados do token (como repositório, organização e branch) correspondem às condições definidas na política de confiança (*Trust Policy*) da *Role*.
4. **Credenciais Temporárias**: Se os dados forem válidos, a AWS retorna credenciais temporárias de acesso que expiram automaticamente em um curto período (geralmente 1 hora).

[IMAGEM]
tipo: diagrama
assunto: Fluxo de troca de tokens OIDC entre GitHub Actions e AWS STS
motivo: Explicar visualmente a sequência de autenticação sem senhas entre o runner e a nuvem AWS
[/IMAGEM]

---

## Comparativo: Chaves Estáticas vs. OIDC

| Característica | Chaves Estáticas (Tradicional) | OIDC (Recomendado) |
| :--- | :--- | :--- |
| **Duração do Acesso** | Indefinida (até ser revogada) | Curta duração (minutos/horas) |
| **Armazenamento** | Segredos no repositório | Nenhum segredo de acesso armazenado |
| **Risco de Vazamento** | Alto (se exposto, permite acesso direto) | Mínimo (tokens expiram rapidamente) |
| **Manutenção** | Alta (necessita rotação manual/automatizada) | Baixa (gestão automática pela AWS) |
| **Granularidade** | Acesso associado ao usuário IAM | Restrito por repositório, branch e ambiente |

---

## Passo a Passo de Configuração

A implementação do OIDC entre o GitHub Actions e a AWS exige três etapas principais: criação do provedor de identidade na AWS, criação da Role IAM com políticas de restrição e atualização do arquivo de workflow no GitHub.

### Passo 1: Criar o Provedor de Identidade OIDC na AWS

Primeiro, você deve registrar o GitHub como um Provedor de Identidade (Identity Provider - IdP) confiável na sua conta AWS.

1. Acesse o console do **AWS IAM**.
2. No menu lateral, clique em **Identity providers** (Provedores de identidade) e depois em **Add provider**.
3. Selecione a opção **OpenID Connect**.
4. Defina a **Provider URL**: `https://token.actions.githubusercontent.com`
5. Defina o **Audience**: `sts.amazonaws.com`
6. Clique em **Get thumbprint** para obter a impressão digital do certificado e finalize em **Add provider**.

### Passo 2: Criar a Role IAM e a Política de Confiança

Agora, crie a Role que o GitHub Actions assumirá. O ponto mais crítico aqui é a **Trust Policy** (Política de Confiança), que define exatamente qual repositório tem permissão para assumir essa função.

Crie uma Role do tipo **Web Identity**, selecione o provedor `token.actions.githubusercontent.com` e aplique uma Trust Policy estruturada como no exemplo abaixo:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:seu-usuario/seu-repositorio:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

> **Nota de Segurança**: Substitua `123456789012` pelo ID da sua conta AWS e `seu-usuario/seu-repositorio` pela sua organização e repositório no GitHub. A chave `sub` (*subject*) garante que **apenas** as execuções vindas da branch `main` deste repositório específico consigam se autenticar.

Após criar a Role, anexe a ela apenas as permissões necessárias para a tarefa (por exemplo, permissão para enviar imagens para o Amazon ECR ou atualizar uma função AWS Lambda).

### Passo 3: Configurar o Workflow do GitHub Actions

No seu repositório do GitHub, edite o arquivo de pipeline (ex.: `.github/workflows/deploy.yml`).

Para que a action consiga solicitar o token JWT, é obrigatório declarar a permissão `id-token: write` no workflow.

```yaml
name: Deploy para AWS usando OIDC

on:
  push:
    branches:
      - main

permissions:
  id-token: write # Obrigatório para solicitar o token JWT OIDC
  contents: read  # Necessário para fazer checkout do código

jobs:
  aws-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do código
        uses: actions/checkout@v4

      - name: Autenticar na AWS via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/NomeDaSuaRoleOIDC
          aws-region: us-east-1

      - name: Validar Identidade Autenticada
        run: |
          aws sts get-caller-identity
```

Ao executar esse workflow, a action `configure-aws-credentials` cuidará automaticamente de obter o token OIDC do GitHub e trocá-lo pelas credenciais temporárias do AWS STS. O comando `aws sts get-caller-identity` exibirá a Role assumida com sucesso, confirmando que a autenticação ocorreu sem o uso de chaves estáticas.

---

## Boas Práticas de Segurança

* **Princípio do Menor Privilégio**: Conceda à Role IAM apenas as permissões estritamente necessárias para a execução do pipeline.
* **Restrição do *Subject* (`sub`)**: Evite usar caracteres coringas genéricos como `repo:seu-usuario/*:*` em ambientes de produção. Seja o mais específico possível, restringindo por repositório, *environment* ou *tags* de release.
* **Uso de Environments no GitHub**: Combine o uso de OIDC com a funcionalidade de *Environments* do GitHub Actions para exigir aprovações manuais antes que deploys em produção assumam Roles críticas na AWS.

Ao migrar para a arquitetura baseada em OIDC, sua infraestrutura elimina uma das maiores superfícies de ataque em pipelines modernos: a gestão inadequada de segredos de longa duração.
