---
title: "Padrão Expand and Contract: Migrações sem Downtime"
slug: "padrao-expand-and-contract-como-alterar-bancos-de-dados-em-producao-sem-downtime"
category: "Engenharia de Software"
description: "Aprenda a aplicar o padrão Expand and Contract em migrações de banco de dados para evitar tempo de inatividade e erros em ambientes de produção."
date: "2026-08-18 17:55:17.065373"
readTime: "5"
image: "https://images.unsplash.com/photo-1636247499180-13285c86be9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NHx8UGFkciVDMyVBM28lMjBFeHBhbmQlMjBhbmQlMjBDb250cmFjdCUyMEFsdGVyYXJ8ZW58MHwwfHx8MTc4NzA3NTY4OHww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Padrão Expand and Contract: Migrações sem Downtime"
imageAuthor: "MK +2"
---

# Padrão Expand and Contract: Como Alterar Bancos de Dados em Produção sem Downtime

Manter uma aplicação disponível 24 horas por dia, 7 dias por semana, é um dos principais desafios da engenharia de software moderna. Em arquiteturas de implantação contínua (*Continuous Deployment*), o código da aplicação é atualizado frequentemente. No entanto, alterar o esquema do banco de dados (*Database Schema Migrations*) enquanto o sistema recebe tráfego real continua sendo uma operação delicada.

Uma alteração direta — como remover uma coluna usada pelo código antigo ou alterar o tipo de um dado — frequentemente causa erros de execução, falhas de sincronia no deploy ou travamentos prolongados de tabelas (*table locks*).

Para resolver esse problema de compatibilidade entre o código da aplicação e a estrutura do banco de dados, utiliza-se o padrão **Expand and Contract** (também conhecido como *Parallel Change*).

---

## O Problema das Migrações Tradicionais

Em um fluxo tradicional, que não garante tempo de inatividade zero (*zero-downtime*), uma alteração de banco de dados costuma seguir estes passos:

1. O desenvolvedor escreve uma migração SQL para renomear uma coluna.
2. A migração é executada no banco de dados de produção.
3. O novo código da aplicação é implantado.

No intervalo de tempo entre o passo 2 e o passo 3, qualquer instância da aplicação em execução tentará acessar a coluna antiga que acabou de ser renomeada ou removida. O resultado é uma onda de erros 500 para os usuários.

Inverter a ordem (fazer o deploy do código antes da migração) causa o mesmo problema: o novo código tentará acessar uma coluna que ainda não existe no banco de dados.

---

## O que é o Padrão Expand and Contract?

O padrão **Expand and Contract** divide uma alteração incompatível (*breaking change*) em etapas incrementais e compatíveis com versões anteriores (*backwards-compatible*).

A estratégia consiste em dividir a migração em três fases principais:

1. **Expand (Expansão):** O banco de dados e a aplicação são expandidos para suportar tanto a estrutura antiga quanto a nova simultaneamente.
2. **Transition (Transição/Migração de Dados):** O tráfego gradualmente passa a utilizar a nova estrutura, e os dados existentes são migrados em segundo plano.
3. **Contract (Contração):** A estrutura antiga e os trechos de código obsoletos são removidos do sistema com segurança.

[IMAGEM]
tipo: diagrama
assunto: Fluxo do padrão Expand and Contract demonstrando as fases de Expansão, Transição e Contração no banco de dados e na aplicação
motivo: Ajuda o leitor a visualizar a coexistência temporária de estruturas antigas e novas durante a implantação sem downtime
[/IMAGEM]

---

## Passo a Passo Prático: Renomeando uma Coluna em Produção

Para ilustrar o padrão, considere um caso real: uma tabela chamada `users` possui a coluna `phone`, e a equipe decidiu renomeá-la para `contact_phone` para padronizar a nomenclatura do sistema.

### Fase 1: Expansão (Expand)

Nesta fase, a nova coluna é adicionada sem remover a antiga. O banco de dados passa a ter as duas estruturas.

**1. Executar a migração SQL no banco de dados:**

```sql
ALTER TABLE users ADD COLUMN contact_phone VARCHAR(20);
```

**2. Atualizar a aplicação para Escrita Dupla (Dual-Write):**

O código da aplicação é modificado para gravar dados em ambos os campos, mas continuar lendo do campo antigo.

```python
def update_user_phone(user_id, phone_number):
    # Escreve na coluna antiga e na nova
    db.execute(
        "UPDATE users SET phone = %s, contact_phone = %s WHERE id = %s",
        (phone_number, phone_number, user_id)
    )

def get_user_phone(user_id):
    # Continua lendo da coluna antiga
    result = db.query("SELECT phone FROM users WHERE id = %s", (user_id,))
    return result['phone']
```

Neste momento, novos registros ou atualizações preenchem ambas as colunas. A aplicação permanece estável caso precise passar por um *rollback* de código.

---

### Fase 2: Transição e Backfill

Agora que os novos registros alimentam ambos os campos, é necessário copiar os dados dos registros antigos criados antes da fase de expansão.

**1. Migração de dados históricos (Backfill):**

Um *script* de migração roda em segundo plano para copiar os dados de `phone` para `contact_phone` nos registros em que `contact_phone` ainda é nulo. Essa operação deve ser feita em lotes (*batches*) para não sobrecarregar o banco de dados.

```sql
-- Exemplo de atualização em lote
UPDATE users 
SET contact_phone = phone 
WHERE contact_phone IS NULL AND phone IS NOT NULL 
LIMIT 1000;
```

**2. Alternar a Leitura na Aplicação:**

Após o término do *backfill*, o código é atualizado para ler da nova coluna (`contact_phone`).

```python
def get_user_phone(user_id):
    # Agora lê da nova coluna
    result = db.query("SELECT contact_phone FROM users WHERE id = %s", (user_id,))
    return result['contact_phone']
```

Neste ponto, a aplicação lê e escreve na nova coluna, mas ainda mantém a escrita na coluna antiga por segurança.

---

### Fase 3: Contração (Contract)

Com a certeza de que a nova coluna está populada, sendo lida e atualizada corretamente, a estrutura antiga pode ser removida.

**1. Remover a escrita dupla na aplicação:**

Atualize o código para interagir apenas com a coluna `contact_phone`.

```python
def update_user_phone(user_id, phone_number):
    # Escreve apenas na nova coluna
    db.execute(
        "UPDATE users SET contact_phone = %s WHERE id = %s",
        (phone_number, user_id)
    )
```

Faça o deploy dessa alteração e monitore a aplicação.

**2. Remover a coluna antiga do banco de dados:**

Após confirmar que nenhuma instância do código antigo está em execução, execute a limpeza final no banco de dados.

```sql
ALTER TABLE users DROP COLUMN phone;
```

---

## Boas Práticas e Cuidados Importantes

* **Execução em Lotes (*Batching*):** Ao realizar o *backfill* de milhões de linhas, evite executar um único `UPDATE` global. Isso pode travar a tabela ou esgotar a memória do servidor. Mantenha as atualizações em blocos pequenos (ex.: 1.000 a 5.000 linhas por vez).
* **Uso de Triggers (Alternativa de Infraestrutura):** Se a lógica de escrita dupla na aplicação for complexa de implementar, é possível usar *triggers* no próprio banco de dados para sincronizar os dados entre as colunas durante a fase de transição.
* **Feature Flags:** Utilize sinalizadores de funcionalidade (*feature flags*) para alternar a leitura da coluna antiga para a nova em tempo de execução, permitindo reverter instantaneamente caso ocorra algum problema.
* **Validação de Implantação:** Certifique-se de que todas as instâncias da aplicação (incluindo processadores em segundo plano, como *queues* e *cron jobs*) foram atualizadas antes de avançar para a etapa de contração.

## Conclusão

O padrão Expand and Contract substitui grandes migrações arriscadas por uma série de pequenas alterações seguras e reversíveis. Embora exija mais etapas no processo de desenvolvimento e implantação, é a técnica padrão da indústria para garantir alta disponibilidade e eliminar janelas de manutenção em sistemas críticos.
