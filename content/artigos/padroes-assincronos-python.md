---
slug: padroes-assincronos-python
title: "Padrões assíncronos que todo back-end Python deveria usar"
category: Engenharia de Software
excerpt: "Do asyncio cru ao TaskGroup — o que finalmente virou idiomático em 2026."
date: 2026-06-22
readTime: 6 min
published: true
---
## Por que assíncrono importa no back-end

A maioria dos gargalos de uma API não é CPU — é espera. Espera por banco de dados, por serviços externos, por arquivos. Código síncrono desperdiça esse tempo. Código assíncrono aproveita.

Python tem suporte nativo a async/await desde a versão 3.5, mas o ecossistema demorou para amadurecer. Em 2026, finalmente temos padrões consolidados que vale conhecer e aplicar.

## 1. TaskGroup — a forma correta de paralelizar tarefas

Antes do Python 3.11, paralelizar tarefas assíncronas exigia `asyncio.gather()`, que tem um problema sério: se uma tarefa falha, as outras continuam rodando.

```python
# Padrão antigo — problemático
resultados = await asyncio.gather(
    buscar_usuario(id),
    buscar_pedidos(id),
    buscar_enderecos(id),
)
```

Com `TaskGroup`, introduzido no Python 3.11, o comportamento é correto por padrão: se uma tarefa falha, todas as outras são canceladas.

```python
# Padrão moderno — correto
async with asyncio.TaskGroup() as tg:
    t_usuario   = tg.create_task(buscar_usuario(id))
    t_pedidos   = tg.create_task(buscar_pedidos(id))
    t_enderecos = tg.create_task(buscar_enderecos(id))

usuario   = t_usuario.result()
pedidos   = t_pedidos.result()
enderecos = t_enderecos.result()
```

Use `TaskGroup` sempre que precisar rodar múltiplas corrotinas em paralelo.

## 2. Timeouts explícitos com asyncio.timeout()

Chamadas externas sem timeout são bombas-relógio. O Python 3.11 introduziu `asyncio.timeout()` como context manager.

```python
async def buscar_cep(cep: str) -> dict:
    async with asyncio.timeout(5.0):  # máximo 5 segundos
        async with httpx.AsyncClient() as client:
            resposta = await client.get(f"https://viacep.com.br/ws/{cep}/json/")
            return resposta.json()
```

Se o timeout estourar, uma `TimeoutError` é lançada — tratável, previsível.

## 3. Separar I/O de CPU

Uma armadilha comum: rodar operações pesadas de CPU dentro de funções async. Isso bloqueia o event loop e degrada toda a aplicação.

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor()

async def processar_imagem(caminho: str) -> str:
    loop = asyncio.get_running_loop()
    # Roda em processo separado — não bloqueia o event loop
    resultado = await loop.run_in_executor(executor, _processar_sync, caminho)
    return resultado

def _processar_sync(caminho: str) -> str:
    # Operação pesada de CPU aqui
    ...
```

A regra é simples: I/O → async nativo. CPU → ProcessPoolExecutor.

## 4. Conexões de banco com pool assíncrono

Com FastAPI e PostgreSQL, use `asyncpg` com pool de conexões. Criar uma conexão nova por requisição é lento e esgota recursos.

```python
# Na inicialização da aplicação
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=5,
    max_size=20,
)

# Em cada requisição
async def listar_usuarios():
    async with pool.acquire() as conn:
        return await conn.fetch("SELECT id, nome FROM usuarios")
```

## O que evitar

- **Misturar sync e async sem cuidado.** Chamar `requests` (síncrono) dentro de uma função `async` bloqueia o event loop. Use `httpx` com `async with httpx.AsyncClient()`.
- **`asyncio.sleep(0)` como gambiarra.** Se você precisar disso para "ceder controle", há um problema de design.
- **Ignorar cancelamento.** Tarefas assíncronas podem ser canceladas. Limpe recursos no bloco `finally`.

## Conclusão

Async em Python não é complexo quando os padrões certos são usados. `TaskGroup`, `asyncio.timeout()` e pool de conexões resolvem 90% dos casos reais de um back-end web.
