---
title: "Como configurar pipelines de CI/CD no GitHub Actions para..."
slug: "como-configurar-pipelines-de-cicd-no-github-actions-para-validar-migracoes-de-ba"
category: "Engenharia de Software"
description: "Guia passo a passo para usar GitHub Actions e Flyway na validação automática de migrações."
date: "2026-08-22 04:54:57.721371+00:00"
readTime: "2"
image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8N3x8Y29uZmlndXJhciUyMHBpcGVsaW5lcyUyMENJJTJGQ0QlMjBHaXRIdWIlMjBBY3Rpb25zfGVufDB8MHx8fDE3ODczNzQ0OTN8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como configurar pipelines de CI/CD no GitHub Actions para..."
imageAuthor: "Yancy Min"
---

# Como configurar pipelines de CI/CD no GitHub Actions para validar migrações de banco de dados com Flyway

## Visão geral
Este artigo apresenta um fluxo de trabalho evergreen para integrar a ferramenta de versionamento de esquemas **Flyway** em pipelines de CI/CD usando **GitHub Actions**. O objetivo é garantir que todas as migrações de banco de dados sejam validadas antes de serem aplicadas em ambientes de produção, reduzindo riscos de falhas de schema.

## Pré-requisitos
- Repositório Git hospedado no GitHub
- Projeto contendo scripts de migração no diretório padrão `sql/` ou `db/migration/`
- Flyway configurado localmente (versão mínima recomendada: 9.x)
- Credenciais de acesso ao banco de dados armazenadas como **GitHub Secrets** (`DB_URL`, `DB_USER`, `DB_PASSWORD`)

## Estrutura típica do repositório
```
my-app/
├─ src/
├─ sql/                # arquivos *.sql de migrações
│   ├─ V1__init.sql
│   └─ V2__add_user_table.sql
├─ flyway.conf         # configuração padrão do Flyway
└─ .github/
    └─ workflows/
        └─ flyway.yml   # pipeline que vamos criar
```

## Passo a passo para criar o workflow

### 1. Criar o arquivo de workflow
No diretório `.github/workflows/` adicione um arquivo chamado `flyway.yml`.

### 2. Definir gatilhos
Indicamos quando o workflow deve ser executado. Normalmente usamos `push` e `pull_request` na branch `main` (ou outra branch de produção).

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### 3. Declarar o job principal
Usaremos um único job chamado `validate-migration`, que roda em um runner Ubuntu.

```yaml
jobs:
  validate-migration:
    runs-on: ubuntu-latest
```

### 4. Etapas (steps) do job

#### a) Checkout do código
```yaml
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
```

#### b) Configurar Java (necessário para o Flyway CLI)
```yaml
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
```

#### c) Instalar o Flyway CLI
```yaml
      - name: Install Flyway
        run: |
          curl -L https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.22.1/flyway-commandline-9.22.1-linux-x64.tar.gz | tar xz
          sudo ln -s $(pwd)/flyway-9.22.1/flyway /usr/local/bin/flyway
```

#### d) Validar as migrações
```yaml
      - name: Validate migrations
        env:
          FLYWAY_URL: ${{ secrets.DB_URL }}
          FLYWAY_USER: ${{ secrets.DB_USER }}
          FLYWAY_PASSWORD: ${{ secrets.DB_PASSWORD }}
```
