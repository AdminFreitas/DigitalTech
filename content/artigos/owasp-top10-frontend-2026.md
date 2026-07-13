---
slug: owasp-top10-frontend-2026
title: "OWASP Top 10: o que mudou no front-end em 2026"
category: Cibersegurança
excerpt: "Os ataques do ano, com exemplos reais e mitigação aplicada."
date: 2026-06-20
readTime: 9 min
published: true
---
## Por que o front-end virou alvo prioritário

Durante anos, segurança de aplicações web focou no back-end. O front-end era "só interface". Esse tempo acabou.

Com SPAs [Single Page Applications — Aplicações de Página Única], GraphQL exposto no cliente, tokens JWT armazenados no localStorage e lógica de negócio migrada para o browser, o front-end virou uma superfície de ataque enorme. O OWASP atualizou as diretrizes refletindo essa realidade.

## 1. Injeção via DOM (ainda o número 1)

XSS [Cross-Site Scripting — Injeção de Script entre Sites] não morreu. Evoluiu.

**O erro clássico:**
```javascript
// NUNCA faça isso
document.getElementById("titulo").innerHTML = params.get("q");
```

**A mitigação:**
```javascript
// Use textContent para texto puro
document.getElementById("titulo").textContent = params.get("q");

// Em React, evite dangerouslySetInnerHTML sem sanitização
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

Em 2026, o vetor mais comum é via dados vindos de APIs de terceiros exibidos sem sanitização.

## 2. Autenticação quebrada no cliente

Guardar tokens de autenticação no `localStorage` expõe o usuário a roubo via XSS. Qualquer script injetado na página pode ler o token.

**Evite:**
```javascript
localStorage.setItem("token", resposta.token); // perigoso
```

**Prefira:**
- Cookies `HttpOnly` + `Secure` + `SameSite=Strict` — o JavaScript não consegue ler
- Tokens de curta duração com refresh automático via cookie seguro
- BFF [Backend for Frontend — Back-end para Front-end] que gerencia tokens no servidor

## 3. CSRF ainda acontece

CSRF [Cross-Site Request Forgery — Falsificação de Requisição entre Sites] continua presente, especialmente em formulários e APIs que usam cookies de sessão.

**Mitigação mínima:**
```
Set-Cookie: sessao=abc123; SameSite=Strict; Secure; HttpOnly
```

Para formulários, use tokens CSRF gerados no servidor e validados a cada requisição POST.

## 4. Exposição de dados sensíveis no bundle

Código de front-end é público. Qualquer variável que vai para o bundle pode ser lida.

**O erro:**
```javascript
// .env exposto no bundle do Vite
const API_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY; // visível para todos
```

**A regra:** variáveis com `VITE_` prefixo entram no bundle. Chaves secretas nunca devem ter esse prefixo — elas pertencem ao servidor.

## 5. Dependências com vulnerabilidades conhecidas

O `npm audit` existe por um motivo. Em 2026, ataques à cadeia de suprimentos [supply chain attacks] são um dos vetores mais explorados.

```bash
npm audit
npm audit fix
```

Automatize isso no CI [Integração Contínua]:
```yaml
- name: Verificar vulnerabilidades
  run: npm audit --audit-level=high
```

## Content Security Policy — a defesa em profundidade

CSP [Content Security Policy — Política de Segurança de Conteúdo] é um header HTTP que restringe de onde scripts, estilos e recursos podem ser carregados.

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com
```

Um CSP bem configurado elimina boa parte dos vetores de XSS mesmo que o código tenha vulnerabilidades.

## Checklist mínimo para qualquer projeto front-end

- [ ] Sanitizar todo HTML renderizado dinamicamente
- [ ] Tokens de autenticação em cookies HttpOnly, nunca em localStorage
- [ ] SameSite=Strict em todos os cookies de sessão
- [ ] Variáveis de ambiente: segredos nunca no bundle do cliente
- [ ] npm audit no CI com falha em vulnerabilidades críticas
- [ ] Content-Security-Policy configurado no servidor
- [ ] HTTPS em produção com HSTS habilitado

## Conclusão

Segurança de front-end não é paranoia — é responsabilidade. A maioria dos ataques bem-sucedidos exploram erros básicos que poderiam ser evitados com checklist e revisão de código.
