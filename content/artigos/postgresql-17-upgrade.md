---
slug: postgresql-17-upgrade
title: "PostgreSQL 17: o que vale apertar o botão de upgrade"
category: Dados
excerpt: "Recursos novos que importam na operação e os que não importam."
date: 2026-06-20
readTime: 4 min
published: true
---
## Vale fazer o upgrade?

Direto ao ponto: sim. O PostgreSQL 17 trouxe melhorias reais de performance no VACUUM [processo de limpeza e recuperação de espaço], na execução de queries com subqueries e no processamento de JSON. Não é uma versão de transição — é uma versão para ficar.

## O que importa na prática

### VACUUM incremental

O VACUUM sempre foi um problema em tabelas grandes com muita escrita. Na versão 17, o processo foi reescrito para trabalhar em etapas, liberando locks mais cedo e causando menos impacto em produção.

Se você tem tabelas com mais de alguns milhões de linhas e sofria com bloat [inchaço — espaço ocupado por dados mortos], essa melhoria é direta e imediata.

### Subqueries mais rápidas

Queries com `IN (SELECT ...)` e correlacionadas em geral receberam otimizações no planner [planejador de consultas]. Em benchmarks com dados reais, queries complexas ficaram entre 20% e 40% mais rápidas sem nenhuma alteração no SQL.

Antes de otimizar manualmente uma query lenta, atualize e rode o `EXPLAIN ANALYZE` novamente.

### JSON com operadores novos

O tipo `jsonb` ganhou o operador `@?` para verificação de existência em caminhos e melhorias no `json_table()`, introduzido na versão 16 mas estabilizado aqui.

```sql
-- Verificar se um caminho existe no jsonb
SELECT * FROM eventos
WHERE dados @? '$.usuario.perfil.verificado';
```

### Melhorias no logical replication

O logical replication [replicação lógica] — usado para replicação seletiva entre bancos e para ferramentas como Debezium — ficou mais estável e com melhor suporte a DDL [comandos de definição de estrutura como CREATE e ALTER TABLE].

## O que não importa para a maioria

- **Melhorias no pg_dump paralelo:** relevante apenas para bancos muito grandes (centenas de GB).
- **Novos tipos de compressão:** interessante, mas o impacto depende muito do caso de uso.
- **Extensões de FDW [Foreign Data Wrapper]:** mudanças internas que não afetam quem não usa.

## Como fazer o upgrade com segurança

```bash
# 1. Fazer backup completo antes de qualquer coisa
pg_dump -Fc nome_do_banco > backup_antes_upgrade.dump

# 2. Verificar compatibilidade das extensões instaladas
SELECT name, default_version FROM pg_available_extensions
WHERE installed_version IS NOT NULL;

# 3. Usar pg_upgrade para migração in-place
pg_upgrade \
  -b /usr/lib/postgresql/16/bin \
  -B /usr/lib/postgresql/17/bin \
  -d /var/lib/postgresql/16/main \
  -D /var/lib/postgresql/17/main

# 4. Rodar ANALYZE após o upgrade
vacuumdb --all --analyze-only
```

## Checklist antes de apertar o botão

- [ ] Backup testado e restaurável
- [ ] Extensões compatíveis com a versão 17 verificadas
- [ ] Ambiente de homologação atualizado e testado primeiro
- [ ] Janela de manutenção planejada
- [ ] Rollback documentado (restaurar o backup + apontar a aplicação para a versão antiga)

## Conclusão

O PostgreSQL 17 é uma versão sólida com ganhos reais de performance. Para bancos em produção com carga moderada a alta, o upgrade vale o esforço — especialmente pela melhoria no VACUUM, que reduz problemas operacionais comuns.
