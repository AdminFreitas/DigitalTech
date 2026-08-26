---
title: "Zero Trust em Kubernetes com eBPF e Cilium: Guia Prático"
slug: "implementando-segmentacao-de-rede-zero-trust-em-kubernetes-com-ebpf-e-cilium"
category: "Cloud e DevOps"
description: "Entenda os desafios das NetworkPolicies tradicionais no Kubernetes e como implementar segmentação de rede Zero Trust usando eBPF e Cilium com alta performance."
date: "2026-08-26 09:33:29.358188+00:00"
readTime: "6"
image: "https://images.pexels.com/photos/38486958/pexels-photo-38486958.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Zero Trust em Kubernetes com eBPF e Cilium: Guia Prático"
imageAuthor: "Ann H"
---

# Implementando Segmentação de Rede Zero Trust em Kubernetes com eBPF e Cilium

A segurança em ambientes de contêineres evoluiu drasticamente. Nos primórdios da orquestração de infraestrutura *cloud native*, a rede de um cluster Kubernetes era tratada como uma grande rede local plana (*flat network*), na qual qualquer pod podia se comunicar livremente com qualquer outro pod por padrão.

Com o avanço das ameaças e o aumento da complexidade das aplicações, esse modelo tornou-se inviável. A abordagem moderna exige o princípio de **Zero Trust** ("nunca confie, sempre verifique"), garantindo que todo tráfego de rede seja bloqueado até que haja uma permissão explícita para que ocorra.

Abaixo, veja como o **eBPF** (Extended Berkeley Packet Filter) e o **Cilium** trabalham juntos para implementar uma segmentação de rede Zero Trust de alta performance e com visibilidade profunda em clusters Kubernetes.

---

## O Desafio da Segurança de Rede no Kubernetes Tradicional

As *NetworkPolicies* nativas do Kubernetes foram criadas para definir regras de firewall entre pods. No entanto, as implementações tradicionais de CNI (Container Network Interface) baseadas em `kube-proxy` e `iptables` enfrentam grandes desafios:

1. **Complexidade de Escala**: Cada nova regra ou pod gera dezenas de linhas na tabela `iptables`. Em clusters com centenas de nós e centenas de milhares de pods, o overhead do kernel para processar essas regras causa latência perceptível.
2. **Falta de Contexto na Camada de Aplicação (L7)**: As NetworkPolicies nativas operam prioritariamente nas Camadas 3 e 4 (IP e Porta). Elas não conseguem filtrar por métodos HTTP, rotas REST ou chamadas gRPC.
3. **Evolução Dinâmica de IPs**: Pods são efêmeros. Depender de endereços IP para aplicar regras de segurança em ambientes dinâmicos é ineficiente e propenso a falhas.

---

## O que é o eBPF e por que ele revolucionou a conectividade

O eBPF é uma tecnologia do kernel do Linux que permite executar programas em bytecode diretamente dentro do kernel, sem a necessidade de alterar seu código-fonte ou carregar módulos adicionais.

No contexto de redes e segurança, o eBPF permite interceptar e processar pacotes no momento exato em que chegam à interface de rede virtual (veth) do nó, antes mesmo que a pilha de rede tradicional do Linux processe as regras de roteamento ou do `iptables`.

[IMAGEM]
tipo: diagrama
assunto: Comparação do fluxo de pacotes entre o modelo iptables tradicional e o atalho eBPF no kernel Linux
motivo: Explicar visualmente como o eBPF reduz a latência ao desviar do processamento complexo da pilha de rede do Linux
[/IMAGEM]

Ao adotar o **Cilium** como CNI baseada em eBPF, substituímos a complexidade do `iptables` por um processamento de rede programável em nível de kernel, garantindo alta performance e controle refinado até a Camada 7.

---

## Arquitetura Zero Trust com Cilium

O modelo Zero Trust baseia-se em três pilares principais quando aplicado a redes Kubernetes:

- **Identidade Baseada em Rótulos (Labels)**: Em vez de considerar o IP de origem, o Cilium atribui uma identidade numérica a cada pod com base em seus labels e namespace.
- **Negação Padrão (Default Deny)**: Todo tráfego entre pods é bloqueado por padrão.
- **Princípio do Menor Privilégio**: As permissões são concedidas apenas para portas, protocolos e endpoints estritamente necessários para a operação do sistema.

---

## Passo a Passo: Implementando a Segmentação na Prática

A seguir, veja como configurar um ambiente e aplicar políticas de segmentação usando o Cilium.

### 1. Requisitos Prévios

- Um cluster Kubernetes funcional (versão 1.24+).
- Ferramenta `helm` instalada.
- Acesso via `kubectl` com privilégios de administrador.

### 2. Instalação do Cilium no Cluster

Instale o Cilium substituindo o CNI padrão e habilitando o suporte a eBPF estendido:

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update

helm install cilium cilium/cilium \
  --namespace kube-system \
  --set kubeProxyReplacement=strict \
  --set hubble.enabled=true \
  --set hubble.ui.enabled=true
```

O parâmetro `kubeProxyReplacement=strict` indica ao Cilium para assumir completamente o roteamento de serviços do Kubernetes via eBPF, eliminando a dependência do `kube-proxy`.

### 3. Estabelecendo a Política Global de Default Deny

Para iniciar a arquitetura Zero Trust, o primeiro passo é garantir que nenhum pod possa se comunicar sem autorização prévia.

Aplique o manifesto a seguir no namespace alvo (por exemplo, `production`):

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  description: "Aplica politica de Zero Trust - Nega todo trafego Ingress e Egress por padrao"
  endpointSelector:
    matchLabels: {}
  ingress:
    - {}
  egress:
    - {}
```

A partir deste momento, nenhum pod dentro do namespace `production` conseguirá enviar ou receber dados de outros pods ou da internet.

### 4. Criando Regras de Liberação Granular (L3/L4 e L7)

Considere uma arquitetura simples composta por duas aplicações no namespace `production`:
- `frontend` (precisa enviar requisições HTTP GET para o backend)
- `backend` (recebe requisições do frontend na porta 8080)

Vamos criar uma política `CiliumNetworkPolicy` permitindo exclusivamente que os pods com o label `app: frontend` façam chamadas `HTTP GET` no caminho `/api/v1/data` do `backend`.

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  description: "Permite tráfego restrito de frontend para backend em L7"
  endpointSelector:
    matchLabels:
      app: backend
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "GET"
                path: "/api/v1/data"
```

Nesta configuração:
- Qualquer tentativa de envio via `POST` ou acesso a rotas como `/admin` será bloqueada diretamente pelo Cilium no kernel.
- Tentativas de acesso por pods que não possuem o label `app: frontend` serão descartadas instantaneamente.

---

## Observabilidade com Hubble

Um dos maiores desafios ao adotar o modelo Zero Trust é descobrir quais fluxos de tráfego existem antes de aplicar regras de bloqueio genéricas, evitando indisponibilidade em produção.

O **Hubble** é a plataforma de observabilidade do Cilium que utiliza o eBPF para fornecer visibilidade em tempo real do tráfego.

Com a CLI do Hubble, você pode auditar esses fluxos facilmente:

```bash
# Visualiza pacotes sendo bloqueados em tempo real no namespace
hubble observe --namespace production --verdict DROPPED

# Inspeciona o tráfego HTTP da camada 7
hubble observe --namespace production --protocol http
```

[IMAGEM]
tipo: screenshot
assunto: Saida do terminal mostrando o comando hubble observe exibindo fluxos permitidos e bloqueados com vereditos FORWARDED e DROPPED
motivo: Ilustra como o operador de infraestrutura consegue validar visualmente se uma politica Zero Trust esta bloqueando o trafego nao autorizado
[/IMAGEM]

---

## Boas Práticas para Migração Segura

1. **Execute em Modo de Auditoria Inicialmente**: Antes de aplicar um `Default Deny` estrito em ambientes críticos, utilize o suporte à observabilidade do Cilium para mapear previamente as dependências dos serviços.
2. **Aplique Políticas Específicas por Namespace**: Utilize `CiliumClusterwideNetworkPolicy` apenas para regras globais de infraestrutura (como acesso ao DNS interno ou exportadores de métricas).
3. **Segregue o Tráfego do DNS**: Lembre-se de permitir explicitamente a resolução de nomes de domínio (`kube-dns`) nas políticas de `egress`; caso contrário, os serviços não conseguirão resolver endpoints internos.

---

## Conclusão

A união entre eBPF e Cilium altera profundamente a forma como tratamos a segurança em redes *cloud native*. O modelo Zero Trust deixa de ser uma teoria complexa e custosa em termos de processamento para se tornar uma implementação viável, performática e extremamente granular. Ao migrar a inteligência de segurança para o kernel Linux, garantimos visibilidade total, proteção na Camada 7 e facilidade de sustentação mesmo em infraestruturas altamente dinâmicas.
