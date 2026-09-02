---
title: "Como detectar e corrigir o drift de infraestrutura no Terraform"
slug: "como-detectar-e-corrigir-o-drift-de-infraestrutura-no-terraform-antes-que-afete"
category: "Cloud e DevOps"
description: "Saiba o que é drift de infraestrutura no Terraform, como identificar divergências entre estado real e código e estratégias para corrigir antes que afete a produção."
date: "2026-09-02 19:35:26.747555+00:00"
readTime: "4"
image: "https://images.pexels.com/photos/9131212/pexels-photo-9131212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como detectar e corrigir o drift de infraestrutura no Terraform"
imageAuthor: "Rodolfo Gaion"
---

# Como detectar e corrigir o drift de infraestrutura no Terraform antes que afete a produção

## Introdução

O **drift de infraestrutura** ocorre quando o estado real da infraestrutura não corresponde ao estado definido no código Terraform. Isso pode acontecer por diversos motivos, como alterações manuais, atualizações de provedores ou falhas em processos automatizados. Se não for detectado e corrigido, o drift pode levar a inconsistências, falhas em aplicações e até mesmo interrupções de serviço.

Neste artigo, você aprenderá:
- O que é drift de infraestrutura no Terraform
- Como identificar o drift com ferramentas nativas e externas
- Estratégias para corrigir o problema antes que afete a produção
- Boas práticas para prevenir o drift

---

## O que é drift de infraestrutura no Terraform?

O Terraform gerencia a infraestrutura como código (IaC), permitindo que você defina recursos em arquivos de configuração. No entanto, a infraestrutura real pode divergir do que está definido no código por vários motivos:

- **Alterações manuais**: Um administrador altera um recurso diretamente na nuvem, sem atualizar o Terraform.
- **Atualizações de provedores**: Modificações em APIs de provedores (como AWS, Azure ou GCP) podem causar mudanças no comportamento dos recursos.
- **Dependências ocultas**: Recursos que dependem de outros, mas não estão explicitamente declarados no código.
- **Erros de sincronização**: Falhas em pipelines de CI/CD que não aplicam as mudanças corretamente.

Quando o drift ocorre, o Terraform não consegue mais garantir que a infraestrutura esteja em conformidade com o código, o que pode resultar em:
- Recursos órfãos (existentes na nuvem, mas não no estado do Terraform)
- Recursos modificados (alterados manualmente na nuvem)
- Recursos ausentes (excluídos na nuvem, mas ainda presentes no estado do Terraform)

---

## Como identificar o drift de infraestrutura

### 1. Usando o comando `terraform plan`

O Terraform oferece uma forma nativa de detectar drift com o comando `terraform plan`. Ele compara o estado atual (o que está no arquivo `.tfstate`) com a infraestrutura real na nuvem. Se houver diferenças, o plano mostrará as alterações necessárias para sincronizar o estado.

**Exemplo prático:**

Suponha que você tenha um arquivo `main.tf` definindo uma instância EC2 na AWS:

```hcl
resource "aws_instance" "exemplo" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "servidor-exemplo"
  }
}
```

Se alguém alterar manualmente o tipo da instância no console da AWS para `t2.small`, executar `terraform plan` mostrará:

```
# aws_instance.exemplo will be updated in-place
~ resource "aws_instance" "exemplo" {
    instance_type = "t2.micro" -> "t2.small"
    # ...
  }
```

Isso indica um drift que precisa ser corrigido.

### 2. Ferramentas externas para detecção de drift

Além do `terraform plan`, existem ferramentas especializadas que ajudam a identificar o drift de forma automatizada e contínua:

- **TFLint**: Um linter para Terraform que pode detectar inconsistências entre o código e o estado.
- **Terraform Cloud/Enterprise**: Oferece funcionalidades de detecção de drift integradas ao fluxo de trabalho.
- **Ferramentas como Infracost ou Sentinel**: Podem ser usadas para monitorar mudanças na infraestrutura.
- **Scanners de segurança**: Ferramentas como **Checkov** ou **TFSEC** podem identificar drift relacionado à conformidade.

### 3. Monitoramento contínuo com state locking

O **state locking** é uma funcionalidade do Terraform que impede que múltiplas equipes ou processos modifiquem o estado simultaneamente, reduzindo o risco de drift causado por conflitos. Habilite sempre o state locking em ambientes de produção.

---

## Estratégias para corrigir o drift

Uma vez identificado o drift, é necessário corrigi-lo. As estratégias dependem do tipo de drift e da criticidade do ambiente.

### 1. Sincronizar o estado com a infraestrutura real

Se o drift foi causado por alterações manuais ou falhas de sincronização, a abordagem recomendada é atualizar o estado do Terraform para refletir a infraestrutura real. Você pode fazer isso com o comando:

```bash
terraform import <resource_type>.<resource_name> <id_do_recurso>
```

**Exemplo:**

Se uma instância EC2 foi criada manualmente com o ID `i-1234567890abcdef0`, você pode importá-la para o Terraform:

```bash
terraform import aws_instance.exemplo i-1234567890abcdef0
```

Após a importação, atualize o arquivo `main.tf` para refletir a configuração atual e execute `terraform apply` para garantir que o código esteja alinhado.

### 2. Recriar recursos problemáticos

Em alguns casos, é mais seguro recriar o recurso em vez de importá-lo. Isso é comum quando:
- O recurso foi modificado manualmente de forma significativa.
- O estado do Terraform está corrompido.
- O recurso não é crítico para a produção.

**Passos para recriar um recurso:**

1. Remova a referência ao recurso do código Terraform:
   ```hcl
   # Remova ou comente a linha:
   # resource "aws_instance" "exemplo" { ... }
   ```
2. Execute `terraform apply` para destruir o recurso.
3. Atualize o código Terraform com a configuração desejada.
4. Execute `terraform apply` novamente para recriar o recurso.

⚠️ **Atenção:** Recriar recursos pode causar tempo de inatividade. Teste sempre em um ambiente de desenvolvimento antes de aplicar em produção.

### 3. Usar módulos e políticas para evitar drift

Módulos Terraform ajudam a padronizar a infraestrutura e a reduzir a chance de drift. Por exemplo, você pode criar um módulo para instâncias EC2 que inclua tags obrigatórias e políticas de segurança.

**Exemplo de módulo:**

```hcl
# modules/ec2/main.tf
variable "nome" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

resource "aws_instance" "principal" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  tags = {
    Name = var.nome
  }
}
```
