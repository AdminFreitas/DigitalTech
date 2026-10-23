---
title: "Idempotência em APIs REST: Prevenindo Requisições Duplicadas"
slug: "como-implementar-idempotencia-em-apis-rest-para-evitar-requisicoes-duplicadas-em"
category: "Engenharia de Software"
description: "Entenda o conceito de idempotência em APIs REST, a diferença entre métodos HTTP e como evitar requisições duplicadas em sistemas distribuídos usando Redis."
date: "2026-10-23 20:11:04.175030+00:00"
readTime: "7"
image: "https://images.pexels.com/photos/13730249/pexels-photo-13730249.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Idempotência em APIs REST: Prevenindo Requisições Duplicadas"
imageAuthor: "Francesco Ungaro"
---

# Como Implementar Idempotência em APIs REST para Evitar Requisições Duplicadas em Sistemas Distribuídos

Em arquiteturas de sistemas distribuídos, a instabilidade da rede é uma premissa que não pode ser ignorada. Timeouts, perda de pacotes e falhas temporárias de infraestrutura acontecem com frequência. Quando um cliente envia uma requisição para um serviço e a resposta é perdida no caminho de volta, a reação padrão de clientes HTTP, SDKs e sistemas de retentativa (*retries*) é retransmitir a mesma requisição.

Se o endpoint em questão for responsável por criar um pedido, transferir valores financeiros ou emitir uma nota fiscal, a execução duplicada pode gerar inconsistências severas e prejuízos operacionais. A solução para esse desafio é garantir a **idempotência** das requisições.

---

## O Conceito de Idempotência no Contexto HTTP

Em matemática e engenharia de software, uma operação é considerada idempotente quando sua aplicação múltipla produz exatamente o mesmo resultado que uma única aplicação. Ou seja, $f(f(x)) = f(x)$.

No protocolo HTTP, os métodos possuem semânticas bem definidas em relação à idempotência:

* **GET, HEAD, OPTIONS**: São considerados métodos seguros e idempotentes. Consultar um recurso múltiplas vezes não altera o estado do servidor.
* **PUT**: É idempotente. Substituir o estado completo de um recurso pelo mesmo payload $N$ vezes resulta no mesmo estado final.
* **DELETE**: É idempotente em termos de estado do servidor (o recurso continuará ausente), embora o código de status HTTP retornado possa mudar de `204 No Content` na primeira chamada para `404 Not Found` nas subsequentes.
* **POST**: **Não é idempotente por padrão**. Cada requisição `POST` processada pode criar um novo recurso ou disparar um novo efeito colateral.

Para tornar endpoints `POST` seguros contra duplicações acidentais, é necessário implementar um mecanismo explícito de idempotência no nível da aplicação.

[IMAGEM]
tipo: diagrama
assunto: Comparativo entre o comportamento de requisições POST normais e POST com camada de idempotência
motivo: Ajuda o leitor a compreender visualmente a diferença entre duplicar dados no banco de dados e reutilizar uma resposta já existente no cache
[/IMAGEM]

---

## Como Funciona a Solução por Chave de Idempotência

O padrão de mercado mais adotado para garantir a idempotência em APIs REST baseia-se no uso do cabeçalho HTTP personalizado `Idempotency-Key` (ou `X-Idempotency-Key`).

O funcionamento segue este ciclo:

1. **Geração da chave**: O cliente gera um identificador único universal (UUID v4) antes de enviar a requisição.
2. **Envio do cabeçalho**: O cliente inclui essa chave no cabeçalho `Idempotency-Key` da chamada HTTP.
3. **Verificação no servidor**: O servidor intercepta a requisição e verifica se aquela chave já foi processada anteriormente.
4. **Execução ou atalho**:
   * Se a chave for nova: a API executa a regra de negócio, salva a resposta final associada àquela chave e retorna o resultado ao cliente.
   * Se a chave já existir e tiver sido concluída: a API ignora o processamento do negócio e devolve diretamente a resposta armazenada anteriormente.
   * Se a chave já existir, mas ainda estiver em processamento: a API rejeita requisições concorrentes para evitar *race conditions*.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de sequencia entre Cliente, API Gateway, Redis e Banco de Dados durante o processamento com Idempotency Key
motivo: Ilustra a ordem cronologica exata das verificacoes de cache, travamento de chave e persistencia do resultado
[/IMAGEM]

---

## Passo a Passo para Implementar Idempotência

Abaixo está o fluxo detalhado para projetar um middleware de idempotência eficiente utilizando um banco de dados em memória do tipo chave-valor, como o Redis.

### Passo 1: Interceptação e Validação

Ao receber a requisição, verifique se o cabeçalho `Idempotency-Key` foi fornecido. Se o endpoint exigir idempotência e a chave não for enviada, responda imediatamente com HTTP `400 Bad Request`.

### Passo 2: Bloqueio Atômico (Lock Distribuído)

Antes de consultar o estado do processamento, tente adquirir uma trava atômica no Redis para a chave informada. Isso previne que duas requisições idênticas enviadas exatamente no mesmo milissegundo sejam processadas em paralelo.

* Use o comando Redis `SET chave valor NX PX milissegundos`.
* Se a operação falhar (a chave já existe e está marcada como `PROCESSING`), retorne HTTP `409 Conflict` ou `425 Too Early`.

### Passo 3: Verificação de Resposta Armazenada

Se a chave já existir com o status `COMPLETED`, recupere o corpo da resposta, o código HTTP e os cabeçalhos salvos no cache. Devolva essa resposta armazenada sem reexecutar controllers, serviços ou transações no banco de dados.

### Passo 4: Execução da Lógica de Negócio

Se a chave não existir, marque o estado inicial no Redis como `PROCESSING` com um tempo de vida útil (TTL) de segurança (por exemplo, 30 segundos) e prossiga com a execução normal do pipeline da aplicação (criação de registros, chamadas a gateways de pagamento, etc.).

### Passo 5: Persistência do Resultado e Liberação

Após o sucesso do processamento da lógica de negócio:

1. Armazene no Redis o status HTTP retornado e o payload da resposta.
2. Atualize o estado da chave para `COMPLETED`.
3. Defina um TTL razoável para o registro salvo (por exemplo, 24 ou 48 horas, dependendo do requisito do negócio).

---

## Exemplo Prático de Código (Node.js com Redis)

O exemplo a seguir ilustra a implementação de um middleware de idempotência simplificado em JavaScript/Node.js utilizando o cliente Redis.

```javascript
const redisClient = require('./redis-client');

async function idempotencyMiddleware(req, res, next) {
  // 1. Extrai a chave de idempotencia do cabecalho
  const idempotencyKey = req.headers['idempotency-key'];

  // Endpoints seguros (GET) nao precisam de controle de idempotencia por chave
  if (req.method === 'GET') {
    return next();
  }

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'O cabecalho Idempotency-Key e obrigatorio para esta operacao.' });
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    // 2. Tenta obter o registro existente no cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);

      if (parsedData.status === 'PROCESSING') {
        // Bloqueia requisicoes concorrentes simultaneas
        return res.status(409).json({ error: 'Uma requisicao identica esta em processamento. Tente novamente em instantes.' });
      }

      if (parsedData.status === 'COMPLETED') {
        // Retorna a resposta salva anteriormente
        return res.status(parsedData.statusCode).json(parsedData.body);
      }
    }

    // 3. Define a chave como PROCESSING com um TTL de protecao (ex: 30 segundos)
    const acquiredLock = await redisClient.set(cacheKey, JSON.stringify({ status: 'PROCESSING' }), {
      NX: true,
      EX: 30
    });

    if (!acquiredLock) {
      return res.status(409).json({ error: 'Conflito de concorrência detectado.' });
    }

    // 4. Intercepta a resposta da API para capturar o resultado final
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Apenas salva em cache se o status for de sucesso (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const responseToCache = {
          status: 'COMPLETED',
          statusCode: res.statusCode,
          body: body
        };

        // Salva a resposta final com TTL de 24 horas (86400 segundos)
        redisClient.set(cacheKey, JSON.stringify(responseToCache), { EX: 86400 });
      } else {
        // Em caso de erro de negocio, remove o lock para permitir novas tentativas
        redisClient.del(cacheKey);
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

---

## Cuidados e Tratamento de Casos Limite

Para garantir uma implementação robusta em ambiente de produção, considere os seguintes cenários:

### 1. Hash do Payload (Validação de Integridade)

Um erro comum de integração ocorre quando o cliente reutiliza a mesma `Idempotency-Key`, mas altera o corpo (*body*) da requisição. Para evitar que um payload diferente receba a resposta de um pedido anterior, calcule o hash SHA-256 do corpo da requisição e armazene-o junto com a chave.

Se a chave corresponder a um registro existente, mas o hash do payload for diferente, rejeite a chamada imediatamente com `422 Unprocessable Entity` ou `400 Bad Request`.

### 2. Tempo de Vida Útil (TTL) das Chaves

Chaves de idempotência não devem durar para sempre. Defina uma janela operacional adequada ao seu negócio. Para serviços financeiros ou e-commerce, retenções entre 24 e 72 horas costumam ser suficientes para cobrir os cenários de retransmissão de rede e reconciliação de sistemas.

### 3. Tracing e Logs

Sempre inclua a `Idempotency-Key` nos logs estruturados da sua aplicação e repasse esse dado para o sistema de rastreamento distribuído (*Distributed Tracing*, como OpenTelemetry). Isso simplifica a investigação de incidentes quando houver dúvidas sobre se determinado efeito foi executado uma ou duas vezes.

---

## Conclusão

A idempotência é uma propriedade fundamental para a construção de APIs REST resilientes em arquiteturas distribuídas. Ao adotar o padrão de chaves de idempotência combinadas a um cache distribuído de alto desempenho, sua aplicação estará protegida contra instabilidades de rede, retentativas desordenadas e duplicidades indesejadas de dados.
