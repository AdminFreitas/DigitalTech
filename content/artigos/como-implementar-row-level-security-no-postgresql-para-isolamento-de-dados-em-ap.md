---
title: "Row-Level Security no PostgreSQL: Isolar Dados Multitenant"
slug: "como-implementar-row-level-security-no-postgresql-para-isolamento-de-dados-em-ap"
category: "Banco de Dados"
description: "Aprenda a garantir o isolamento de dados em arquiteturas multitenant usando Row-Level Security (RLS) no PostgreSQL para filtrar consultas no banco."
date: "2026-10-21 20:26:37.865820+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1762340916350-ad5a3d620c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8aW1wbGVtZW50YXIlMjBSb3clMjBMZXZlbCUyMFNlY3VyaXR5JTIwUG9zdGdyZVNRTHxlbnwwfDB8fHwxNzkyNjE0Mzg2fDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Row-Level Security no PostgreSQL: Isolar Dados Multitenant"
imageAuthor: "Zulfugar Karimov"
---

# Como implementar Row-Level Security no PostgreSQL para isolamento de dados em aplicações multitenant

Em arquiteturas *multitenant* (múltiplos clientes compartilhando a mesma infraestrutura), a garantia de isolamento de dados é um dos requisitos mais críticos de segurança. Exibir acidentalmente informações de um cliente para outro pode causar incidentes graves de privacidade e conformidade.

Existem diferentes abordagens para separar dados em aplicações *multitenant*:

- **Banco de dados por tenant:** Máximo isolamento, porém com custo alto de infraestrutura e alta complexidade de manutenção.
- **Schema por tenant:** Isolamento intermediário, mas que apresenta problemas de escala quando o número de clientes cresce para centenas ou milhares.
- **Tabela compartilhada com coluna `tenant_id`:** Abordagem altamente eficiente e escalável, mas que exige cuidado extremo na camada de aplicação para nunca esquecer o filtro `WHERE tenant_id = X` em todas as consultas.

É exatamente no terceiro cenário que o **Row-Level Security (RLS)** do PostgreSQL se destaca. Com o RLS, a responsabilidade de filtrar os dados deixa de ser exclusivamente da aplicação e passa a ser imposta pelo próprio mecanismo do banco de dados.

[IMAGEM]
tipo: diagrama
assunto: Diagrama mostrando a camada de aplicação enviando consultas genéricas e o PostgreSQL aplicando filtros de Row-Level Security antes de retornar os dados
motivo: Ilustra visualmente como o RLS intercepta o acesso aos dados no nível do banco antes que eles cheguem ao usuário
[/IMAGEM]

## O que é Row-Level Security (RLS)?

O Row-Level Security é um recurso nativo do PostgreSQL (disponível a partir da versão 9.5) que permite definir políticas para restringir quais linhas de uma tabela podem ser lidas, inseridas, atualizadas ou excluídas com base no contexto do usuário ou em variáveis de sessão.

Sem o RLS, se um desenvolvedor esquecer de adicionar a cláusula `WHERE tenant_id = '...'` em uma consulta na API, todos os registros da tabela podem ser expostos. Com o RLS ativo, mesmo que a consulta seja `SELECT * FROM pedidos;`, o PostgreSQL retornará apenas as linhas pertencentes ao tenant associado à sessão atual.

---

## Passo a passo: Configurando RLS na prática

A seguir, veremos como construir uma solução de isolamento por tenant usando variáveis de sessão dinâmicas no PostgreSQL.

### 1. Criando a estrutura de tabelas

Primeiro, criamos a tabela de clientes (`tenants`) e a tabela de dados protegida (`pedidos`), que contém a referência ao tenant.

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    descricao TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL
);
```

### 2. Habilitando o RLS na tabela

Por padrão, o PostgreSQL não restringe o acesso por linha. É necessário habilitar explicitamente o RLS na tabela desejada:

```sql
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
```

Além disso, o proprietário da tabela (*owner*) e os superusuários ignoram as regras de RLS por padrão. Para garantir que a aplicação respeite a política mesmo utilizando o proprietário da tabela, execute:

```sql
ALTER TABLE pedidos FORCE ROW LEVEL SECURITY;
```

### 3. Criando a política de segurança (Policy)

A política de segurança define a condição lógica que determina se um registro está visível ou alterável. Usaremos a função `current_setting()` para ler uma variável de sessão personalizada (`app.current_tenant_id`) configurada no momento da conexão da aplicação.

```sql
CREATE POLICY tenant_isolation_policy ON pedidos
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
```

- **`FOR ALL`**: Aplica a política para comandos `SELECT`, `INSERT`, `UPDATE` e `DELETE`.
- **`USING`**: Define quais linhas são visíveis em consultas de leitura (`SELECT`) ou afetadas por `UPDATE`/`DELETE`.
- **`WITH CHECK`**: Garante que novos registros inseridos ou modificados também pertençam ao tenant ativo na sessão.
- **`current_setting('app.current_tenant_id', true)`**: O parâmetro `true` evita que o banco gere erro caso a variável ainda não tenha sido definida na sessão, retornando `NULL` de forma graciosa.

### 4. Testando a implementação

Para testar, criaremos dois tenants fictícios e inseriremos registros para cada um.

```sql
-- Inserindo dois tenants
INSERT INTO tenants (id, nome) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Empresa Alfa'),
  ('22222222-2222-2222-2222-222222222222', 'Empresa Beta');

-- Inserindo pedidos vinculados aos tenants
INSERT INTO pedidos (tenant_id, descricao, valor) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Servidor Cloud Alfa', 1500.00),
  ('22222222-2222-2222-2222-222222222222', 'Licença de Software Beta', 300.00);
```

Agora simulamos uma consulta definindo o contexto para a Empresa Alfa:

```sql
-- Define o contexto da sessão para o Tenant Alfa
SET LOCAL app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

-- Executa a consulta sem filtro explícito
SELECT * FROM pedidos;
```

**Resultado:** O PostgreSQL retornará apenas a linha do pedido da "Empresa Alfa". A linha da "Empresa Beta" fica completamente inacessível.

Se a aplicação tentar inserir um registro pertencente a outro tenant, diferente do definido na sessão:

```sql
-- Tentativa de inserir dados para o Tenant Beta com sessão do Tenant Alfa
INSERT INTO pedidos (tenant_id, descricao, valor)
VALUES ('22222222-2222-2222-2222-222222222222', 'Ataque de Injeção de Tenant', 0.00);
```

O PostgreSQL bloqueia a operação imediatamente, retornando um erro de violação de política de segurança.

---

## Integração com Pools de Conexão

Em aplicações modernas que utilizam pools de conexão (como PgBouncer ou HikariCP), as conexões são reutilizadas entre requisições. Para evitar vazamento de contexto entre clientes diferentes, siga o padrão de escopo por transação:

1. Ao receber a requisição HTTP, identifique o tenant autenticado.
2. Inicie uma transação (`BEGIN`).
3. Defina a variável de sessão com o comando `SET LOCAL` (o modificador `LOCAL` limita a variável exclusivamente à transação corrente):
   ```sql
   SET LOCAL app.current_tenant_id = 'id_do_tenant';
   ```
4. Execute as consultas da requisição.
5. Finalize a transação (`COMMIT` ou `ROLLBACK`). Ao encerrar a transação, a variável de sessão é limpa automaticamente pelo banco.

---

## Boas Práticas e Performance

- **Crie índices na coluna do tenant:** O RLS injeta uma cláusula de filtragem implícita em todas as operações. Garanta a presença de um índice B-Tree na coluna `tenant_id` para evitar varreduras completas (*seq scans*) na tabela.
- **Atenção com permissões de Superuser:** Contas com privilégio de `SUPERUSER` ou a flag `BYPASSRLS` ignoram as regras de RLS por padrão. Crie usuários específicos de aplicação sem privilégios administrativos.
- **Mantenha as regras simples:** Evite subconsultas complexas dentro das definições de `USING` ou `WITH CHECK`, pois elas serão executadas para cada linha avaliada, o que pode impactar o desempenho em tabelas volumosas.

## Conclusão

O Row-Level Security no PostgreSQL é uma solução robusta para implementar a estratégia de *Defense in Depth* em arquiteturas *multitenant*. Transferir a responsabilidade do isolamento de dados para o banco reduz drasticamente o risco de vazamentos decorrentes de erros humanos no código da aplicação.
