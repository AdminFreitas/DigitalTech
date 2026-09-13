---
title: "Como Configurar Content Security Policy Estrita em SPAs"
slug: "como-configurar-uma-content-security-policy-estrita-em-spas-sem-quebrar-scripts"
category: "Desenvolvimento Web"
description: "Aprenda a implementar uma Content Security Policy (CSP) estrita com nonces e strict-dynamic em aplicações SPA sem bloquear scripts de terceiros."
date: "2026-09-13 13:33:55.598836+00:00"
readTime: "6"
image: "https://images.unsplash.com/photo-1614064642639-e398cf05badb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8Nnx8Q29uZmlndXJhciUyMENvbnRlbnQlMjBTZWN1cml0eSUyMFBvbGljeSUyMEVzdHJpdGF8ZW58MHwwfHx8MTc4OTMwNjQyNnww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Configurar Content Security Policy Estrita em SPAs"
imageAuthor: "FlyD"
---

# Como Configurar uma Content Security Policy Estrita em SPAs sem Quebrar Scripts de Terceiros

A segurança em aplicações de página única (Single Page Applications — SPAs) exige um equilíbrio delicado entre proteção contra vulnerabilidades e manutenção da funcionalidade. A *Content Security Policy* (CSP) é uma das camadas de defesa mais eficazes contra ataques de *Cross-Site Scripting* (XSS). No entanto, sua implementação tradicional costuma ser um desafio em ecossistemas modernos que dependem de bibliotecas dinâmicas e serviços de terceiros, como ferramentas de análise, gerenciadores de tags e gateways de pagamento.

Este artigo detalha como estruturar uma CSP estrita, baseada em *nonces* e na diretiva `'strict-dynamic'`, garantindo alta segurança sem interromper o funcionamento de scripts externos essenciais.

---

## O Problema do Modelo Tradicional de Permissões (Allowlist)

Historicamente, as políticas de segurança de conteúdo eram configuradas liberando domínios específicos dos quais os scripts poderiam ser carregados:

```http
Content-Security-Policy: script-src 'self' cdn.provedor.com scripts.analiticos.com;
```

Embora pareça uma abordagem lógica, esse modelo baseado em lista de permissões (*allowlist*) apresenta limitações graves em arquiteturas modernas:

1. **Manutenção complexa:** Qualquer alteração no provedor de um script de terceiros ou inclusão de uma nova ferramenta exige atualização nas regras do servidor.
2. **Burlar a segurança (Bypass):** Se um dos domínios autorizados hospedar um endpoint vulnerável (como uma API JSONP ou um serviço de redirecionamento aberto), um atacante pode injetar scripts maliciosos contornando a CSP totalmente.
3. **Incompatibilidade com SPAs:** SPAs frequentemente injetam scripts de forma dinâmica em tempo de execução, o que dificulta o mapeamento prévio de todos os domínios de origem.

---

## A Abordagem Estrita: Nonce e 'strict-dynamic'

A especificação CSP Level 3 introduziu um modelo de confiança baseado em criptografia e propagação dinâmica, eliminando a dependência de domínios específicos.

Os dois pilares dessa abordagem são:

- **Nonce (Number used once):** Um valor aleatório e imprevisível gerado pelo servidor a cada requisição HTTP. Apenas scripts contendo o atributo `nonce` idêntico ao valor enviado no cabeçalho CSP serão executados.
- **`'strict-dynamic'`:** Uma diretiva que instrui o navegador a confiar em qualquer script carregado dinamicamente por um script que já foi autorizado (via *nonce* ou *hash*).

Essa combinação simplifica a integração com scripts de terceiros: você autoriza apenas o script inicial (por exemplo, o carregador do gerenciador de tags) usando o *nonce*, e o `'strict-dynamic'` permite que ele carregue as dependências secundárias sem a necessidade de mapear cada domínio individualmente.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de autorização de scripts em uma CSP estrita usando nonce e strict-dynamic
motivo: Ilustra visualmente como o script inicial autenticado via nonce recebe permissão para carregar dependências secundárias de terceiros sem bloquear a aplicação.
[/IMAGEM]

---

## Passo a Passo: Configurando uma CSP Estrita em uma SPA

### Passo 1: Geração de Nonce Único por Requisição

Para que o *nonce* seja seguro, ele deve ser gerado com um gerador de números pseudoaleatórios criptograficamente seguro (CSPRNG) a cada resposta do servidor. Nunca reutilize *nonces* entre requisições distintas.

Exemplo de lógica de geração no servidor (Node.js/Express):

```javascript
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});
```

> **Nota para SPAs Estáticas:** Caso sua SPA seja servida estaticamente via CDN sem renderização no servidor (SSR), a abordagem baseada em *nonce* exige uma Edge Function ou Cloud Worker para injetar o *nonce* no HTML e no cabeçalho em tempo de borda. Caso contrário, a alternativa é utilizar *hashes* SHA-256 para os scripts inline estáticos.

### Passo 2: Construção do Cabeçalho CSP

Com o *nonce* gerado, monte a diretiva `script-src` combinando a chave, o `'strict-dynamic'` e fallbacks para navegadores antigos:

```http
Content-Security-Policy: 
  script-src 'nonce-R4nd0mV4lu3' 'strict-dynamic' 'unsafe-inline' https:;
  object-src 'none';
  base-uri 'none';
```

**Entendendo a lógica dos parâmetros:**
- `'nonce-R4nd0mV4lu3'`: Autoriza o script inicial que possui este token exato.
- `'strict-dynamic'`: Confia nos scripts descendentes injetados pelo script inicial.
- `'unsafe-inline'`: Ignorado por navegadores modernos quando um *nonce* ou `'strict-dynamic'` está presente, mas serve de fallback para navegadores antigos.
- `https:`: Serve como fallback de origem para navegadores que não suportam `'strict-dynamic'` (CSP Level 1).
- `object-src 'none'`: Desativa plugins antigos como Flash ou Java.
- `base-uri 'none'`: Impede a manipulação da tag `<base>`, evitando redirecionamentos maliciosos de caminhos relativos.

### Passo 3: Injeção do Nonce no HTML da SPA

No arquivo principal da sua SPA (`index.html`), insira o valor do *nonce* nas tags `<script>` que carregam a aplicação e as ferramentas de terceiros no servidor ou na Edge Function:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Minha Aplicação SPA</title>
  
  <!-- Script do Gerenciador de Tags de Terceiros -->
  <script nonce="R4nd0mV4lu3" src="https://gerenciador-de-tags.exemplo.com/gtm.js"></script>
  
  <!-- Bundle Principal da SPA -->
  <script nonce="R4nd0mV4lu3" src="/build/app.bundle.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

Com essa estrutura, o script do gerenciador de tags executará com sucesso e, graças ao `'strict-dynamic'`, qualquer script adicional acionado por ele (ferramentas de análise, chat ao vivo ou pixels de conversão) funcionará sem ser bloqueado pela CSP.

---

## Ajustando Outras Diretivas Essenciais

Enquanto a execução de scripts é resolvida pelo `'strict-dynamic'`, serviços de terceiros frequentemente fazem chamadas de rede (APIs) ou carregam recursos visuais. Essas ações são controladas por outras diretivas que ainda exigem especificação de origem ou padrões de permissão:

- **`connect-src`**: Define para onde os scripts podem enviar dados (ex.: `fetch`, `XMLHttpRequest`, `WebSocket`). É necessário incluir os endpoints das APIs de terceiros utilizados por ferramentas analíticas ou de autenticação.
- **`img-src`**: Permite o carregamento de pixels de rastreamento e imagens remotas. O uso de `img-src 'self' data: https:` costuma ser adequado para a maioria dos cenários.
- **`style-src`**: Para estilizações dinâmicas, pode-se usar *nonces* ou a opção `'unsafe-inline'` caso a biblioteca de terceiros injete estilos diretamente no DOM.

Exemplo de política completa:

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'nonce-R4nd0mV4lu3' 'strict-dynamic' 'unsafe-inline' https:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.terceiro.com https://telemetria.analitica.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'none';
  form-action 'self';
```

---

## Estratégia de Implantação sem Quebrar a Aplicação

A aplicação de uma CSP em ambientes de produção exige validação prévia para evitar a interrupção de serviços.

### 1. Utilize o modo de relatório (`Report-Only`)
Antes de aplicar o bloqueio definitivo, altere o nome do cabeçalho para `Content-Security-Policy-Report-Only`. Nesse modo, o navegador não bloqueia recursos que violam a política, mas envia relatórios detalhados para o endpoint especificado.

```http
Content-Security-Policy-Report-Only: 
  script-src 'nonce-R4nd0mV4lu3' 'strict-dynamic' 'unsafe-inline' https:;
  report-uri /api/csp-violation-report;
```

### 2. Monitoramento e Ajustes
Analise os relatórios recebidos durante alguns dias de uso real. Fique atento a bloqueios em `connect-src` ou falhas na execução de scripts legados que não utilizam técnicas modernas de injeção dinâmica.

### 3. Aplicação Definitiva em Produção
Após confirmar que todas as rotas e integrações da SPA funcionam perfeitamente no modo de relatório, altere o cabeçalho de volta para `Content-Security-Policy` para ativar a proteção real.

---

## Conclusão

A adoção de uma Content Security Policy estrita baseada em *nonce* e `'strict-dynamic'` resolve a fricção histórica entre segurança robusta e a necessidade de integração com ecossistemas de terceiros. Em SPAs, essa abordagem elimina a necessidade de manter listas exaustivas de domínios, reduz drasticamente o vetor de ataques XSS e garante a execução fluida de scripts necessários para a operação do negócio.
