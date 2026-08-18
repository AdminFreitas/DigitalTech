---
title: "Padrão Circuit Breaker em Microsserviços: Guia Prático"
slug: "implementando-o-padrao-circuit-breaker-em-microsservicos-para-evitar-falhas-em-c"
category: "Engenharia de Software"
description: "Entenda como o padrão Circuit Breaker previne falhas em cascata em microsserviços e conheça os estados Closed, Open e Half-Open."
date: "2026-08-18 07:45:00.711621"
readTime: "3"
image: "https://images.unsplash.com/photo-1675263943038-286c7fd18eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MTB8fEltcGxlbWVudGFuZG8lMjBwYWRyJUMzJUEzbyUyMENpcmN1aXQlMjBCcmVha2VyJTIwbWljcm9zc2VydmklQzMlQTdvc3xlbnwwfDB8fHwxNzg3MDM5MDU1fDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Padrão Circuit Breaker em Microsserviços: Guia Prático"
imageAuthor: "hybridnighthawk"
---

# Implementando o padrão Circuit Breaker em microsserviços para evitar falhas em cascata

## Introdução

Em arquiteturas de microsserviços, uma falha em um único serviço pode rapidamente se propagar para outros componentes, causando um efeito dominó conhecido como *falha em cascata*. O padrão **Circuit Breaker** é uma solução para mitigar esse risco, isolando falhas e permitindo que o sistema se recupere de maneira controlada.

Neste artigo, vamos explorar:
- O que é o padrão Circuit Breaker e como ele funciona
- Quando e por que aplicá-lo em microsserviços
- Como implementá-lo na prática, com exemplos em código
- Melhores práticas e armadilhas comuns

---

## O que é o padrão Circuit Breaker?

O Circuit Breaker (ou *disjuntor*, em português) é um padrão de projeto inspirado em sistemas elétricos, nos quais um disjuntor interrompe a corrente em caso de sobrecarga para evitar danos maiores. Na computação, ele atua como um intermediário entre um cliente e um serviço, monitorando chamadas e "abrindo o circuito" quando detecta falhas recorrentes.

### Estados do Circuit Breaker

O padrão opera em três estados principais:

1. **Closed (Fechado)**: O sistema está operando normalmente. As chamadas são permitidas e os erros são contabilizados.
2. **Open (Aberto)**: O sistema detectou falhas suficientes e interrompe temporariamente as chamadas para evitar o agravamento do problema.
3. **Half-Open (Meio-Aberto)**: Um teste é realizado para verificar se o serviço se recuperou. Se for bem-sucedido, o circuito volta ao estado *Closed*; caso contrário, retorna ao estado *Open*.

---

## Por que usar Circuit Breaker em microsserviços?

Em sistemas distribuídos, os seguintes cenários justificam o uso desse padrão:

- **Dependência instável**: Um microsserviço A depende de B, que ocasionalmente falha ou responde com lentidão.
- **Tempo limite (*timeout*)**: O serviço B não responde dentro do tempo esperado, travando a thread do cliente.
- **Sobrecarga de recursos**: O serviço B consome muita memória ou CPU, afetando outros processos.
- **Resiliência**: Deseja-se que o sistema degrade graciosamente (*graceful degradation*) mesmo quando dependências falham.

### Exemplo prático

Imagine um e-commerce com os seguintes microsserviços:
- **Serviço de Pagamento**: Processa transações (depende do **Serviço de Notificação** para enviar recibos).
- **Serviço de Notificação**: Envia e-mails e SMS (depende de um provedor externo de e-mail).

Se o provedor de e-mail falhar:
- **Sem Circuit Breaker**: O **Serviço de Pagamento** fica aguardando resposta, bloqueando recursos do sistema.
- **Com Circuit Breaker**: O **Serviço de Notificação** abre o circuito e retorna um erro rápido ao **Serviço de Pagamento**, que pode:
  - Usar uma fila de mensagens temporária.
  - Retornar uma mensagem de erro amigável ao usuário.
  - Tentar novamente mais tarde.

---

## Como implementar o Circuit Breaker

### 1. Escolha de uma biblioteca ou implementação própria

Você pode implementar o padrão do zero ou utilizar bibliotecas consolidadas. Algumas opções populares são:

- **Java**: Resilience4j, Hystrix (em manutenção)
- **Python**: PyBreaker, CircuitBreaker
- **JavaScript/Node.js**: Opossum, async-retry
- **.NET**: Polly

Para este exemplo, usaremos a biblioteca **Resilience4j** em Java, devido à sua simplicidade e flexibilidade.

### 2. Configuração básica

Primeiro, adicione a dependência no seu `pom.xml` (Maven) ou `build.gradle` (Gradle):

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-circuitbreaker</artifactId>
    <version>2.1.0</version>
</dependency>
```

### 3. Criando um Circuit Breaker

Aqui está um exemplo de configuração em Java:

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;

public class CircuitBreakerExample {
    
    public static void main(String[] args) {
        // Configura o Circuit Breaker
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50) // Percentual de falhas para abrir o circuito
            .waitDurationInOpenState(Duration.ofMillis(1000)) // Tempo em estado aberto
            .permittedNumberOfCallsInHalfOpenState(3) // Tentativas no estado meio-aberto
            .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
            .slidingWindowSize(5) // Número de chamadas para calcular a taxa de falhas
            .build();
        
        CircuitBreaker circuitBreaker = CircuitBreaker.of("notificacaoService", config);
        
        // Usando o Circuit Breaker
        String response = circuitBreaker.executeSupplier(() -> {
            return enviarNotificacao("Pedido #12345");
        });
        
        System.out.println("Resposta: " + response);
    }
    
    private static String enviarNotificacao(String mensagem) {
        // Simula uma chamada a um serviço externo
        if (Math.random() > 0.7) {
            throw new RuntimeException("Serviço de notificação indisponível");
        }
        return "Notificação enviada: " + mensagem;
    }
}
```
