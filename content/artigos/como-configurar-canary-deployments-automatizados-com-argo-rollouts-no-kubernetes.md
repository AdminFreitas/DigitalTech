---
title: "Canary Deployments automatizados com Argo Rollouts no Kubernetes"
slug: "como-configurar-canary-deployments-automatizados-com-argo-rollouts-no-kubernetes"
category: "Cloud e DevOps"
description: "Aprenda passo a passo a configurar Canary Deployments automatizados no Kubernetes usando Argo Rollouts, incluindo roteamento de tráfego e métricas de validação."
date: "2026-08-22 04:58:34.198227+00:00"
readTime: "2"
image: "https://images.pexels.com/photos/33624937/pexels-photo-33624937.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Canary Deployments automatizados com Argo Rollouts no Kubernetes"
imageAuthor: "Derek Keats"
---

# Como configurar Canary Deployments automatizados com Argo Rollouts no Kubernetes

Atualizar aplicações em ambientes de produção envolve riscos significativos. Um erro não detectado nos testes de ambiente estático pode afetar todos os usuários simultaneamente se uma nova versão for implantada de forma irrestrita.

O recurso nativo de *Deployment* do Kubernetes oferece a estratégia `RollingUpdate`, que substitui pods antigos por novos de forma gradual. No entanto, essa abordagem possui limitações críticas: ela avalia apenas a integridade técnica do container (se o pod está rodando e passando nos testes de *readiness probe*), mas não analisa a qualidade funcional da aplicação, como taxas de erro HTTP ou picos de latência.

Para resolver essa limitação, o **Argo Rollouts** foi desenvolvido. Ele introduz estratégias avançadas de implantação, como *Canary Deployments* e *Blue‑Green Deployments*, permitindo validações automáticas orientadas a métricas reais de telemetria.

---

## O que é um Canary Deployment?

O termo remete historicamente aos canários que os mineradores levavam para as minas de carvão: se o canário passasse mal, era sinal de que havia gases nocivos e que os trabalhadores deveriam recuar.

Em engenharia de software, a estratégia *Canary* consiste em disponibilizar a nova versão do código para um pequeno percentual dos usuários finais (por exemplo, 5 % ou 10 %). O tráfego restante continua sendo atendido pela versão estável.

Caso a nova versão apresente comportamento adequado, a fatia de tráfego é aumentada progressivamente até atingir 100 %. Se qualquer anomalia for detectada, o tráfego é revertido imediatamente para a versão anterior.

[IMAGEM]
tipo: diagrama
assunto: Roteamento de tráfego progressivo entre a versão estável e a versão canário usando Argo Rollouts
motivo: Visualizar como a divisão de tráfego é controlada gradualmente antes da substituição total da aplicação
[/IMAGEM]

---

## O que é o Argo Rollouts e por que utilizá‑lo?

O Argo Rollouts é um *controller* e um conjunto de *Custom Resource Definitions* (CRDs) para Kubernetes. Ele substitui o objeto nativo `Deployment` pelo objeto customizado `Rollout`.

Entre as principais vantagens do Argo Rollouts estão:

- **Controle refinado de tráfego**: integração com *Ingress Controllers* (como NGINX e Traefik) e *Service Meshes* (como Istio e Linkerd).  
- **Análise automatizada de métricas**: integração nativa com sistemas de monitoramento (como Prometheus, Datadog e New Relic) via o recurso `AnalysisTemplate`.  
- **Rollback automático**: reversão imediata e sem intervenção humana caso os indicadores chave de desempenho (KPIs) violem os limites estipulados.

---

## Instalação do Argo Rollouts

Para iniciar a configuração, é necessário instalar o controller e as CRDs no cluster Kubernetes.

### 1. Instalação do Controller no Cluster

Execute os comandos abaixo para criar o namespace e aplicar os manifestos oficiais:

```bash
kubectl create namespace argo-rollouts
