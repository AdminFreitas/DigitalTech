---
title: "Como modernizar repositório Python legado com Poetry e pre-commit"
slug: "como-modernizar-um-repositorio-python-legado-com-poetry-e-pre-commit-de-forma-se"
category: "Open Source"
description: "Guia prático para migrar projetos Python antigos para Poetry e configurar pre-commit sem riscos de quebras em produção. Passos seguros com mapeamento e isolamento prévios."
date: "2026-09-02 13:09:35.641382+00:00"
readTime: "4"
image: "https://images.pexels.com/photos/3280908/pexels-photo-3280908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como modernizar repositório Python legado com Poetry e pre-commit"
imageAuthor: "Jan Kopřiva"
---

# Como Modernizar um Repositório Python Legado com Poetry e Pre-Commit de Forma Segura

Projetos Python que crescem ao longo dos anos frequentemente acumulam débitos técnicos no gerenciamento de ambientes e na padronização de código. É comum encontrar repositórios baseados em arquivos `requirements.txt` desatualizados, dependências sem versões fixadas e falta de verificações automáticas de estilo.

A modernização dessa infraestrutura de código é fundamental para garantir a manutenibilidade e a segurança. No entanto, alterar a estrutura de dependências ou aplicar linters em um projeto antigo traz o risco de introduzir quebras em produção.

Neste artigo, detalhamos uma estratégia progressiva para migrar repositórios Python legados para o **Poetry** (gerenciamento de dependências e empacotamento) e **pre-commit** (automação de verificações locais), mantendo a estabilidade da aplicação.

## Passo 1: Mapeamento e Isolamento Prévios

Antes de instalar novas ferramentas, é fundamental garantir a rastreabilidade do estado atual da aplicação.

1. **Garanta uma suíte mínima de testes**: Se o projeto não possui testes, crie testes de fumaça (smoke tests) ou testes de integração básicos cobrindo os fluxos principais. Tentar refatorar o ambiente sem testes prévios aumenta exponencialmente o risco de regressões silenciosas.
2. **Gere um retrato exato do ambiente atual**: Em seu ambiente virtual ativo onde o projeto funciona corretamente, exporte as dependências exatas com o comando:

```bash
pip freeze > requirements-freeze.txt
```

Esse arquivo servirá como referência de segurança para garantir que nenhuma versão de biblioteca seja alterada inadvertidamente durante a transição.

## Passo 2: Migração para o Poetry

O Poetry substitui a combinação de `setup.py`, `requirements.txt` e `MANIFEST.in` por um único arquivo padronizado (`pyproject.toml`), além de gerar um arquivo `poetry.lock` que garante construções determinísticas.

[IMAGEM]
tipo: diagrama
assunto: Fluxo da migração de dependências tradicionais para a estrutura com Poetry e pyproject.toml
motivo: Visualizar como os arquivos antigos são consolidados no novo formato padrão.
[/IMAGEM]

### Inicializando o Poetry no Projeto

No diretório raiz do repositório existente, execute:

```bash
poetry init
```

O assistente interativo solicitará informações do projeto. Você pode aceitar os valores padrão para o nome e versão ou preenchê-los conforme a especificação do seu software.

### Importando Dependências Existentes

Para evitar que o Poetry resolva dependências em versões mais recentes do que as testadas em produção, utilize o arquivo de congelamento gerado anteriormente.

Você pode converter seu arquivo congelado diretamente adicionando as dependências principais. Se o projeto utiliza bibliotecas diretas (por exemplo, `Django==3.2.18`), adicione-as explicitamente:

```bash
poetry add Django@3.2.18 requests@2.28.1
```

Para dependências de desenvolvimento (como `pytest` ou `flake8`), utilize a flag `--group dev`:

```bash
poetry add pytest@7.2.0 --group dev
```

Após a inclusão, o Poetry gerará o arquivo `poetry.lock`. Esse arquivo deve ser versionado no Git para garantir que todos os desenvolvedores e servidores de CI/CD utilizem exatamente o mesmo grafo de dependências.

### Validando a Instalação

Crie um novo ambiente isolado via Poetry e execute seus testes para confirmar a equivalência funcional:

```bash
poetry install
poetry run pytest
```

## Passo 3: Configuração do Pre-commit sem Causar Impactos Repentinos

O `pre-commit` é uma ferramenta que executa rotinas automáticas de verificação antes de cada commit. O maior erro ao introduzi-lo em projetos legados é aplicar formatação automática agressiva em todo o código de uma só vez, o que dificulta o rastreamento via `git blame` e pode alterar comportamentos inesperadamente.

### Adicionando a Dependência

Adicione o `pre-commit` ao grupo de desenvolvimento do Poetry:

```bash
poetry add pre-commit --group dev
```

### Criando a Configuração Gradual

Crie o arquivo `.pre-commit-config.yaml` na raiz do repositório. Comece apenas com verificações sintáticas e de infraestrutura, sem alterar lógica de negócio:

```yaml
repos:
  - repo: pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-added-large-files
```

Para ativar os hooks no seu repositório local, execute:

```bash
poetry run pre-commit install
```

### Executando em Arquivos Existentes de Forma Controlada

Em vez de aplicar o `pre-commit` em todo o código imediatamente, teste o pipeline manual:

```bash
poetry run pre-commit run --all-files
```

Se houver correções de espaçamento ou final de arquivo, faça um commit exclusivo para essas modificações formais. **Nunca misture refatoração de código com formatação em massa no mesmo commit.**

## Passo 4: Adicionando Linters e Formatadores (Ruff ou Black)

Quando a equipe estiver confortada com os hooks básicos, introduza verificadores de código Python. Uma escolha moderna e de alto desempenho é o **Ruff**, que substitui linters tradicionais em uma única ferramenta rápida.

Adicione o bloco ao seu `.pre-commit-config.yaml`:

```yaml
  - repo: astral-sh/ruff-pre-commit
    rev: v0.0.270
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format
```

## Boas Práticas para Transição em Equipe

- **Commits dedicados para infraestrutura**: Separe as mudanças em `pyproject.toml`, `poetry.lock` e `.pre-commit-config.yaml` das tarefas de funcionalidade ou correção de bugs.
- **Ignorar commits de formatação no Git Blame**: Crie um arquivo `.git-blame-ignore-revs` e adicione os hashes de commits que fizeram formatação em massa. Configure o Git local com:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

- **Atualizar CI/CD**: Substitua os comandos tradicionais de instalação (`pip install -r requirements.txt`) pelo Poetry no pipeline de integração contínua:

```bash
poetry install --no-interaction
poetry run pre-commit run --all-files
```

A adoção do Poetry e do pre-commit moderniza o ciclo de desenvolvimento em Python, reduz o tempo de onboarding e previne falhas comuns de ambiente antes que elas atinjam a esteira de deployment.
