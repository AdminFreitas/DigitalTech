---
title: "Como Implementar Cache Distribuído com Redis e Docker"
slug: "como-implementar-cache-distribuido-com-redis-e-docker-em-aplicacoes-escalaveis"
category: "Engenharia de Software"
description: "Aprenda a configurar cache distribuído com Redis e Docker para reduzir a latência e resolver gargalos no banco de dados em sistemas escaláveis."
date: "2026-10-11 15:13:27.633713+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/20034030/pexels-photo-20034030.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como Implementar Cache Distribuído com Redis e Docker"
imageAuthor: "Wolfgang Weiser"
---

# Como Implementar Cache Distribuído com Redis e Docker em Aplicações Escaláveis

Quando uma aplicação web cresce em volume de usuários e requisições, o banco de dados principal costuma se tornar o principal gargalo de infraestrutura. Consultas repetitivas a dados que mudam com pouca frequência consomem recursos valiosos de CPU, memória e I/O de disco.

Para resolver essa limitação, a adoção de uma camada de **cache distribuído** é uma das soluções mais eficientes da engenharia de software moderna. Neste artigo, abordaremos o funcionamento do Redis como cache centralizado e demonstraremos, passo a passo, como orquestrar esse ambiente utilizando Docker.

## Cache Local vs. Cache Distribuído

Em uma arquitetura monolítica ou simplificada, é comum utilizar cache em memória local (na própria aplicação). No entanto, quando precisamos escalar a aplicação horizontalmente adicionando múltiplas instâncias atrás de um balanceador de carga, o cache local traz problemas:

* **Inconsistência de dados**: Uma instância pode atualizar o cache enquanto as outras continuam servindo dados desatualizados.
* **Desperdício de memória**: Os mesmos dados são duplicados na RAM de cada servidor.
* **Invalidação complexa**: Limpar o cache exige notificar individualmente cada nó da aplicação.

O **cache distribuído** resolve esses problemas ao centralizar a camada de armazenamento temporário em um nó ou cluster independente, acessível de forma transparente por todas as instâncias da aplicação.

[IMAGEM]
tipo: diagrama
assunto: Comparação de arquitetura entre cache local e cache distribuído com Redis centralizado.
motivo: Explicar visualmente como o Redis centraliza o cache entre múltiplas instâncias da aplicação web.
[/IMAGEM]

## Por que Redis e Docker?

O **Redis** (Remote Dictionary Server) é um banco de dados em memória chave-valor de altíssima performance, capaz de responder a operações de leitura e escrita em sub-milissegundos. Ele oferece suporte a estruturas de dados ricas (strings, hashes, listas, conjuntos) e políticas configuráveis de descarte de memória.

O **Docker** simplifica a implantação e o gerenciamento desse ambiente. Ele isola a instância do Redis em um container configurável, garantindo que o comportamento no ambiente de desenvolvimento seja idêntico ao de produção.

## O Padrão Cache-Aside (Lazy Loading)

A estratégia de cache mais adotada para aplicações web é o padrão **Cache-Aside**:

1. A aplicação recebe a requisição de leitura.
2. Consulta o Redis buscando pela chave correspondente (**Cache Hit** se encontrar; retorne o dado imediatamente).
3. Se o dado não estiver no Redis (**Cache Miss**), a aplicação consulta o banco de dados principal.
4. A aplicação grava o resultado no Redis com um tempo de vida definido (TTL - *Time to Live*).
5. Retorna a resposta ao cliente.

## Passo a Passo da Implementação

Vamos construir um exemplo prático utilizando Docker Compose e uma aplicação em Node.js.

### 1. Definindo o ambiente com Docker Compose

Crie um arquivo chamado `docker-compose.yml`. Este arquivo orquestrará a aplicação e o serviço do Redis com limites claros de memória e política de eliminação.

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

> **Nota técnica:** A flag `--maxmemory-policy allkeys-lru` instrui o Redis a remover as chaves menos utilizadas recentemente (Least Recently Used) quando o limite de 256MB de RAM for atingido.

### 2. Implementando a lógica de cache na aplicação

Veja um exemplo prático utilizando o cliente `ioredis` e o framework `express`:

```javascript
const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Simulação de busca custosa no banco de dados
async function fetchProductFromDatabase(productId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: productId, name: 'Servidor Rack 1U', price: 12500.00 });
    }, 800); // 800ms de latência simulada
  });
}

app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const cacheKey = `product:${productId}`;

  try {
    // Tenta recuperar do Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    }

    // Se não encontrar (Cache Miss), busca no banco
    const product = await fetchProductFromDatabase(productId);

    // Armazena no Redis com TTL de 60 segundos
    await redis.set(cacheKey, JSON.stringify(product), 'EX', 60);

    return res.json({ source: 'database', data: product });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

### 3. Executando o projeto

Para subir a infraestrutura, execute o comando abaixo no terminal:

```bash
docker-compose up --build
```

Na primeira requisição para `http://localhost:3000/products/101`, o tempo de resposta será superior a 800 milissegundos. Nas requisições subsequentes, o tempo cairá para poucos milissegundos, servindo os dados diretamente da memória do Redis.

## Boas Práticas e Cuidados Importantes

* **Defina TTL para todas as chaves**: Evite deixar chaves sem expiração a menos que sejam estritamente necessárias. Isso previne o esgotamento desnecessário de memória.
* **Tratamento de falhas do Redis**: Sua aplicação deve continuar funcionando mesmo se a instância do Redis ficar indisponível. Trate exceções de conexão de modo que o sistema recorra ao banco de dados principal caso o cache falhe (mecanismo de *fallback*).
* **Evite Cache Stampede**: Quando muitas requisições simultâneas tentam buscar o mesmo dado expirado, todas farão consultas pesadas ao banco ao mesmo tempo. Use locks distribuídos ou pré-carregamento assíncrono para mitigar esse problema.
* **Alta Disponibilidade em Produção**: Em ambientes de produção críticos, considere usar o **Redis Sentinel** para *failover* automático ou o **Redis Cluster** para particionamento horizontal dos dados.

## Conclusão

A implementação de um cache distribuído com Redis e Docker melhora drasticamente a vazão (*throughput*) de aplicações web, reduz a latência percebida pelo usuário final e protege o banco de dados contra picos de acesso. Com poucas linhas de configuração de infraestrutura e aplicação, é possível transformar a capacidade de escala de um sistema.
