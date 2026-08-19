---
title: "Autenticação sem senha em React com WebAuthn: guia passo a passo"
slug: "autenticacao-sem-senha-em-react-guia-pratico-com-webauthn"
category: "Desenvolvimento Web"
description: "Aprenda a implementar autenticação passwordless em React usando a API WebAuthn, com configuração, código exemplo e boas práticas de segurança."
date: "2026-08-19 06:42:48.914311"
readTime: "4"
image: "https://images.unsplash.com/photo-1653387137517-fbc54d488ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NXx8QXV0ZW50aWNhJUMzJUE3JUMzJUEzbyUyMHNlbmhhJTIwUmVhY3QlMjBndWlhJTIwcHIlQzMlQTF0aWNvfGVufDB8MHx8fDE3ODcxMjE3NjR8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Autenticação sem senha em React com WebAuthn: guia passo a passo"
imageAuthor: "Rahul Mishra"
---

# Autenticação sem senha em React: guia prático com WebAuthn

## Introdução

A autenticação tradicional baseada em senhas enfrenta desafios crescentes: senhas fracas, reutilização entre serviços e a crescente sofisticação de ataques de phishing e *credential stuffing*. Nesse contexto, a **autenticação sem senha (passwordless)** surge como uma alternativa mais segura e conveniente para usuários e desenvolvedores.

No ecossistema web moderno, o **WebAuthn** (Web Authentication API) é o padrão mais robusto para implementar autenticação sem senha. Ele permite que os usuários se autentiquem usando credenciais biométricas (como impressão digital ou reconhecimento facial) ou dispositivos externos (como chaves de segurança FIDO2 ou smartphones).

Neste guia, você aprenderá a implementar autenticação sem senha em uma aplicação React utilizando WebAuthn, desde a configuração inicial até as melhores práticas de segurança e experiência do usuário.

---

## O que é WebAuthn e por que usá-lo?

### Conceito básico

O WebAuthn é um padrão do W3C e da FIDO Alliance que permite autenticação segura sem senhas. Ele funciona como uma extensão do navegador que se comunica com autenticadores externos, como:

- **Chaves de segurança FIDO2** (ex.: YubiKey, Google Titan, Feitian)
- **Dispositivos biométricos integrados** (leitores de impressão digital, câmeras com reconhecimento facial)
- **Smartphones** (via Bluetooth ou NFC, usando plataformas como Google Smart Lock ou Apple Touch ID)

Ao contrário de métodos tradicionais que armazenam senhas no servidor, o WebAuthn gera e armazena **chaves públicas e privadas criptograficamente seguras** diretamente no dispositivo do usuário.

### Vantagens sobre a autenticação tradicional

- **Segurança aprimorada**: elimina o risco de vazamento de senhas e ataques de força bruta.
- **Experiência do usuário**: login mais rápido e sem necessidade de lembrar credenciais.
- **Resistência a phishing**: as credenciais não podem ser interceptadas por sites maliciosos.
- **Suporte multiplataforma**: funciona em navegadores modernos (Chrome, Firefox, Edge, Safari) e dispositivos (desktop, mobile).

### Quando usar o WebAuthn?

O WebAuthn é ideal para cenários como:

- Aplicações web que priorizam segurança (bancos, fintechs, health techs).
- Plataformas que buscam reduzir atritos no login (e-commerce, SaaS).
- Sistemas que já utilizam MFA (Multi-Factor Authentication) e querem simplificar o fluxo.

---

## Pré-requisitos para implementação

Antes de começar, certifique-se de ter:

1. **Navegador compatível**: Chrome 67+, Firefox 60+, Edge 79+, Safari 13+ (em iOS/macOS).
2. **Backend preparado**: você precisará de um servidor para gerenciar as credenciais e validar os desafios (mais detalhes na próxima seção).
3. **Autenticador físico ou virtual**: para testes, você pode usar:
   - Chaves de segurança FIDO2 (ex.: YubiKey 5, SoloKey).
   - Emuladores como WebAuthn.io (para testes iniciais).
   - Autenticadores do navegador (ex.: Touch ID no Mac, Windows Hello no Windows).

### Bibliotecas úteis para React

Embora não exista uma biblioteca oficial do W3C para React, você pode usar wrappers populares como:

- `@simplewebauthn/browser` e `@simplewebauthn/server` (recomendado pela simplicidade).
- `@passwordless-id/webauthn` (alternativa leve).

Neste guia, utilizaremos as bibliotecas **`@simplewebauthn/browser`** e **`@simplewebauthn/server`**, por serem bem documentadas e mantidas ativamente.

---

## Configuração inicial do projeto

### 1. Criando um projeto React

```bash
npx create-react-app react-webauthn-demo
cd react-webauthn-demo
npm install @simplewebauthn/browser @simplewebauthn/server
```

### 2. Estrutura básica do projeto

```
/src
  ├── /components
  │   ├── AuthButton.tsx
  │   ├── RegistrationForm.tsx
  │   └── LoginForm.tsx
  ├── /lib
  │   └── webauthn.ts
  ├── App.tsx
  └── index.tsx
```

### 3. Configuração do servidor (exemplo em Node.js)

Embora este guia foque no frontend, o WebAuthn requer um backend para:

- Gerar **challenges** (desafios criptográficos) para cada tentativa de login ou registro.
- Armazenar as **credenciais públicas** dos usuários.
- Validar as respostas do cliente.

Aqui está um exemplo mínimo de configuração do servidor usando Express e TypeScript:

```typescript
// server.ts
import express from 'express';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Simulando um banco de dados (em produção, use um DB real)
const users = new Map<string, any>();

// Rota para início do registro
app.post('/register-options', async (req, res) => {
  const { username } = req.body;
  const userId = crypto.randomUUID();

  const options = await generateRegistrationOptions({
    rpName: 'DigitalTech Auth',
    rpID: 'localhost', // Ajuste para seu domínio em produção
    userID: userId,
    userName: username,
    attestationType: 'none',
  });

  // Armazena o challenge temporariamente
  users.set(userId, { username, currentChallenge: options.challenge });

  res.json(options);
});

// Rota para finalizar o registro
app.post('/register-verify', async (req, res) => {
  const { userId, response } = req.body;
  const user = users.get(userId);

  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verification.verified) {
      // Armazena a credencial pública (em produção, salve no DB)
      user.credential = verification.registrationInfo;
      user.currentChallenge = null;
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Registro inválido' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Erro no registro' });
  }
});

// Rota para início do login
app.post('/login-options', async (req, res) => {
  const { username } = req.body;

  // Busca o usuário no DB (simplificado)
  const user = Array.from(users.values()).find(u => u.username === username);
  if (!user || !user.credential) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const options = await generateAuthenticationOptions({
    allowCredentials: [{
      id: user.credential.credentialID,
      type: 'public-key',
    }],
    userVerification: 'preferred',
  });

  user.currentChallenge = options.challenge;

  res.json(options);
});
```
