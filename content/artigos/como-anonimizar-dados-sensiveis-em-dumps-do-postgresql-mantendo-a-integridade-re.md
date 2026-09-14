---
title: "Como Anonimizar Dados no PostgreSQL Mantendo Integridade"
slug: "como-anonimizar-dados-sensiveis-em-dumps-do-postgresql-mantendo-a-integridade-re"
category: "Banco de Dados"
description: "Aprenda a anonimizar PII e dados sensíveis em dumps do PostgreSQL sem violar a integridade referencial ou quebrar chaves estrangeiras em staging."
date: "2026-09-14 20:42:12.484548+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1687603921109-46401b201195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8QW5vbmltaXphciUyMERhZG9zJTIwU2VucyVDMyVBRHZlaXMlMjBEdW1wcyUyMFBvc3RncmVTUUx8ZW58MHwwfHx8MTc4OTQxODUyMHww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Anonimizar Dados no PostgreSQL Mantendo Integridade"
imageAuthor: "Rahul Mishra"
---

# Como Anonimizar Dados Sensíveis em Dumps do PostgreSQL Mantendo a Integridade Referencial

Utilizar cópias do banco de dados de produção para alimentar ambientes de staging, homologação e desenvolvimento é uma prática frequente na engenharia de software. Dados reais ajudam a identificar bugs complexos, validar o desempenho e simular cenários operacionais exatos. No entanto, clonar o ambiente de produção sem os devidos cuidados viola regulamentações de privacidade de dados, como a LGPD e o GDPR, além de expor a empresa a riscos graves de vazamento de informações pessoalmente identificáveis (PII).

O grande desafio técnico surge ao tentar sanitizar esses dados: **como alterar nomes, documentos, e-mails e senhas sem corromper as restrições de chave estrangeira (Foreign Keys) e a integridade referencial do banco de dados?**

Este artigo detalha estratégias práticas e comandos para realizar essa anonimização de forma consistente no PostgreSQL.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de anonimização mostrando extração de produção, passagem pelo pipeline de mascaramento e carga no banco de staging
motivo: Explicar visualmente em qual etapa do pipeline a anonimização deve ocorrer para evitar o vazamento de PII
[/IMAGEM]

---

## O Problema das Chaves Estrangeiras e Dados Relacionados

Imagine um cenário em que a tabela `clientes` possui uma chave primária `id` e a tabela `pedidos` possui uma chave estrangeira `cliente_id`. Além disso, pode haver buscas que dependem do e-mail do cliente presente em ambas as tabelas ou em tabelas de auditoria.

Se você simplesmente aplicar uma função aleatória para substituir e-mails ou reescrever os IDs numéricos sem critério, os relacionamentos se quebrarão. Existem dois tipos de dados que precisam de abordagens distintas:

1. **Atributos Descritivos (Não Identificadores):** Nomes, e-mails, telefones, logradouros e números de cartão. Podem ser substituídos por dados fictícios ou hashes sem afetar a estrutura do banco.
2. **Chaves Naturais ou Identificadores Relacionais:** Dados como CPF, CNPJ ou códigos externos usados como chaves de junção (`JOIN`) em sistemas legados ou integrados. Se estes precisarem ser alterados, a modificação precisa ser **determinística**.

---

## Estratégias de Anonimização

Para garantir integridade e utilidade nos dados de staging, aplicam-se duas abordagens principais:

### 1. Manutenção de Chaves Substitutas (PKs/FKs Numéricas)
Quando as relações são mantidas por chaves numéricas sequenciais (`SERIAL` ou `BIGSERIAL`) ou `UUID`s gerados pelo sistema, a solução mais simples é **não alterar as chaves primárias e estrangeiras**, mascarando apenas as colunas de PII.

### 2. Mascaramento Determinístico para Chaves Naturais
Se a junção entre tabelas depende de um atributo sensível (como o documento do usuário), é necessário usar um algoritmo determinístico com *salt* secreto. Dessa forma, o valor `123.456.789-00` na tabela A sempre se transformará no mesmo valor mascarado `987.654.321-99` na tabela B, preservando a integridade do `JOIN`.

---

## Método 1: Anonimização Nativa com SQL e pgcrypto

É possível criar um script de pós-processamento utilizando apenas recursos nativos do PostgreSQL e a extensão `pgcrypto`.

### Passo 1: Preparação do Ambiente Temporário
Nunca execute scripts de anonimização diretamente no banco de produção primário. O fluxo correto envolve:
1. Gerar um dump ou backup do banco de produção.
2. Restaurar o backup em um servidor isolado de sanitização.
3. Executar o script de anonimização nesse ambiente isolado.
4. Exportar o banco sanitizado para o ambiente de staging.

### Passo 2: Execução do Script de Mascaramento

```sql
-- Habilita a extensao para geracao de hashes seguros
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- 1. Mascarar tabela de usuarios preservando os IDs intactos
UPDATE usuarios
SET 
    nome = 'Usuario ' || id,
    email = 'user_' || id || '@staging.local',
    cpf = LPAD((abs(hashtext(cpf || 'SALT_SECRETO_DO_PIPELINE')) % 10000000000)::text, 11, '0'),
    senha_hash = '$2a$12$e8pABy/Q49vE/p3c2hY5A.4vXz.yG5gY1uF3u0zW1vX2yZ3a4b5c6'; -- Senha padrao 'staging123'

-- 2. Mascarar logradouros mantendo estrutura valida
UPDATE enderecos
SET 
    rua = 'Rua de Teste ' || id,
    numero = (id % 500)::text,
    complemento = NULL,
    cep = '00000-000';

COMMIT;
```

Neste exemplo, a função `hashtext()` associada a um *salt* cria um valor numérico consistente baseado no documento original. O uso de `id` para concatenar nomes e e-mails evita violações de restrições de unicidade (`UNIQUE constraints`).

---

## Método 2: Uso da Extensão PostgreSQL Anonymizer

Para ambientes mais complexos, a extensão código aberto `postgresql_anonymizer` (também conhecida como `pg_anon`) permite definir regras declarativas diretamente na DDL do banco via `SECURITY LABEL`.

### Como Funciona

Após instalar a extensão no servidor de sanitização, definem-se as regras que cada coluna sensível deve seguir:

```sql
CREATE EXTENSION IF NOT EXISTS anon CASCADE;
SELECT anon.init();

-- Declarando regras de mascaramento
SECURITY LABEL FOR anon ON COLUMN clientes.nome
  IS 'MASKED WITH FUNCTION anon.fake_first_name()';

SECURITY LABEL FOR anon ON COLUMN clientes.email
  IS 'MASKED WITH FUNCTION anon.partial(email, 2, ''******'', 3)';

SECURITY LABEL FOR anon ON COLUMN clientes.cpf
  IS 'MASKED WITH FUNCTION anon.hash(cpf)';
```

### Exportando o Dump Já Anonimizado

A ferramenta fornece um utilitário de linha de comando ou função em SQL para exportar o dump mantendo a estrutura e os dados alterados segundo as regras:

```bash
# Executando a exportacao anonimizada via pg_dump_anon
pg_dump_anon -h localhost -U postgres -d banco_sanitizacao -f staging_sanitizado.sql
```

Como o `pg_anon` respeita as chaves primárias e aplica mascaramentos determinísticos quando configurado via `anon.hash()`, a integridade referencial permanece intacta em todo o esquema.

---

## Comparativo de Abordagens

| Critério | Script SQL Customizado | PostgreSQL Anonymizer (`pg_anon`) |
| :--- | :--- | :--- |
| **Dependências** | Nenhuma (apenas PostgreSQL nativo) | Requer instalação da extensão no servidor |
| **Manutenção** | Requer atualizar scripts a cada mudança no esquema | Regras centralizadas no próprio DDL/Esquema |
| **Complexidade** | Baixa para esquemas simples | Média para configuração inicial |
| **Desempenho** | Alto (`UPDATE`s em lote) | Alto (substituição no momento da exportação) |

---

## Checklist de Segurança para Ambientes de Staging

- [ ] **Isolamento de Processo:** A anonimização ocorre em um contêiner ou servidor intermediário, sem acesso externo durante o processo.
- [ ] **Tratamento de Constraints UNIQUE:** E-mails e documentos mascarados utilizam sequenciais ou hashes para evitar erros de duplicidade.
- [ ] **Limpeza de Tabelas de Log e Auditoria:** Tabelas como `auditoria`, `logs_acesso` e `sessoes` que contêm payloads JSON com PII devem ser truncadas (`TRUNCATE`), e não apenas mascaradas.
- [ ] **Validação Automática:** Incluir no pipeline de CI/CD um teste automatizado que verifica se ainda existem padrões de e-mail ou documentos reais no dump gerado antes da carga final em staging.
