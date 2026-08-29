---
title: "Idempotência em APIs REST: Evite Requisições Duplicadas"
slug: "como-implementar-idempotencia-em-apis-rest-para-evitar-requisicoes-duplicadas"
category: "Engenharia de Software"
description: "Entenda o conceito de idempotência em APIs REST, aprenda a tratar métodos HTTP e previna requisições duplicadas em sistemas distribuídos com Redis."
date: "2026-08-29 19:35:14.559529+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/23177122/pexels-photo-23177122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Idempotência em APIs REST: Evite Requisições Duplicadas"
imageAuthor: "Erik Karits"
---

# Como Implementar Idempotência em APIs REST para Evitar Requisições Duplicadas

Em sistemas distribuídos, falhas de rede, *timeouts* e retentativas automáticas são inevitáveis. Quando um cliente envia uma requisição para criar um pagamento ou gerar um pedido e não recebe resposta devido a uma oscilação na conexão, a reação padrão do cliente (ou de uma rotina automatizada de *retry*) é reenviar a requisição.

Sem os devidos cuidados na camada de arquitetura, essa retentativa pode resultar no processamento duplicado da mesma operação — cobranças efetuadas duas vezes, estoques atualizados incorretamente ou registros duplicados no banco de dados. A **idempotência** é a propriedade que garante que executar uma mesma operação múltiplas vezes gere o mesmo efeito no sistema que executá-la apenas uma única vez.

---

## Idempotência no protocolo HTTP

O próprio protocolo HTTP define a semântica de idempotência para seus métodos padrão:

- **Idempotentes por natureza:** `GET`, `HEAD`, `PUT`, `DELETE`, `OPTIONS` e `TRACE`. Executar um `PUT` atualizando um recurso com os mesmos dados dez vezes gera o mesmo estado final no servidor que executá-lo uma vez.
- **Não idempotentes por natureza:** `POST` e `PATCH`. Por padrão, cada requisição `POST` submetida pressupõe a criação de um novo recurso ou o disparo de um novo efeito colateral.

O desafio prático surge quando precisamos processar operações não idempotentes (geralmente mapeadas via `POST`, como `/v1/payments` ou `/v1/orders`) garantindo que reprocessamentos acidentais sejam neutralizados.

---

## A arquitetura da Chave de Idempotência (*Idempotency Key*)

A abordagem padrão da indústria para solucionar esse problema envolve o uso de um cabeçalho customizado na requisição HTTP, comumente chamado de `Idempotency-Key` ou `X-Idempotency-Key`.

O fluxo funciona da seguinte forma:

1. O cliente gera um identificador único universal (UUID v4) para a operação que deseja realizar.
2. O cliente envia a requisição contendo o cabeçalho `Idempotency-Key: <UUID>`.
3. A API intercepta a requisição e verifica se aquela chave já foi processada anteriormente em um armazenamento de resposta rápida (como o Redis).
4. Se a chave for nova, a API bloqueia a chave, executa o processamento, salva o resultado (status HTTP e *payload*) associado à chave e retorna a resposta ao cliente.
5. Se a chave já existir e o processamento tiver sido concluído, a API retorna imediatamente a resposta armazenada anteriormente, sem reexecutar a lógica de negócio.

---

## Passo a Passo para Implementação Prática

Para implementar esse padrão com eficiência e segurança em um ambiente distribuído, siga as etapas abaixo.

### 1. Definição do armazenamento de estado
Use um banco de dados em memória de alta performance com suporte a bloqueio (*locking*) e tempo de expiração (TTL), como o **Redis**. O tempo de expiração da chave deve cobrir a janela razoável de retentativas do sistema (geralmente entre 24 e 72 horas).

### 2. Controle de concorrência e estados da chave
Uma chave de idempotência pode estar em três estados possíveis no armazenamento:

- **Não existente:** A requisição nunca foi vista.
- **Em processamento (*Processing*):** A requisição está sendo executada no momento.
- **Concluída (*Completed*):** A requisição foi finalizada e sua resposta está armazenada.

Se uma requisição chegar com uma chave que está no estado `Em processamento`, a API deve retornar um código como `409 Conflict` ou `425 Too Early`, indicando ao cliente que a operação original ainda está em andamento para evitar condições de corrida (*race conditions*).

### 3. Validação do *payload* (*Payload Hashing*)
Um problema comum ocorre quando um cliente reutiliza a mesma `Idempotency-Key` para enviar dados totalmente diferentes. Para evitar fraudes ou erros de integração, calcule um *hash* (como SHA-256) do corpo da requisição e armazene-o junto à chave.

Se a requisição reutilizar a chave, mas apresentar um *hash* diferente, a API deve rejeitar a chamada com erro `400 Bad Request`.

---

## Exemplo de Implementação (Pseudocódigo / Python)

O código a seguir exemplifica a lógica de um *middleware* ou decorador em uma API utilizando Redis para gerenciamento de estado:

```python
import hashlib
import json
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def processar_requisicao_idempotente(idempotency_key, payload, logica_de_negocio):
    # 1. Validação da presença da chave
    if not idempotency_key:
        return {"status": 400, "body": {"error": "Idempotency-Key ausente"}}

    # 2. Gerar hash do payload para validação de integridade
    payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    
    redis_key = f"idempotency:{idempotency_key}"
    
    # 3. Tentar adquirir lock / registrar início de processamento
    # SETNX define o valor apenas se a chave não existir
    lock_adquirido = redis_client.set(
        f"lock:{redis_key}", "LOCKED", nx=True, ex=30
    )
    
    if not lock_adquirido:
        return {"status": 409, "body": {"error": "Requisição em processamento concorrente"}}

    try:
        # 4. Verificar se a chave já possui resposta armazenada
        dados_salvos = redis_client.get(redis_key)
        
        if dados_salvos:
            registro = json.loads(dados_salvos)
            # Validar se o payload é exatamente o mesmo
            if registro["payload_hash"] != payload_hash:
                return {"status": 400, "body": {"error": "Conflito de payload para a mesma Idempotency-Key"}}
            
            # Retorna a resposta salva anteriormente sem reexecutar a lógica
            return {"status": registro["status_code"], "body": registro["response_body"]}

        # 5. Executar a lógica de negócio principal
        status_code, response_body = logica_de_negocio(payload)

        # 6. Salvar o resultado no cache com TTL de 24 horas (86400 segundos)
        registro_fim = {
            "payload_hash": payload_hash,
            "status_code": status_code,
            "response_body": response_body
        }
        redis_client.setex(redis_key, 86400, json.dumps(registro_fim))

        return {"status": status_code, "body": response_body}

    finally:
        # Libera o lock de concorrência
        redis_client.delete(f"lock:{redis_key}")
```

---

## Cuidados e Casos de Borda

- **Escopo por Usuário:** Armazene as chaves isoladas por autenticação/cliente (exemplo: `idempotency:<tenant_id>:<key>`). Caso contrário, um cliente pode acidentalmente invadir o espaço de chaves de outro.
- **Falhas de Infraestrutura Interna:** Se o banco de dados principal falhar durante a execução da lógica de negócio, a chave de idempotência **não** deve salvar uma resposta de sucesso. Trate exceções para garantir que a transação no Redis seja limpa caso o processamento falhe por erros internos (status `5xx`).
- **Tamanho dos Payloads:** Evite salvar respostas extremamente grandes no Redis. Armazene apenas os metadados necessários e o corpo resumido da resposta para preservar a memória do servidor de cache.

Implementar idempotência exige uma camada adicional de infraestrutura, mas é um requisito indispensável para garantir a consistência de dados e a resiliência em qualquer arquitetura moderna de software.
