---
title: "Como usar políticas de ciclo de vida para reduzir custos no S3 AWS"
slug: "otimizacao-de-custos-em-nuvem-com-politicas-de-ciclo-de-vida-na-aws"
category: "Cloud e DevOps"
description: "Guia prático sobre implementar políticas de ciclo de vida no Amazon S3 para transicionar ou excluir objetos automaticamente, reduzindo custos de armazenamento sem perder dados."
date: "2026-08-29 06:39:36.339513+00:00"
readTime: "4"
image: "https://images.unsplash.com/photo-1586448354773-30706da80a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MXx8T3RpbWl6YSVDMyVBNyVDMyVBM28lMjBjdXN0b3MlMjBudXZlbSUyMHBvbCVDMyVBRHRpY2FzJTIwY2ljbG98ZW58MHwwfHx8MTc4Nzk4NTU3MXww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como usar políticas de ciclo de vida para reduzir custos no S3 AWS"
imageAuthor: "KOBU Agency"
---

# Otimização de custos em nuvem com políticas de ciclo de vida na AWS

## Introdução

O armazenamento em nuvem é uma solução poderosa para empresas de todos os portes, mas seus custos podem crescer rapidamente se não forem gerenciados adequadamente. A **Amazon Web Services (AWS)** oferece mecanismos robustos para controlar gastos com armazenamento, e um dos mais eficazes é o uso de **políticas de ciclo de vida de objetos** no **Amazon S3 (Simple Storage Service)**. Este artigo explica como implementar políticas inteligentes para otimizar custos sem comprometer a disponibilidade ou integridade dos dados.

## O que são políticas de ciclo de vida?

Políticas de ciclo de vida são regras configuráveis que determinam automaticamente o destino dos objetos armazenados no S3 ao longo do tempo. Elas permitem definir ações como:

- **Transição** de objetos para classes de armazenamento mais econômicas (por exemplo, do S3 Standard para S3 IA ou S3 Glacier).
- **Exclusão** de objetos após um período definido.

Essas políticas são baseadas em **regras de idade**, ou seja, você define um prazo (em dias) a partir da data de criação do objeto para que as ações sejam executadas.

## Por que usar políticas de ciclo de vida?

1. **Redução de custos**: Objetos acessados com pouca frequência podem ser movidos para classes de armazenamento mais baratas, como o **S3 Glacier**, que chega a custar 90% menos que o S3 Standard.

2. **Automatização**: Elimina a necessidade de intervenção manual para gerenciar o armazenamento.

3. **Conformidade**: Ajuda a atender requisitos legais ou corporativos de retenção de dados.

4. **Desempenho otimizado**: Objetos frequentemente acessados permanecem em classes rápidas, enquanto os menos acessados migram para opções mais lentas e econômicas.

## Como funcionam as classes de armazenamento do S3?

Antes de criar políticas, é importante conhecer as classes de armazenamento disponíveis e seus custos relativos:

| Classe de armazenamento | Uso típico | Custo relativo (S3 Standard = 100) | Tempo de recuperação |
|-------------------------|------------|------------------------------------|----------------------|
| **S3 Standard**         | Dados frequentemente acessados | 100% | Imediato |
| **S3 Intelligent-Tiering** | Dados com padrões de acesso desconhecidos | 20–40% (acima de 500TB) | Imediato |
| **S3 Standard-IA** (Infrequent Access) | Dados acessados com pouca frequência | 40–50% | Milissegundos |
| **S3 One Zone-IA** | Dados acessados raramente e não críticos | 20–30% | Milissegundos |
| **S3 Glacier Instant Retrieval** | Arquivos antigos, mas que podem ser recuperados rapidamente | 10–20% | Milissegundos |
| **S3 Glacier Flexible Retrieval** | Arquivos para backup ou arquivamento | 5–10% | Minutos a horas |
| **S3 Glacier Deep Archive** | Arquivamento de longo prazo e dados não críticos | 1–2% | 12 horas ou mais |

### Exemplo prático de economia

Suponha que uma empresa armazene **10 TB de dados** no S3 Standard:

- **Custo mensal estimado**: R$ 2.500 (considerando R$ 0,023 por GB/mês).

Se 60% desses dados forem movidos para o **S3 Glacier Deep Archive** após 90 dias:

- **Custo mensal após transição**: R$ 500 (60% de 10 TB em S3 Standard + 40% em Glacier Deep Archive).
- **Economia mensal**: R$ 2.000 (80% de redução).

## Passo a passo: Criando uma política de ciclo de vida

Vamos criar uma política que:
1. Transfira objetos do **S3 Standard** para o **S3 IA** após 30 dias.
2. Transfira objetos do **S3 IA** para o **S3 Glacier** após 90 dias.
3. Exclua objetos do **S3 Glacier** após 7 anos.

### 1. Acesse o console do Amazon S3

1. Faça login no Console de Gerenciamento da AWS.
2. Navegue até o serviço **S3**.
3. Selecione o bucket que deseja configurar.

### 2. Crie ou edite a política de ciclo de vida

1. Na aba **Gerenciamento**, clique em **Ciclo de vida**.
2. Clique em **Criar regra de ciclo de vida**.
3. Dê um nome descritivo para a regra (ex.: `politica-economia-90d`).

### 3. Defina as ações da política

Você pode criar três ações principais:

#### Ação 1: Transição para S3 IA após 30 dias

- **Tipo de ação**: Transição.
- **Classe de armazenamento**: S3 Standard-IA.
- **Dias após a criação**: 30.

#### Ação 2: Transição para S3 Glacier após 90 dias

- **Tipo de ação**: Transição.
- **Classe de armazenamento**: S3 Glacier.
- **Dias após a criação**: 90 (contados a partir da data de criação original, não da transição anterior).

#### Ação 3: Exclusão após 7 anos

- **Tipo de ação**: Exclusão.
- **Dias após a criação**: 2555 (7 anos × 365 dias).

### 4. Configure a política

Aqui está um exemplo de política em formato JSON que você pode aplicar via AWS CLI ou Console:

```json
{
  "Rules": [
    {
      "ID": "politica-economia-90d",
      "Status": "Enabled",
      "Filter": { "Prefix": "" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```
