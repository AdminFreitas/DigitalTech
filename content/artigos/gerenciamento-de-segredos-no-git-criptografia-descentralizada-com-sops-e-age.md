---
title: "Gerenciamento de Segredos no Git: Criptografia com SOPS e Age"
slug: "gerenciamento-de-segredos-no-git-criptografia-descentralizada-com-sops-e-age"
category: "Open Source"
description: "Aprenda a criptografar e gerenciar dados sensíveis e credenciais no Git utilizando as ferramentas SOPS e Age, dispensando cofres de segredos centralizados."
date: "2026-09-09 19:34:59.856241+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1614064548016-0b5c13ca2c85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8R2VyZW5jaWFtZW50byUyMFNlZ3JlZG9zJTIwR2l0JTIwQ3JpcHRvZ3JhZmlhJTIwRGVzY2VudHJhbGl6YWRhfGVufDB8MHx8fDE3ODg5ODI0ODd8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Gerenciamento de Segredos no Git: Criptografia com SOPS e Age"
imageAuthor: "FlyD"
---

# Gerenciamento de Segredos no Git: Criptografia Descentralizada com SOPS e Age

Armazenar credenciais, chaves de API e tokens em repositórios Git é um dos erros de segurança mais recorrentes no desenvolvimento de software. A abordagem ingênua de incluir arquivos contendo dados sensíveis no código-fonte expõe a infraestrutura a vazamentos. Por outro lado, apenas ignorar esses arquivos via `.gitignore` gera outro problema: a perda de rastreabilidade e a complicação no *onboarding* de novos desenvolvedores e nas rotinas de deploy.

Muitas equipes recorrem a cofres centralizados de segredos (como HashiCorp Vault, AWS Secrets Manager ou Azure Key Vault). Embora eficientes para grandes organizações, esses sistemas introduzem complexidade operacional, custo financeiro e dependência de rede durante o processo de *build* e *deploy*.

Existe uma alternativa intermediária eficiente e alinhada às práticas de GitOps: a criptografia de segredos diretamente no repositório usando **SOPS** (Mozilla Secrets OPerationS) e **Age**.

## O que são SOPS e Age?

### SOPS (Secrets OPerationS)
Desenvolvido originalmente pela Mozilla, o SOPS é um editor de arquivos criptografados que suporta formatos estruturados como YAML, JSON, ENV e INI. Diferente de ferramentas que criptografam o arquivo inteiro como um bloco opaco, o SOPS possui uma característica fundamental: **criptografia parcial**. Ele criptografa apenas os *valores* das chaves, mantendo a estrutura e os nomes visíveis em texto claro.

Isso permite:
- Identificar alterações estruturais no arquivo via `git diff`.
- Minimizar conflitos de mesclagem (*merge conflicts*).
- Manter a legibilidade do repositório sem comprometer a segurança dos dados.

### Age (Actually Good Encryption)
O Age é uma ferramenta simples e moderna de criptografia de arquivos, criada como alternativa ao ecossistema complexo do PGP/GPG. Ele utiliza chaves pequenas, formatos explícitos e algoritmos criptográficos consolidados (como X25519 e ChaCha20-Poly1305). O SOPS possui suporte nativo ao Age, tornando a combinação leve e sem dependências pesadas.

[IMAGEM]
tipo: diagrama
assunto: Comparativo entre o modelo com cofre centralizado e o modelo descentralizado com SOPS e Age
motivo: Explicar visualmente como a descentralização elimina chamadas de rede externas no momento da execução do aplicativo no CI/CD
[/IMAGEM]

## Vantagens do Modelo Descentralizado

Comparada ao uso de cofres centralizados, a combinação SOPS + Age oferece:

1. **Zero infraestrutura adicional**: não há necessidade de manter clusters, bancos de dados ou servidores dedicados apenas para gerenciar segredos.
2. **Histórico versionado de segredos**: as alterações nos segredos acompanham o histórico de código no Git de forma auditável.
3. **Independência de conexão de rede**: a descriptografia no pipeline necessita apenas da chave privada e do utilitário `sops`, sem depender da disponibilidade de um serviço remoto.
4. **Custo zero de licenciamento e execução**: ambas as ferramentas são *open source* e rodam localmente ou no agente de CI/CD.

---

## Passo a Passo Prático

### 1. Instalação das Ferramentas
Em ambientes Linux ou macOS, a instalação é realizada baixando os binários do `sops` e do `age` ou utilizando os gerenciadores de pacotes padrão da sua distribuição.

### 2. Geração do Par de Chaves Age
O primeiro passo é gerar uma chave privada e a respectiva chave pública do Age na sua máquina local:

```bash
age-keygen -o key.txt
```

O arquivo `key.txt` gerado conterá uma estrutura semelhante a esta:

```text
# created: 2026-03-30T10:00:00Z
# public key: age1ql3w92axyacaw238dzw8694379abcde1234567890
AGE-SECRET-KEY-1...
```

- A linha iniciada com `public key:` contém sua chave pública (pode ser compartilhada com a equipe).
- A linha iniciada com `AGE-SECRET-KEY-` é sua chave privada (**nunca deve ser enviada para o repositório Git**).

### 3. Configuração do SOPS (`.sops.yaml`)
Crie um arquivo de configuração chamado `.sops.yaml` na raiz do seu repositório Git. Este arquivo instrui o SOPS sobre qual chave utilizar para criptografar determinados caminhos:

```yaml
creation_rules:
  - path_regex: .*\.enc\.yaml$
    age: "age1ql3w92axyacaw238dzw8694379abcde1234567890"
```

Neste exemplo, qualquer arquivo que termine em `.enc.yaml` será automaticamente criptografado usando a chave pública informada.

### 4. Criando e Criptografando um Arquivo de Segredos
Crie um arquivo YAML com dados sensíveis, por exemplo, `secrets.enc.yaml`:

```yaml
database:
  host: db.internal.net
  port: 5432
  password: SuperSecretPassword123
api_key: xyz987654321
```

Para criptografar o arquivo diretamente, execute:

```bash
sops -e -i secrets.enc.yaml
```

Após a execução, a estrutura das chaves continuará legível, mas os valores serão substituídos por blocos criptografados, acompanhados por metadados de controle do SOPS no final do arquivo.

### 5. Edição e Descriptografia
Para editar o arquivo criptografado de maneira transparente:

```bash
sops secrets.enc.yaml
```

O SOPS abrirá o arquivo descriptografado no seu editor de texto padrão. Ao salvar e fechar o editor, o SOPS recriptografa o conteúdo automaticamente antes de gravar no disco.

Para visualizar o conteúdo descriptografado na saída padrão do terminal:

```bash
sops -d secrets.enc.yaml
```

---

## Integração com Pipelines de CI/CD

Para utilizar os segredos dentro de um pipeline de integração contínua (como GitHub Actions ou GitLab CI):

1. Armazene o conteúdo do arquivo `key.txt` (a chave privada Age) em uma variável secreta do próprio ambiente de CI/CD (por exemplo, `SOPS_AGE_KEY`).
2. No script do pipeline, instale o executável do `sops`.
3. Exporte a variável com a chave privada antes de invocar a descriptografia:

```bash
export SOPS_AGE_KEY="$CI_SECRET_AGE_KEY"
sops -d secrets.enc.yaml > secrets.yaml
```

Sua aplicação consumirá o arquivo `secrets.yaml` gerado durante a execução do job sem que senhas precisem ser expostas no código-fonte.

---

## Boas Práticas e Segurança

- **Inclusão no `.gitignore`**: garanta que arquivos de chaves privadas (como `key.txt` ou qualquer arquivo com extensão `.age`) estejam incluídos no `.gitignore` do repositório.
- **Múltiplos Destinatários**: o Age suporta criptografia para múltiplas chaves públicas. É recomendável incluir a chave pública de cada desenvolvedor autorizado e a chave do servidor de CI no arquivo `.sops.yaml`. Dessa forma, qualquer membro da equipe pode descriptografar o arquivo com sua própria chave privada.
- **Rotação de Chaves**: se uma chave privada for comprometida ou um membro deixar a equipe, remova a chave pública correspondente do arquivo `.sops.yaml` e execute o comando `sops updatekeys secrets.enc.yaml` para re-criptografar o arquivo com o novo conjunto de chaves.

## Conclusão

A utilização do SOPS com o Age oferece um equilíbrio prático entre a segurança rigorosa de cofres centralizados e a flexibilidade exigida pelo desenvolvimento moderno. Para equipes que adotam GitOps e buscam manter configurações completas no próprio repositório sem adicionar infraestrutura complexa, este modelo descentralizado é uma solução sustentável e fácil de manter.
