---
title: "Configurar TPM 2.0 para desbloquear discos LUKS2 no Linux"
slug: "configurando-tpm-20-para-desbloquear-discos-luks2-no-linux-com-systemd-cryptenro"
category: "Hardware"
description: "Guia prático para usar TPM 2.0 como chave de desbloqueio automático de discos criptografados com LUKS2 no Linux usando systemd-cryptenroll."
date: "2026-08-24 17:23:22.142401+00:00"
readTime: "4"
image: "https://images.unsplash.com/photo-1762340275855-ae8f4c2c144e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8Q29uZmlndXJhbmRvJTIwVFBNJTIwMi4wJTIwZGVzYmxvcXVlYXIlMjBkaXNjb3N8ZW58MHwwfHx8MTc4NzU5MjE5N3ww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Configurar TPM 2.0 para desbloquear discos LUKS2 no Linux"
imageAuthor: "Zulfugar Karimov"
---

# Configurando TPM 2.0 para desbloquear discos criptografados com LUKS2 no Linux

## Introdução

A criptografia de discos é fundamental para proteger dados sensíveis em sistemas Linux. O LUKS2 (Linux Unified Key Setup) é o padrão mais usado para essa finalidade, mas até recentemente a integração com hardware de segurança como o TPM (Trusted Platform Module) era limitada.

Com o `systemd-cryptenroll`, é possível configurar o TPM 2.0 como mecanismo de desbloqueio automático para volumes LUKS2. Isso dispensa a entrada manual de senhas em ambientes confiáveis.

Este guia explica como configurar essa integração, desde os requisitos até a verificação final do funcionamento.

---

## Conceitos fundamentais

### O que é TPM 2.0?

O TPM (Trusted Platform Module) é um chip de segurança embarcado em muitos computadores modernos. Ele armazena chaves criptográficas e valida a integridade do sistema antes de liberar dados criptografados.

O TPM 2.0 é a versão mais recente e suporta algoritmos modernos como SHA-256 e algoritmos assimétricos.

### LUKS2 e suas vantagens

O LUKS2 é a segunda versão do padrão LUKS, que gerencia a criptografia de volumes no Linux. Diferente de seu predecessor, oferece:

- Suporte a metadados binários
- Melhor gerenciamento de chaves
- Integração com `systemd` para políticas de segurança
- Compatibilidade com TPM 2.0

### systemd-cryptenroll

O `systemd-cryptenroll` é uma ferramenta introduzida no systemd 249 que permite registrar chaves de desbloqueio de volume diretamente no TPM 2.0. Isso inclui:

- Chaves baseadas em PCR (Platform Configuration Registers)
- Chaves baseadas em tentativas de autenticação bem-sucedidas
- Integração com políticas de segurança do sistema

---

## Requisitos

Antes de prosseguir, verifique se seu sistema atende aos requisitos:

1. **Hardware:** Computador com TPM 2.0 ativado (verifique na BIOS/UEFI)
2. **Kernel:** Linux 5.10 ou superior (recomendado 5.15+)
3. **systemd:** Versão 249 ou superior
4. **LUKS2:** Volume já configurado com LUKS2
5. **Ferramentas:** `cryptsetup`, `tpm2-tools`, `systemd-cryptenroll` instalados

Para instalar as ferramentas necessárias em distribuições baseadas em Debian/Ubuntu:

```bash
sudo apt update
sudo apt install cryptsetup tpm2-tools systemd
```

Em distribuições baseadas em RHEL/Fedora:

```bash
sudo dnf install cryptsetup tpm2-tools systemd
```

---

## Passo a passo: Configurando TPM 2.0 para LUKS2

### 1. Verificar suporte ao TPM 2.0

Primeiro, confirme que o TPM 2.0 está disponível no sistema:

```bash
ls /dev/tpm* /dev/tpmrm*
```

Se `/dev/tpmrm0` existir, seu TPM 2.0 está acessível. Caso contrário, verifique na BIOS/UEFI se o TPM está ativado.

Para verificar a versão do TPM:

```bash
tpm2_getcap properties-fixed | grep TPM2_PT_FIRMWARE_VERSION_1
```

---

### 2. Verificar o estado do volume LUKS2

Identifique o dispositivo do volume criptografado:

```bash
sudo cryptsetup luksDump /dev/nvme0n1p3
```

Substitua `/dev/nvme0n1p3` pelo seu dispositivo real. O comando deve retornar informações como:

```
LUKS header information for /dev/nvme0n1p3
Version:        2
Cipher name:    aes
Cipher mode:    xts-plain64
Hash spec:      sha256
Data segments:
  0: crypt
     offset: 16384 [bytes]
     length: (whole device)
     cipher: aes-xts-plain64
```

---
### 3. Registrar a chave no TPM 2.0

O `systemd-cryptenroll` registra uma chave no TPM 2.0 de duas formas principais:

#### Opção A: Usando PCRs (Platform Configuration Registers)

Os PCRs armazenam medidas de integridade do sistema. O TPM só libera a chave se os PCRs estiverem em um estado esperado.

Para registrar uma chave usando PCRs:

```bash
sudo systemd-cryptenroll --tpm2-pcrs=0+2+7 /dev/nvme0n1p3
```

Neste exemplo:
- `--tpm2-pcrs=0+2+7` define que os PCRs 0, 2 e 7 devem estar em um estado específico para liberar a chave
- O volume `/dev/nvme0n1p3` será modificado para incluir essa nova chave

#### Opção B: Usando uma senha existente

Se já existir uma senha configurada no volume, é possível registrar essa senha no TPM:

```bash
sudo systemd-cryptenroll --tpm2-with-pin=true /dev/nvme0n1p3
```

Isso permite que, após autenticação com a senha, o TPM armazene uma chave para desbloqueio automático.

---
### 4. Verificar a configuração

Após registrar a chave, verifique se ela foi adicionada corretamente:

```bash
sudo systemd-cryptenroll --list-keys /dev/nvme0n1p3
```

A saída deve mostrar algo como:

```
KEY FILE:
/var/lib/systemd/cryptsetup/keys/systemd-tpm2-00000000-0000-00-0000-000000000000
FINGERPRINT: sha256:abc123...
```

---
### 5. Configurar o desbloqueio automático

Para que o sistema use automaticamente o TPM 2.0 durante o boot, edite o arquivo de unidade do systemd correspondente:

```bash
sudo systemd-cryptsetup-generator /etc/crypttab
```

Em seguida, verifique o arquivo `/etc/crypttab`:

```bash
cat /etc/crypttab
```

Ele deve conter uma linha semelhante a:

```
cryptroot  /dev/nvme0n1p3  /etc/luks/keys/cryptroot  discard
```

Para volumes que usam TPM, a configuração geralmente é gerada automaticamente quando o TPM é detectado como chave válida.

---
### 6. Testar o desbloqueio

Reinicie o sistema e verifique se o volume é desbloqueado automaticamente:

```bash
sudo reboot
```

Após o reboot, verifique se o volume está montado:

```bash
mount | grep crypt
```
