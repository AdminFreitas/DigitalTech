---
title: "Guia para Mitigar Vulnerabilidades SSRF no Node.js"
slug: "como-mitigar-vulnerabilidades-de-ssrf-ao-processar-webhooks-e-urls-de-terceiros"
category: "Desenvolvimento Web"
description: "Aprenda a proteger aplicações Node.js contra Server-Side Request Forgery (SSRF) ao processar webhooks e URLs externas com práticas de validação e rede."
date: "2026-09-10 19:22:30.587201+00:00"
readTime: "6"
image: "https://images.unsplash.com/photo-1774901128281-a884cd447af5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8N3x8TWl0aWdhciUyMFZ1bG5lcmFiaWxpZGFkZXMlMjBTU1JGJTIwUHJvY2Vzc2FyJTIwV2ViaG9va3N8ZW58MHwwfHx8MTc4OTA2ODEzNXww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Guia para Mitigar Vulnerabilidades SSRF no Node.js"
imageAuthor: "Bernd 📷 Dittrich"
---

# Como Mitigar Vulnerabilidades de SSRF ao Processar Webhooks e URLs de Terceiros no Node.js

O suporte a webhooks e a integração com serviços externos tornaram-se requisitos comuns em aplicações web modernas. No entanto, permitir que usuários forneçam URLs arbitrárias para que o servidor realize requisições HTTP introduz uma das vulnerabilidades mais críticas de segurança: o **Server-Side Request Forgery (SSRF)**.

Em aplicações Node.js, se uma URL de callback ou webhook não for devidamente sanitizada e validada no nível de rede, um atacante pode induzir o servidor a fazer requisições para serviços internos, redes locais ou endpoints de metadados de provedores de nuvem.

Neste artigo, veremos como o SSRF funciona no contexto do Node.js e quais estratégias práticas de código e infraestrutura garantem a mitigação efetiva dessa vulnerabilidade.

---

## Entendendo o Mecanismo do SSRF

O SSRF ocorre quando uma aplicação web recebe uma URL fornecida pelo usuário e realiza uma requisição a partir do backend sem a devida validação.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de ataque SSRF onde o atacante envia uma URL maliciosa e o servidor Node.js acessa a rede interna
motivo: Ilustra visualmente como a aplicacao atua como ponte entre a internet publica e os recursos internos protegidos
[/IMAGEM]

Como o servidor Node.js geralmente reside dentro da infraestrutura interna ou de uma VPC em nuvem, a requisição enviada por ele possui a identidade de rede do próprio servidor. Isso permite que o atacante acesse:

- **Serviços internos da infraestrutura:** Instâncias do Redis, Memcached ou bancos de dados expostos sem autenticação na rede interna.
- **Metadados de Nuvem:** Endpoints de metadados em ambientes AWS, GCP ou Azure (como `169.254.169.254`) para obter credenciais temporárias de acesso.
- **Loopback local:** Serviços executando em `localhost` (`127.0.0.1` ou `::1`) no próprio servidor.

---

## Os Riscos das Soluções Simplistas

Tentativas superficiais de validação frequentemente falham por não considerarem peculiaridades da resolução de nomes e do protocolo IP.

### 1. Listas Negras (Blacklists) de String ou Regex
Tentar bloquear palavras como `localhost` ou `169.254.169.254` usando expressões regulares ou busca de texto é ineficaz. Um atacante pode contornar essa checagem utilizando:
- Representações alternativas de IP (como inteiros decimais `2130706433`, formatos hexadecimais `0x7f000001` ou octais `0177.0.0.1`).
- Domínios customizados sob controle do atacante que apontam para `127.0.0.1` ou serviços de DNS público para testes de loopback.

### 2. DNS Rebinding e TOCTOU (Time-of-Check to Time-of-Use)
Se a aplicação validar o endereço IP de um domínio fazendo uma consulta DNS prévia (`dns.lookup`) e, em seguida, disparar a requisição usando uma biblioteca HTTP padrão (como `axios` ou `fetch`), a biblioteca fará uma nova consulta DNS no momento do envio.

O atacante pode configurar um servidor DNS autoritativo com tempo de vida (TTL) zerado que responde um IP público seguro durante a validação e um IP privado durante a requisição real. Essa discrepância é chamada de *DNS Rebinding*.

---

## Estratégia de Mitigação em Camadas no Node.js

Para mitigar o SSRF de forma consistente, é necessário adotar uma abordagem de defesa em profundidade, cobrindo parsing de URL, resolução de IP e controle no transporte HTTP.

### Passo 1: Restringir Esquemas e Parsear a URL
Apenas os esquemas `http:` e `https:` devem ser permitidos. Outros esquemas como `file:`, `ftp:` ou `gopher:` devem ser rejeitados imediatamente.

```javascript
function validarEsquema(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    return parsedUrl;
  } catch (e) {
    return null; // URL invalida
  }
}
```

### Passo 2: Validar o IP Resultante Contra Intervalos Privados
Antes de efetuar o envio do webhook, deve-se resolver o hostname para um endereço IP e verificar se ele pertence a blocos de endereços reservados ou privados (RFC 1918, RFC 4193, loopback e link-local).

Intervalos prioritários para bloqueio:
- `127.0.0.0/8` e `::1/128` (Loopback)
- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Redes Privadas IPv4)
- `169.254.0.0/16` e `fe80::/10` (Link-Local / Metadados de Nuvem)
- `fc00::/7` (IPv6 Unique Local)

### Passo 3: Forçar a Requisição a Usar o IP Resolvido (Evitar DNS Rebinding)
Para neutralizar o DNS Rebinding, a requisição HTTP deve conectar diretamente no endereço IP já validado, mantendo o cabeçalho `Host` original para preservar o roteamento HTTP correto no destino.

---

## Exemplo Prático de Implementação Segura

Abaixo está uma implementação de exemplo em Node.js utilizando os módulos nativos (`http`, `https`, `net`, `dns/promises`) para realizar requisições de webhook com proteção contra SSRF:

```javascript
const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');

function isPrivateIp(ip) {
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 127) return true; // Loopback
    if (parts[0] === 10) return true; // Classe A privada
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // Classe B privada
    if (parts[0] === 192 && parts[1] === 168) return true; // Classe C privada
    if (parts[0] === 169 && parts[1] === 254) return true; // Link-local / Cloud Metadata
    if (parts[0] === 0) return true;
  } else if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized === '::') return true;
    if (normalized.startsWith('fe80:')) return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  }
  return false;
}

async function safeFetchWebhook(targetUrl, payload) {
  const parsedUrl = new URL(targetUrl);

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Protocolo nao permitido.');
  }

  // Resolve os enderecos IP vinculados ao hostname
  const addresses = await dns.lookup(parsedUrl.hostname, { all: true });

  if (!addresses || addresses.length === 0) {
    throw new Error('Nao foi possivel resolver o dominio.');
  }

  for (const addr of addresses) {
    if (isPrivateIp(addr.address)) {
      throw new Error(`Acesso negado: IP privado detectado (${addr.address})`);
    }
  }

  // Fixa o IP ja validado para evitar DNS Rebinding
  const targetIp = addresses[0].address;
  const isHttps = parsedUrl.protocol === 'https:';
  const client = isHttps ? https : http;

  const options = {
    hostname: targetIp,
    port: parsedUrl.port || (isHttps ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'POST',
    headers: {
      'Host': parsedUrl.hostname,
      'Content-Type': 'application/json',
      'User-Agent': 'DigitalTech-Webhook-Worker/1.0'
    },
    // Desabilita redirecionamentos automaticos para prevenir bypass via HTTP 30x
    maxRedirects: 0,
    timeout: 5000
  };

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na requisicao'));
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}
```

---

## Controles Complementares de Infraestrutura

A validação no código do aplicativo é fundamental, mas deve ser acompanhada por medidas na camada de infraestrutura:

1. **Desabilitar Redirecionamentos Automáticos:** Respostas com status HTTP `301` ou `302` podem redirecionar uma requisição válida para uma URL interna privada. Se o seu cliente HTTP permitir redirecionamentos, desabilite-os ou valide manualmente a nova URL de destino a cada salto.
2. **Isolamento de Redes de Egress:** Configure Firewalls ou Security Groups para impedir que os servidores encarregados de processar webhooks acessem redes internas sensíveis ou a interface de metadados do provedor de nuvem.
3. **Uso de Proxy Egress Dedicado:** Encaminhe todas as requisições externas da aplicação por meio de um proxy de saída posicionado em uma zona desmilitarizada (DMZ) isolada da rede corporativa ou de produção.

---

## Conclusão

Processar URLs e webhooks de terceiros no Node.js exige uma abordagem rigorosa de controle de rede. Confiar apenas na sanitização de texto ou na resolução padrão de nomes deixa a aplicação exposta a técnicas como DNS Rebinding e evasão de listas negras. A combinação entre a resolução prévia com validação de IP no transporte e a adoção de políticas de rede restritivas representa o padrão ideal para neutralizar os riscos de SSRF.
