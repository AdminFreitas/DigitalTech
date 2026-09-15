---
title: "Idempotência em APIs REST: Como Evitar Processamento Duplicado"
slug: "como-implementar-idempotencia-em-apis-rest-para-evitar-processamento-duplicado-e"
category: "Engenharia de Software"
description: "Entenda o conceito de idempotência em APIs REST e aprenda a usar o padrão Idempotency Key para prevenir requisições duplicadas em sistemas distribuídos."
date: "2026-09-15 14:03:16.930629+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/213808/pexels-photo-213808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Idempotência em APIs REST: Como Evitar Processamento Duplicado"
imageAuthor: "Photo Collections"
---

# Como Implementar Idempotência em APIs REST para Evitar Processamento Duplicado em Sistemas Distribuídos

Em arquiteturas de sistemas distribuídos, a comunicação entre serviços ocorre por meio de redes sujeitas a instabilidades, altas latências e perdas de pacotes. Nesse cenário, uma das falhas mais comuns ocorre quando um cliente envia uma requisição HTTP, o servidor a processa com sucesso, mas a resposta de confirmação se perde no caminho de volta devido a uma oscilação na rede.

Sem saber se a operação foi executada, a aplicação cliente geralmente reenvia a requisição (*retry*). Se a API não estiver preparada para tratar essa duplicação, ações destrutivas ou indesejadas podem ocorrer, como a cobrança dupla no cartão de crédito de um usuário ou a geração duplicada de um pedido de compra.

A solução técnica para esse problema é a **idempotência**.

## O que é Idempotência e por que ela é Fundamental?

Na engenharia de software, uma operação é considerada idempotente quando a sua execução múltipla produz exatamente o mesmo resultado do que uma única execução. Ou seja: `f(x) = f(f(x))`.

No contexto do protocolo HTTP, o método e o comportamento esperado definem a idempotência nativa das rotas:

* **Idempotentes por especificação:** `GET`, `PUT`, `DELETE`, `HEAD` e `OPTIONS`. Buscar um recurso (`GET`) ou substituí-lo inteiramente (`PUT`) dez vezes seguidas deve deixar o sistema no mesmo estado final do que executá-lo apenas uma vez.
* **Não idempotentes por especificação:** `POST` e `PATCH`. Criar um recurso (`POST`) dez vezes seguidas resultará na criação de dez registros distintos no banco de dados, a menos que uma estratégia adicional seja implementada.

Para tornar endpoints do tipo `POST` seguros contra reenvios acidentais, utiliza-se o padrão de **Chave de Idempotência** (*Idempotency Key*).

## Como Funciona o Padrão Idempotency Key

O mecanismo baseia-se no envio de um identificador único para cada intenção de operação. Se o cliente precisar tentar novamente o envio devido a um erro de rede, ele envia exatamente o mesmo identificador.

O fluxo de execução segue estes passos:

1. **Geração da Chave:** O cliente gera um identificador único universal (UUID v4) antes de disparar a requisição HTTP.
2. **Envio no Header:** A chave é enviada em um cabeçalho customizado na requisição, como `Idempotency-Key` ou `X-Idempotency-Key`.
3. **Verificação no Backend:** O servidor intercepta a requisição antes de processar a regra de negócio e verifica em um armazenamento temporário rápido (como o Redis) se aquela chave já foi processada.
4. **Decisão:**
   * **Se for uma chave nova:** O backend registra o início do processamento, executa a regra de negócio, salva a resposta final no cache associada à chave e retorna o resultado ao cliente.
   * **Se a chave já existir no cache:** O backend ignora a execução da regra de negócio e retorna imediatamente a resposta gravada no cache (mesmo código HTTP e corpo JSON).
   * **Se a chave estiver em processamento ativo:** O backend retorna um erro de conflito ou concorrência (como HTTP 409 Conflict ou HTTP 425 Too Early).

[IMAGEM]
tipo: diagrama
assunto: Fluxo de decisão de uma requisição HTTP utilizando chave de idempotência com validação em cache Redis.
motivo: Auxilia na visualização do caminho percorrido por requisições inéditas versus requisições duplicadas na camada de middleware.
[/IMAGEM]

## Arquitetura de Implementação com Redis

O **Redis** é a escolha padrão para armazenar estados de idempotência devido à sua operação em memória de baixíssima latência e ao suporte nativo a operações atômicas e tempo de expiração (*TTL - Time To Live*).

### Estrutura do Dado no Redis

A chave armazenada deve conter informações essenciais sobre a execução original. Uma estrutura JSON comum armazenada sob o identificador `idempotency:{key}` possui a seguinte forma:

* **Status:** `IN_PROGRESS` ou `COMPLETED`
* **HTTP Response Code:** Ex: `201 Created` ou `200 OK`
* **Response Body:** O payload JSON original retornado pela aplicação.
* **Payload Hash:** O hash (ex: SHA-256) do corpo da requisição enviada.

### Importância da Validação do Payload Hash

Um erro grave de implementação é aceitar a mesma chave de idempotência para requisições com dados totalmente diferentes. Se um cliente enviar uma `Idempotency-Key` para criar um pedido de $10 e, por falha de código, reusar a mesma chave para um pedido de $500, o sistema jamais deve retornar a resposta do pedido antigo sem validar o conteúdo.

Se a chave for igual, mas o Hash do payload for diferente, a API deve rejeitar a requisição com o código `HTTP 400 Bad Request` indicando inconsistência na chave.

## Exemplo Prático de Middleware (Node.js/Express)

Abaixo está um exemplo conceitual de como implementar a idempotência através de um middleware em Node.js utilizando Redis.

```javascript
const redis = require('./redisClient');
const crypto = require('crypto');

async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];

  // Se não houver chave de idempotência, prossegue normalmente (ou rejeita, dependendo da política da API)
  if (!idempotencyKey) {
    return next();
  }

  const bodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');
  const redisKey = `idempotency:${idempotencyKey}`;

  try {
    // Tenta obter o estado da requisição no Redis
    const cachedData = await redis.get(redisKey);

    if (cachedData) {
      const record = JSON.parse(cachedData);

      // Valida se o payload enviado é o mesmo do registro original
      if (record.bodyHash!== bodyHash) {
        return res.status(400).json({
          error: 'MismatchedPayload',
          message: 'A chave de idempotência fornecida já foi utilizada com um payload diferente.'
        });
      }

      // Se ainda estiver sendo processada por outra thread/instância
      if (record.status === 'IN_PROGRESS') {
        return res.status(409).json({
          error: 'ConcurrentRequest',
          message: 'Uma requisição com esta chave já está em processamento.'
        });
      }

      // Caso o processamento já tenha sido concluído, reenvia a resposta salva
      return res.status(record.statusCode).json(record.body);
    }

    // Tenta registrar a chave como IN_PROGRESS atomicamente usando SETNX (Set if Not Exists)
    const lockAcquired = await redis.set(
      redisKey,
      JSON.stringify({ status: 'IN_PROGRESS', bodyHash }),
      'NX',
      'EX',
      60 // Trava temporária de 60 segundos contra concorrência
    );

    if (!lockAcquired) {
      return res.status(409).json({
        error: 'ConcurrentRequest',
        message: 'Processamento concorrente detectado.'
      });
    }

    // Intercepta a resposta da API para salvar o resultado final no Redis
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const statusCode = res.statusCode;

      // Apenas salva em cache se o resultado for de sucesso (2xx)
      if (statusCode >= 200 && statusCode < 300) {
        const recordToSave = {
          status: 'COMPLETED',
          statusCode,
          bodyHash,
          body
        };
        // Define o tempo de vida (TTL) da resposta idêntica (ex: 24 horas)
        redis.set(redisKey, JSON.stringify(recordToSave), 'EX', 86400);
      } else {
        // Se deu erro interno (5xx), remove a chave para permitir novas tentativas reais
        redis.del(redisKey);
      }

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de idempotência:', error);
    next(error);
  }
}

module.exports = idempotencyMiddleware;
```

## Boas Práticas e C
