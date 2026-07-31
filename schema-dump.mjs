// schema-dump.mjs
// Extrai colunas + tipos + chaves primárias/estrangeiras do banco Neon
// Uso: node --env-file=.env schema-dump.mjs

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // 1. Colunas de todas as tabelas
  const colunas = await sql`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  // 2. Chaves primárias e estrangeiras
  const chaves = await sql`
    SELECT
      tc.table_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS tabela_referenciada,
      ccu.column_name AS coluna_referenciada
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.constraint_type = 'FOREIGN KEY'
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type
  `;

  // Agrupa colunas por tabela
  const porTabela = {};
  for (const c of colunas) {
    porTabela[c.table_name] ??= [];
    porTabela[c.table_name].push(c);
  }

  console.log('='.repeat(70));
  console.log('SCHEMA COMPLETO — public');
  console.log('='.repeat(70));

  for (const [tabela, cols] of Object.entries(porTabela)) {
    console.log(`\n### ${tabela}`);
    for (const c of cols) {
      const nulo = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : '';
      console.log(`  - ${c.column_name}: ${c.data_type} ${nulo}${def}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('CHAVES (PK / FK)');
  console.log('='.repeat(70));
  for (const k of chaves) {
    if (k.constraint_type === 'PRIMARY KEY') {
      console.log(`  [PK] ${k.table_name}.${k.column_name}`);
    } else if (k.constraint_type === 'FOREIGN KEY') {
      console.log(`  [FK] ${k.table_name}.${k.column_name} -> ${k.tabela_referenciada}.${k.coluna_referenciada}`);
    }
  }
}

main().catch(err => {
  console.error('Erro ao consultar o banco:', err);
  process.exit(1);
});
