---
title: "Como Configurar Mascaramento Dinâmico de Dados no PostgreSQL"
slug: "como-configurar-mascaramento-dinamico-de-dados-no-postgresql-para-proteger-ambie"
category: "Banco de Dados"
description: "Aprenda a implementar o mascaramento dinâmico de dados no PostgreSQL usando a extensão anon e views para proteger dados sensíveis em ambientes de dev."
date: "2026-08-30 14:07:18.594872+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1642356692954-3fbb84baf1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8N3x8Y29uZmlndXJhciUyMG1hc2NhcmFtZW50byUyMGRpbiVDMyVBMm1pY28lMjBkYWRvcyUyMFBvc3RncmVTUUx8ZW58MHwwfHx8MTc4ODA5ODgyM3ww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Configurar Mascaramento Dinâmico de Dados no PostgreSQL"
imageAuthor: "Shubham Dhage"
---

# Como Configurar Mascaramento Dinâmico de Dados no PostgreSQL

O uso de dados reais de produção em ambientes de desenvolvimento e homologação (*staging*) ajuda a identificar bugs e testar o desempenho das aplicações. No entanto, expor informações de identificação pessoal (PII) — como CPF, e-mail, telefone e dados bancários — para desenvolvedores e sistemas de testes viola regulamentações de privacidade, como LGPD e GDPR, além de aumentar a superfície de ataque em caso de vazamento.

O **mascaramento dinâmico de dados** (*Dynamic Data Masking* - DDM) resolve esse problema. Ele altera a forma como as informações sensíveis são exibidas em tempo de execução, com base nos privilégios do usuário que executa a consulta SQL, mantendo o dado original intacto no disco.

Abaixo, você verá como implementar o mascaramento dinâmico no PostgreSQL utilizando a extensão **PostgreSQL Anonymizer (`anon`)** e também uma abordagem nativa baseada em *views* e controle de acesso (*RBAC*).

---

## Mascaramento Dinâmico vs. Mascaramento Estático

Antes de ir para a prática, entenda a diferença entre as duas abordagens principais de ofuscação:

* **Mascaramento Estático (*Static Masking*):** Transforma os dados permanentemente na cópia da base de dados (*dump*). O banco de desenvolvimento recebe informações que já foram alteradas durante o processo de exportação ou importação.
* **Mascaramento Dinâmico (*Dynamic Masking*):** Os dados originais permanecem intactos na tabela original. Quando um usuário sem permissão executa um `SELECT`, o mecanismo de mascaramento intercepta a resposta e aplica regras de ofuscação em tempo real.

[IMAGEM]
tipo: diagrama
assunto: Arquitetura comparativa entre a resposta de uma consulta SQL para um usuário administrador (dados reais) e para um usuário desenvolvedor (dados mascarados dinamicamente).
motivo: Ajudar o leitor a visualizar a camada de interceptação do mascaramento dinâmico em relação ao banco de dados e à aplicação.
[/IMAGEM]

---

## Abordagem 1: Utilizando a Extensão PostgreSQL Anonymizer (`anon`)

O **PostgreSQL Anonymizer** é uma extensão de código aberto voltada para a ofuscação de dados no Postgres. Ela suporta mascaramento dinâmico, mascaramento estático e anonimização declarativa.

### Passo 1: Habilitar a Extensão no Banco

Após instalar o pacote da extensão no servidor PostgreSQL, ative-a no banco de dados desejado:

```sql
CREATE EXTENSION IF NOT EXISTS anon CASCADE;
SELECT anon.init();
```

### Passo 2: Criar a Tabela de Exemplo e Inserir Dados

Crie uma tabela chamada `clientes` contendo dados sensíveis:

```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    cpf VARCHAR(14)
);

INSERT INTO clientes (nome, email, cpf) VALUES
('Carlos Silva', 'carlos.silva@example.com', '123.456.789-00'),
('Ana Souza', 'ana.souza@example.com', '987.654.321-11');
```

### Passo 3: Definir as Regras de Mascaramento

As regras no `anon` são aplicadas via `SECURITY LABEL` diretamente nas colunas das tabelas.

```sql
-- Mascarar o nome utilizando substituição por valor genérico
SECURITY LABEL FOR anon ON COLUMN clientes.nome
  IS 'MASKED WITH FUNCTION anon.dummy_first_name()';

-- Mascarar o e-mail preservando apenas os primeiros e últimos caracteres
SECURITY LABEL FOR anon ON COLUMN clientes.email
  IS 'MASKED WITH FUNCTION anon.partial(email, 2, $$******$$, 2)';

-- Redefinir o CPF substituindo por um valor fixo
SECURITY LABEL FOR anon ON COLUMN clientes.cpf
  IS 'MASKED WITH VALUE $$***.***.***-**$$';
```

### Passo 4: Ativar o Mecanismo Dinâmico e Criar Usuários

Para ativar o mascaramento em tempo de execução, execute a função de inicialização do mecanismo dinâmico:

```sql
SELECT anon.start_dynamic_masking();
```

Em seguida, crie um papel (*role*) para o ambiente de desenvolvimento/homologação e atribua a ele o rótulo de usuário mascarado:

```sql
-- Criar usuário para desenvolvedores
CREATE USER dev_user WITH PASSWORD 'senha_dev_segura';

-- Conceder permissão de leitura na tabela
GRANT USAGE ON SCHEMA public TO dev_user;
GRANT SELECT ON clientes TO dev_user;

-- Declarar que dev_user deve ver dados mascarados
SECURITY LABEL FOR anon ON ROLE dev_user IS 'MASKED';
```

### Passo 5: Testar as Consultas

Ao consultar a tabela como administrador (`postgres`), os dados originais são exibidos:

```sql
SELECT * FROM clientes;
-- Retorna os dados originais
```

Ao alternar a sessão para o usuário `dev_user`:

```sql
SET ROLE dev_user;
SELECT * FROM clientes;
```

O resultado será retornado com as regras aplicadas:

* `nome`: "John" ou "Mary" (nomes aleatórios gerados pela função *dummy*)
* `email`: "ca******om"
* `cpf`: "***.***.***-**"

---

## Abordagem 2: Mascaramento Nativo sem Extensões (Views + Roles)

Se você utiliza um serviço de banco de dados gerenciado em nuvem que impede a instalação de extensões de terceiros, é possível implementar um padrão de mascaramento nativo combinando **Schemas**, **Views** e **Controle de Acesso (RBAC)**.

### Passo 1: Mover a Tabela Original para um Schema Restrito

```sql
CREATE SCHEMA dados_sensiveis;
ALTER TABLE public.clientes SET SCHEMA dados_sensiveis;
```

### Passo 2: Criar uma View no Schema Público com Funções de Truncamento

```sql
CREATE VIEW public.clientes AS
SELECT
    id,
    -- Exibe apenas a primeira letra do nome
    RPAD(SUBSTRING(nome FROM 1 FOR 1), LENGTH(nome), '*') AS nome,
    -- Preserva a estrutura básica do e-mail
    REGEXP_REPLACE(email, '(^.).*(@.*$)', '\1***\2') AS email,
    -- Oculta o CPF completamente
    '***.***.***-**'::VARCHAR(14) AS cpf
FROM dados_sensiveis.clientes;
```

### Passo 3: Gerenciar Permissões de Acesso

```sql
-- Conceder acesso à View pública para o usuário de dev
GRANT USAGE ON SCHEMA public TO dev_user;
GRANT SELECT ON public.clientes TO dev_user;

-- Bloquear acesso direto ao schema restrito
REVOKE ALL ON SCHEMA dados_sensiveis FROM dev_user;
```

Com essa estrutura, quando o `dev_user` fizer uma consulta a `public.clientes`, ele acessará a *view* com as regras de ofuscação pré-processadas, sem acesso direto à tabela `dados_sensiveis.clientes`.

---

## Cuidados e Boas Práticas de Segurança

1. **Vazamentos por inferência (*Side-Channel Attacks*):** Em abordagens nativas com *views*, consultas acompanhadas da cláusula `WHERE` podem vazar dados. Se um usuário fizer `SELECT * FROM clientes WHERE email = 'carlos.silva@example.com'` e a consulta retornar uma linha mascarada, ele saberá que aquele e-mail existe na base. A extensão `PostgreSQL Anonymizer` possui mecanismos de proteção mais eficientes contra esse tipo de inferência.
2. **Impacto no desempenho:** O processamento de expressões regulares ou funções de hash em tempo de execução consome recursos de CPU. Em ambientes de homologação sujeitos a alta carga de testes, monitore a utilização do servidor.
3. **Isolamento de backups:** O mascaramento dinâmico não altera os dados gravados em disco. Se um utilitário como o `pg_dump` for executado com credenciais administrativas, o arquivo gerado conterá as informações reais. Para disponibilizar *dumps* a terceiros, utilize técnicas de mascaramento estático antes do export.

---

## Conclusão

O mascaramento dinâmico de dados no PostgreSQL garante a privacidade dos titulares e a conformidade regulatória sem interromper a rotina das equipes de desenvolvimento e testes. A escolha entre a extensão `PostgreSQL Anonymizer` ou uma solução baseada em *views* nativas depende das restrições de infraestrutura do provedor e do nível de complexidade exigido pelas políticas de segurança da organização.
