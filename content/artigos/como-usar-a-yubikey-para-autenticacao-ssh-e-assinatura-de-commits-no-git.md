---
title: "Como Configurar YubiKey para SSH e Assinatura no Git"
slug: "como-usar-a-yubikey-para-autenticacao-ssh-e-assinatura-de-commits-no-git"
category: "Hardware"
description: "Aprenda a usar a YubiKey com FIDO2 para proteger chaves SSH e assinar commits no Git com autenticação física e maior segurança."
date: "2026-09-11 19:24:10.983669+00:00"
readTime: "4"
image: "https://images.unsplash.com/photo-1691318531721-5603e3c3a8a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MXx8VXNhciUyMFl1YmlLZXklMjBBdXRlbnRpY2ElQzMlQTclQzMlQTNvJTIwU1NIJTIwQXNzaW5hdHVyYXxlbnwwfDB8fHwxNzg5MTU0NjE3fDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Configurar YubiKey para SSH e Assinatura no Git"
imageAuthor: "Andy Kennedy"
---

# Como Usar a YubiKey para Autenticação SSH e Assinatura de Commits no Git

A segurança em ambientes de desenvolvimento e administração de sistemas exige camadas de proteção que vão além de senhas fortes. Chaves SSH armazenadas diretamente no sistema de arquivos de uma máquina de trabalho estão sujeitas a riscos como malwares com capacidade de leitura de arquivos, exfiltração acidental ou acessos não autorizados caso o dispositivo seja comprometido.

O uso de tokens de segurança baseados em hardware, como a YubiKey, eleva o nível de proteção ao garantir que os segredos criptográficos fiquem isolados em um elemento seguro, exigindo presença física para autorizar qualquer operação.

## Por que mover suas chaves para o hardware?

Quando você gera um par de chaves SSH tradicional (como `ed25519` ou `rsa`), a chave privada é gravada em disco no diretório `~/.ssh/`. Se um processo malicioso obtiver acesso de leitura a esse diretório, a chave poderá ser copiada e utilizada em outros locais.

Com o suporte a **FIDO2/WebAuthn** (introduzido nativamente a partir do OpenSSH 8.2), o par de chaves gerado utiliza o tipo `ed25519-sk` (*Security Key*). Nesse modelo, a chave privada real permanece retida no elemento seguro da YubiKey ou é protegida por um identificador codificado (*key handle*). Em ambos os casos, a assinatura de um desafio criptográfico depende da validação física do usuário — geralmente mediante um toque no sensor do dispositivo.

[IMAGEM]
tipo: diagrama
assunto: Fluxo comparativo entre autenticação SSH tradicional em arquivo de disco e autenticação baseada em hardware FIDO2
motivo: Ilustrar a diferença de segurança e o isolamento das chaves privadas dentro do elemento seguro da YubiKey
[/IMAGEM]

## Pré-requisitos do Sistema

Antes de iniciar a configuração, confirme se o seu ambiente atende aos seguintes requisitos:

- **OpenSSH**: Versão 8.2 ou superior no cliente local.
- **Git**: Versão 2.34 ou superior (necessária para suporte nativo a assinaturas via SSH).
- **Bibliotecas**: `libfido2` instalada no sistema operacional para permitir que o OpenSSH se comunique com o hardware FIDO2.
- **Hardware**: YubiKey com suporte a FIDO2 (como as séries YubiKey 5 ou Security Key Series).

## Passo 1: Gerando a Chave SSH com FIDO2

Para criar uma chave SSH vinculada ao hardware, conecte sua YubiKey à porta USB e execute o seguinte comando no terminal:

```bash
ssh-keygen -t ed25519-sk -O touch-required -C "usuario@digitaltech"
```

Entenda os parâmetros utilizados:
- `-t ed25519-sk`: Especifica o algoritmo Ed25519 adaptado para chaves de segurança físicas.
- `-O touch-required`: Exige explicitamente o toque no hardware a cada tentativa de uso da chave.
- `-C`: Insere um comentário descritivo para identificar a chave.

Durante o processo, o terminal solicitará que você toque na YubiKey. Serão gerados dois arquivos em `~/.ssh/`:
- `id_ed25519_sk`: O ponteiro local (*handle*) referente à sua chave de hardware.
- `id_ed25519_sk.pub`: A chave pública correspondente.

## Passo 2: Configurando o Acesso SSH Remoto

Copie a chave pública para o servidor remoto onde deseja autenticar:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_sk.pub usuario@servidor-remoto
```

Em seguida, adicione a configuração ao seu arquivo `~/.ssh/config` para facilitar a conexão:

```text
Host servidor-prod
    HostName 192.168.1.100
    User admin
    IdentityFile ~/.ssh/id_ed25519_sk
    IdentitiesOnly yes
```

Ao executar `ssh servidor-prod`, o indicador luminoso da YubiKey piscará. A sessão SSH só será estabelecida após o toque físico no token.

## Passo 3: Assinando Commits no Git com a Chave SSH

Tradicionalmente, a assinatura de commits no Git dependia do GPG (GNU Privacy Guard), um sistema robusto, porém com curva de aprendizado mais complexa. A partir da versão 2.34, o Git passou a suportar assinaturas usando o próprio protocolo SSH.

Para configurar o Git e utilizar a chave física recém-criada:

1. Altere o formato de assinatura padrão para SSH:

```bash
git config --global gpg.format ssh
```

2. Aponte o Git para a sua chave pública SSH:

```bash
git config --global user.signingkey ~/.ssh/id_ed25519_sk.pub
```

3. Habilite a assinatura automática para todos os commits futuros:

```bash
git config --global commit.gpgsign true
```

## Validando o Funcionamento

Para testar a integração, crie um commit em qualquer repositório de teste:

```bash
git commit -m "docs: atualiza documentação de segurança"
```

Durante a execução do comando, a YubiKey solicitará a confirmação por toque. Para verificar se o commit foi assinado corretamente no histórico do repositório, utilize:

```bash
git log --show-signature -1
```

A saída do comando exibirá detalhes da assinatura digital verificada pela chave SSH.

## Recomendações de Segurança e Backup

- **Cadastre uma YubiKey de Backup**: Dispositivos físicos podem ser perdidos ou danificados. É altamente recomendável gerar um segundo par de chaves usando uma YubiKey sobressalente e cadastrar ambas as chaves públicas nos seus servidores e plataformas de hospedagem de código.
- **Definição de PIN FIDO2**: Utilize o utilitário `yubikey-manager` para configurar um PIN de proteção no applet FIDO2 da YubiKey. Isso garante um fator duplo de autenticação: algo que você possui (o hardware) e algo que você sabe (o PIN).
