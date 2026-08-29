---
title: "Como Configurar YubiKey para Autenticação SSH com FIDO2"
slug: "como-configurar-um-yubikey-para-autenticacao-ssh-com-chaves-fido2-residentes"
category: "Hardware"
description: "Aprenda a configurar chaves FIDO2 residentes no YubiKey para autenticação SSH segura e portátil sem depender de arquivos no disco local."
date: "2026-08-29 14:07:06.634666+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1691318531721-5603e3c3a8a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8MXx8Y29uZmlndXJhciUyMFl1YmlLZXklMjBhdXRlbnRpY2ElQzMlQTclQzMlQTNvJTIwU1NIJTIwY2hhdmVzfGVufDB8MHx8fDE3ODgwMTIzNDZ8MA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Configurar YubiKey para Autenticação SSH com FIDO2"
imageAuthor: "Andy Kennedy"
---

# Como configurar um YubiKey para autenticação SSH com chaves FIDO2 residentes

A autenticação via SSH baseada em pares de chaves assimétricas (como RSA ou Ed25519) é há anos a prática recomendada para a administração de servidores remotos. No entanto, armazenar chaves privadas no disco rígido local apresenta riscos de exfiltração caso a máquina cliente seja comprometida por malware ou acessos não autorizados.

Com o lançamento do OpenSSH 8.2, foi introduzido o suporte nativo a tokens de hardware compatíveis com FIDO2/U2F, permitindo o uso de dispositivos como a YubiKey para assinar sessões SSH. Dentro do padrão FIDO2, existem duas abordagens principais: chaves não residentes e **chaves residentes** (também chamadas de *discoverable credentials*).

A seguir, você verá como funcionam as chaves FIDO2 residentes e como configurá-las passo a passo na YubiKey para obter uma autenticação SSH segura e portátil.

---

## O que são chaves FIDO2 residentes?

Para entender a utilidade das chaves residentes, vale comparar os dois modos de funcionamento do FIDO2 no SSH:

- **Chave não residente (padrão):** O `ssh-keygen` gera um par de chaves e salva um atalho (ou *key handle*) no arquivo `~/.ssh/id_ed25519_sk` do computador. A YubiKey é necessária para assinar a autenticação, mas a conexão ainda depende do arquivo local. Se você mudar de computador, precisará transferir esse arquivo.
- **Chave residente (*discoverable*):** A chave privada ou os metadados necessários para reconstruí-la ficam armazenados diretamente no chip de segurança da YubiKey. Isso permite conectar o token de hardware a qualquer computador com OpenSSH atualizado e carregar a credencial sem precisar copiar arquivos prévios.

[IMAGEM]
tipo: diagrama
assunto: Comparação de fluxo de autenticação entre chave SSH tradicional, chave FIDO2 não residente e chave FIDO2 residente no YubiKey
motivo: Explicar graficamente como a chave residente elimina a dependência do arquivo de chave guardado no disco da máquina cliente
[/IMAGEM]

---

## Pré-requisitos de sistema e hardware

Antes de iniciar a configuração, certifique-se de cumprir os seguintes requisitos:

1. **YubiKey compatível:** Dispositivo da série YubiKey 5 ou YubiKey Bio com suporte a FIDO2.
2. **OpenSSH 8.2 ou superior:** Tanto o cliente quanto o servidor precisam suportar os tipos de chave `ed25519-sk` ou `ecdsa-sk`. Verifique a versão instalada com o comando:
   ```bash
   ssh -V
   ```
3. **Biblioteca FIDO2:** A biblioteca `libfido2` deve estar instalada no sistema operacional do cliente.
   - No Ubuntu/Debian: `sudo apt install libfido2-1`
   - No Arch Linux: `sudo pacman -S libfido2`
   - No macOS (via Homebrew): `brew install libfido2`
4. **PIN FIDO2 ativo:** A YubiKey precisa ter um PIN de proteção configurado no aplicativo FIDO2 para exigir verificação de usuário (*User Verification*).

---

## Passo a passo de configuração

### Passo 1: Definir um PIN na YubiKey (caso ainda não tenha)

A especificação de segurança FIDO2 exige a definição de um PIN para proteger as chaves residentes. Você pode configurá-lo via Yubico Manager ou pela linha de comando com a ferramenta `ykman`:

```bash
ykman fido access set-pin
```

### Passo 2: Gerar a chave SSH FIDO2 residente

Para gerar uma chave residente do tipo Ed25519 com suporte a hardware, execute o seguinte comando na máquina cliente:

```bash
ssh-keygen -t ed25519-sk -O resident -O application=ssh:servidores-prod -C "admin@digitaltech"
```

Entenda os parâmetros utilizados:
- `-t ed25519-sk`: Define o algoritmo Ed25519 respaldado por chave de segurança (*security key*).
- `-O resident`: Instruciona o dispositivo a salvar a credencial como residente na memória interna da YubiKey.
- `-O application=ssh:servidores-prod`: Rótulo interno (*namespace*) para identificar essa chave específica dentro do dispositivo.
- `-C "admin@digitaltech"`: Comentário para identificação no arquivo de chaves autorizadas.

Durante o processo, o terminal solicitará:
1. O PIN FIDO2 da sua YubiKey.
2. Um toque físico no sensor do dispositivo.
3. Uma *passphrase* opcional para criptografar os arquivos locais de atalho criados.

### Passo 3: Copiar a chave pública para o servidor remoto

Envie a chave pública gerada para o servidor remoto onde deseja se autenticar:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_sk.pub usuario@servidor.exemplo.com
```

Você também pode adicionar manualmente o conteúdo do arquivo `~/.ssh/id_ed25519_sk.pub` ao arquivo `~/.ssh/authorized_keys` no servidor remoto.

---

## Como utilizar a chave residente em um computador novo

A principal vantagem da chave residente é a capacidade de recuperar a credencial em uma máquina na qual você nunca trabalhou antes.

[IMAGEM]
tipo: screenshot
assunto: Terminal executando o comando ssh-add -K e exibindo a chave residente sendo importada da YubiKey
motivo: Mostrar o resultado prático do comando de importação da chave a partir do hardware
[/IMAGEM]

Em um novo computador com a YubiKey conectada, siga um dos métodos abaixo:

### Método A: Adicionar a chave diretamente ao SSH Agent

Você pode carregar a chave residente diretamente na memória da sessão atual sem gerar arquivos em disco:

```bash
ssh-add -K
```

O sistema solicitará o PIN da YubiKey e o toque físico. Em seguida, o `ssh-agent` deixará a chave disponível para as conexões.

### Método B: Extrair o par de arquivos para o disco local

Se preferir recriar os arquivos `id_ed25519_sk` e `id_ed25519_sk.pub` na nova máquina:

```bash
cd ~/.ssh
ssh-keygen -K
```

Isso baixará as chaves residentes gravadas na YubiKey para o diretório atual.

---

## Aumentando a segurança no lado do servidor

Por padrão, o uso da YubiKey no SSH exige toque físico (*User Presence*). Para reforçar a segurança e exigir obrigatoriamente a digitação do PIN (*User Verification*), você pode ajustar as políticas no servidor.

No arquivo `/etc/ssh/sshd_config` do servidor remoto, adicione ou altere a diretiva:

```text
PubkeyAuthOptions verify-required
```

Reinicie o serviço SSH do servidor para aplicar as alterações:

```bash
sudo systemctl restart sshd
```

Com essa opção ativa, conexões que utilizem chaves FIDO2 sem verificação de PIN serão rejeitadas pelo servidor, mesmo que ocorra o toque físico.

---

## Boas práticas e resiliência

- **Tenha uma YubiKey de backup:** Dispositivos físicos podem ser perdidos ou danificados. Configure sempre pelo menos duas YubiKeys (uma principal e uma reserva) e cadastre ambas no arquivo `authorized_keys` dos seus servidores.
- **Limite a quantidade de chaves residentes:** O armazenamento interno FIDO2 dos tokens de hardware é limitado (geralmente entre 25 e 100 slots, dependendo do modelo e firmware). Use um único *namespace* de aplicação para múltiplos servidores sempre que a política de segurança permitir.
- **Manutenção do PIN:** Mantenha seu PIN anotado em um local físico seguro (como um cofre de senhas offline). Se o PIN FIDO2 for inserido incorretamente várias vezes, a interface FIDO2 do dispositivo será bloqueada, exigindo a restauração (*reset*) do módulo FIDO2.
