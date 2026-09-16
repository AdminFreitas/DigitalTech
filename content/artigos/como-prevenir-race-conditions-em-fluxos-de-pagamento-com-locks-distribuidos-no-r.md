---
title: "Como Evitar Race Conditions em Pagamentos com Redis"
slug: "como-prevenir-race-conditions-em-fluxos-de-pagamento-com-locks-distribuidos-no-r"
category: "Desenvolvimento Web"
description: "Aprenda a evitar cobranças duplicadas e falhas de concorrência em fluxos de pagamento utilizando locks distribuídos no Redis em arquiteturas escaláveis."
date: "2026-09-16 19:49:35.696914+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1754547035888-5d259792fb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MTB8fFByZXZlbmlyJTIwUmFjZSUyMENvbmRpdGlvbnMlMjBGbHV4b3MlMjBQYWdhbWVudG98ZW58MHwwfHx8MTc4OTU4ODE2M3ww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Evitar Race Conditions em Pagamentos com Redis"
imageAuthor: "Sunil Chandra Sharma"
---

# Como Prevenir Race Conditions em Fluxos de Pagamento com Locks Distribuídos no Redis

Em sistemas de e-commerce e gateways de pagamento, garantir a integridade das transações financeiras é um requisito crítico. Um dos problemas mais severos no desenvolvimento de software é a **race condition** (condição de corrida), que ocorre quando múltiplas requisições concorrentes tentam ler e alterar o mesmo estado do sistema no mesmo instante. Em fluxos de pagamento, isso pode provocar falhas graves, como cobranças duplicadas ou débito duplo no estoque.

A seguir, entenda como diagnosticar *race conditions* em aplicações web e como resolvê-las de forma robusta utilizando locks distribuídos no Redis.

## O Problema das Race Conditions em Pagamentos

Imagine um cenário em que um usuário clica duas vezes rapidamente no botão "Finalizar Compra", ou no qual um script envia duas requisições HTTP paralelas no mesmo milissegundo utilizando o identificador do mesmo carrinho de compras.

Se a aplicação estiver executando em múltiplos servidores (escalada horizontalmente), o seguinte fluxo pode ocorrer sem o devido controle de concorrência:

1. **Requisição A** chega ao Servidor 1 e lê o status do pedido no banco de dados ("Pendente").
2. **Requisição B** chega ao Servidor 2 e também lê o mesmo status ("Pendente").
3. **Requisição A** envia a cobrança para o gateway de pagamento e atualiza o status para "Pago".
4. **Requisição B** (que leu o status "Pendente" momentos antes) envia **outra** cobrança para o gateway e tenta atualizar o status novamente.

O resultado final é o cliente cobrado duas vezes pelo mesmo pedido.

## Por que Mutexes em Memória Local Não Resolvem?

Em arquiteturas executadas em um único processo, é comum utilizar travas de memória local (como o `Mutex` em Go, C# ou Java). Contudo, em arquiteturas modernas baseadas em microsserviços, contêineres ou múltiplos nós atrás de um balanceador de carga, a memória não é compartilhada entre os servidores.

Uma trava em memória criada no Servidor 1 não impede que o Servidor 2 execute o mesmo trecho de código. Por isso, torna-se necessário o uso de um **lock distribuído**: uma autoridade centralizada e rápida que gerencia quais processos têm permissão para executar uma seção crítica do código.

## Entendendo o Lock Distribuído com Redis

O Redis é amplamente utilizado para essa finalidade devido à sua velocidade de processamento em memória e por executar seus comandos de forma atômica em uma única thread por instância.

Para implementar um lock simples e eficaz no Redis, utiliza-se o comando `SET` com duas opções essenciais:

- **`NX`**: Define a chave apenas se ela ainda não existir no banco de dados.
- **`PX <milissegundos>`**: Define um tempo de expiração automático (TTL), garantindo que a trava seja liberada mesmo se a aplicação que a adquiriu sofrer uma falha inesperada.

### A Importância do Valor Único (Token)

Um erro comum é atribuir um valor fixo à chave do lock, como `SET lock:pedido:123 "true"`. Se o processamento do pagamento demorar mais do que o TTL configurado, o Redis apagará a chave automaticamente, permitindo que outra requisição adquira o lock. Quando a primeira requisição finalmente terminar, ela executará `DEL lock:pedido:123`, removendo inadvertidamente a trava da *segunda* requisição.

Para evitar esse comportamento, o valor armazenado no lock deve ser um identificador único (UUID). A liberação da trava só deve ocorrer se o valor armazenado na chave for exatamente igual ao UUID gerado no momento da aquisição.

## Passo a Passo da Implementação

Abaixo está a representação prática do ciclo de vida de um lock distribuído em uma aplicação Node.js usando a biblioteca `ioredis`.

### 1. Script Lua para Liberação Atômica

Como a verificação do token e a exclusão da chave precisam ocorrer como uma operação única e indivisível (atômica), utiliza-se um script Lua executado diretamente no servidor Redis:

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### 2. Código de Processamento do Pagamento

```javascript
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis();

// Script Lua para garantir liberação atômica
const RELEASE_LOCK_LUA = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

async function processarPagamento(pedidoId, valor) {
  const lockKey = `lock:pagamento:${pedidoId}`;
  const token = uuidv4();
  const ttlMs = 10000; // 10 segundos de limite para a operação

  // 1. Tenta adquirir o lock
  const acquired = await redis.set(lockKey, token, 'NX', 'PX', ttlMs);

  if (!acquired) {
    throw new Error('Um processamento para este pedido já está em andamento.');
  }

  try {
    // 2. Seção Crítica: Processamento da transação
    console.log(`Iniciando transação para o pedido ${pedidoId}...`);
    const resultado = await executarCobrançaNoGateway(pedidoId, valor);
    
    await atualizarStatusNoBanco(pedidoId, 'PAGO');
    return resultado;
  } finally {
    // 3. Libera o lock de forma segura
    await redis.eval(RELEASE_LOCK_LUA, 1, lockKey, token);
  }
}
```

## Boas Práticas e Estratégias Complementares

Embora os locks distribuídos reduzam os problemas de concorrência, eles devem integrar uma estratégia de defesa em camadas:

- **Ajuste do TTL**: Configure o tempo de vida do lock considerando a latência média da API de pagamento com uma margem de segurança adequada.
- **Chaves de Idempotência**: Envie um cabeçalho de idempotência para o gateway de pagamento. Caso o lock expire e uma segunda requisição seja enviada, o gateway reconhecerá a chave e não reprocessará a cobrança.
- **Tratamento de Erros de Concorrência**: Quando o lock não for adquirido, retorne uma resposta HTTP adequada ao cliente, como `409 Conflict` ou `429 Too Many Requests`, permitindo que a interface informe o usuário corretamente.
- **Algoritmo Redlock**: Para ambientes altamente disponíveis com Redis Cluster em múltiplos nós mestres independentes, avalie o uso do algoritmo Redlock para garantir consenso entre a maioria dos nós antes de confirmar a trava.

## Conclusão

A prevenção de *race conditions* em fluxos financeiros exige arquiteturas preparadas para concorrência em ambientes distribuídos. O uso de locks distribuídos no Redis, aliado a validações por token único e scripts atômicos em Lua, oferece uma solução eficiente, leve e escalável para proteger a integridade das transações.
