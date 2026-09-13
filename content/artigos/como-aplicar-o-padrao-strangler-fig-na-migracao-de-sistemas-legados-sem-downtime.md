---
title: "Padrão Strangler Fig: Migre Sistemas Legados sem Downtime"
slug: "como-aplicar-o-padrao-strangler-fig-na-migracao-de-sistemas-legados-sem-downtime"
category: "Engenharia de Software"
description: "Aprenda a aplicar o padrão Strangler Fig para migrar monolitos antigos para microsserviços de forma gradual e segura, garantindo zero downtime."
date: "2026-09-13 19:07:42.570530+00:00"
readTime: "3"
image: "https://images.pexels.com/photos/19627762/pexels-photo-19627762.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Padrão Strangler Fig: Migre Sistemas Legados sem Downtime"
imageAuthor: "Andreas Ebner"
---

## O Desafio da Migração de Sistemas Legados

Migrar um sistema monolítico antigo para uma arquitetura moderna é um dos maiores desafios na engenharia de software. O modelo tradicional de migração, conhecido como "Big Bang" — no qual o sistema novo é construído do zero em paralelo e substitui o antigo de uma só vez —, carrega riscos elevados. Entre eles estão prazos estourados, comportamento imprevisível em produção e interrupções prolongadas dos serviços.

Para mitigar esses riscos, o padrão **Strangler Fig** (ou Padrão Figueira-Mata-Pau) oferece uma abordagem incremental. Ele permite substituir gradualmente partes de um sistema legado sem interromper a operação existente.

## O que é o Padrão Strangler Fig?

Concebido por Martin Fowler, o termo é inspirado nas figueiras australianas que crescem ao redor de árvores hospedeiras até, eventualmente, substituí-las por completo.

Na engenharia de software, a ideia é construir o novo sistema nas bordas do sistema antigo. Uma camada intermediária intercepta as requisições e as direciona para o monolito ou para o novo serviço, dependendo da funcionalidade que já foi migrada. Com o tempo, o novo sistema substitui o antigo até que a infraestrutura legada possa ser desativada com segurança.

## Como Funciona a Arquitetura

A estrutura do padrão envolve três componentes principais:

- **Sistema Legado:** O monolito existente que precisa ser substituído.
- **Novo Serviço:** A nova implementação, geralmente construída com arquitetura de microsserviços ou módulos modernos.
- **Interceptador (Facade / API Gateway):** A camada de roteamento que intercepta as chamadas dos clientes e decide para onde direcionar cada requisição.

## Passo a Passo para Aplicação do Padrão

### 1. Mapeamento de Domínio e Escolha do Ponto de Corte
Evite começar pelas partes mais complexas do sistema. Identifique um contexto delimitado (*Bounded Context*) pequeno e de baixo risco, como um módulo de notificações ou a geração de relatórios.

### 2. Implementação da Camada Interceptadora
Antes de escrever código novo, introduza um proxy reverso ou API Gateway à frente do sistema legado. Toda a comunicação externa deve passar por essa camada, mesmo que, inicialmente, 100% do tráfego continue sendo enviado para o legado.

### 3. Desenvolvimento do Novo Serviço
Crie a funcionalidade escolhida na nova arquitetura. A nova aplicação deve ser independente do monolito, com seu próprio ciclo de implantação e, quando apropriado, seu próprio banco de dados.

### 4. Redirecionamento Gradual do Tráfego
Configure o interceptador para rotear requisições da funcionalidade específica para o novo serviço. Isso pode ser feito por roteamento de URLs ou por estratégias mais avançadas, como *canary releases* ou *feature flags*.

### 5. Eliminação do Código Legado
Quando o novo serviço demonstrar estabilidade e atender aos requisitos operacionais, remova o código correspondente do sistema legado. Repita o processo para o próximo módulo.

## Exemplo Prático: Roteamento via Proxy Reverso

A forma mais direta de implementar o interceptador é utilizando um proxy reverso como o Nginx. No exemplo abaixo, as rotas gerais continuam no monolito legado, mas o módulo de pedidos migrado é redirecionado para o novo microsserviço.

```nginx
server {
    listen 80;
    server_name api.empresa.local;

    # Encaminhamento padrão para o sistema legado
    location / {
        proxy_pass http://monolito-legado-host:8080;
        proxy_set_header Host $host;
    }

    # Rota migrada direcionada para o novo microsserviço
    location /api/v2/orders {
        proxy_pass http://servico-pedidos-host:8081;
        proxy_set_header Host $host;
    }
}
```

À medida que novas rotas são desenvolvidas e testadas, o arquivo de configuração do proxy é atualizado para alterar o destino das chamadas.

## Desafios e Cuidados Práticos

- **Sincronização de Dados:** Se o sistema antigo e o novo compartilharem informações, pode ser necessário implementar técnicas de escrita dupla (*dual write*) ou sincronização assíncrona baseada em eventos durante o período de transição.
- **Latência:** A inclusão de uma camada de proxy adiciona um pequeno salto na rede. A infraestrutura do gateway deve ser dimensionada adequadamente.
- **Gestão de Sessão:** Caso o legado utilize sessões em memória, é recomendável migrar a gestão de estado para um repositório centralizado antes de iniciar a separação dos serviços.

## Conclusão

O padrão Strangler Fig reduz o risco de migrações ao transformar uma substituição crítica em entregas contínuas e incrementais. A abordagem permite validar hipóteses em produção, garante capacidade de reversão (*rollback*) simplificada e mantém a continuidade do negócio sem indisponibilidades desnecessárias.
