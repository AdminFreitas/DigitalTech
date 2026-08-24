---
title: "Como Configurar o USBGuard no Linux Contra Ataques BadUSB"
slug: "como-configurar-o-usbguard-no-linux-para-bloquear-dispositivos-e-ataques-de-badu"
category: "Hardware"
description: "Proteja seu sistema Linux contra ataques de BadUSB configurando o USBGuard para controlar e bloquear dispositivos USB não autorizados no kernel."
date: "2026-08-24 13:50:54.863413+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1709660850064-0ec82e1a6b5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NXx8Y29uZmlndXJhciUyMFVTQkd1YXJkJTIwTGludXglMjBibG9xdWVhciUyMGRpc3Bvc2l0aXZvc3xlbnwwfDB8fHwxNzg3NTc5NDQyfDA&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Como Configurar o USBGuard no Linux Contra Ataques BadUSB"
imageAuthor: "Barry A"
---

# Proteção física no Linux: Como configurar o USBGuard contra ataques BadUSB

A segurança da informação costuma priorizar ameaças virtuais, como malwares, phishing e invasões remotas. No entanto, a camada física permanece como um dos vetores de ataque mais críticos e negligenciados. Um pen drive abandonado em uma área comum ou um dispositivo USB adulterado conectado por alguns segundos pode comprometer totalmente a integridade de um sistema.

Os ataques conhecidos como **BadUSB** exploram a arquitetura do barramento USB. Dispositivos maliciosos dessa classe não atuam apenas como unidades de armazenamento, mas alteram seu firmware para emular teclados, placas de rede ou outros periféricos confiáveis. Dessa forma, conseguem injetar comandos em alta velocidade ou redirecionar o tráfego de dados do sistema operacional.

Para conter essa ameaça, o ecossistema Linux dispõe do **USBGuard**, um framework de segurança projetado para implementar políticas rigorosas de autorização de hardware no nível do sistema operacional.

---

## O que é o USBGuard e como ele funciona?

O USBGuard funciona de maneira análoga a um **firewall de rede**, mas aplicado diretamente às portas físicas do computador. Em vez de filtrar pacotes IP com base em endereços e portas, o USBGuard intercepta e filtra os eventos de conexão e a enumeração de dispositivos no barramento USB.

Quando um novo dispositivo é conectado, o kernel do Linux detecta o hardware, mas o USBGuard bloqueia a atribuição de drivers até que as regras definidas pelo administrador sejam validadas.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de interceptação do USBGuard entre a porta física USB, o kernel Linux e a aplicação das regras de bloqueio ou permissão
motivo: Ajuda o leitor a compreender visualmente o momento em que o USBGuard intervém antes da inicialização do driver do dispositivo
[/IMAGEM]

O motor de regras do USBGuard avalia atributos específicos transmitidos pelo hardware, tais como:

- **Vendor ID (VID)** e **Product ID (PID)**: Identificadores numéricos do fabricante e do modelo.
- **Número de série**: Identificador individual do dispositivo (quando presente).
- **Classe de interface**: Define a função do dispositivo (armazenamento, teclado, mouse, áudio, etc.).
- **Porta física**: O caminho exato do barramento ou da porta onde o periférico foi conectado.

---

## Passo a passo: instalando e configurando o USBGuard

### 1. Instalação do pacote

O USBGuard está disponível nos repositórios oficiais das principais distribuições Linux.

No **Debian / Ubuntu / Linux Mint**:
```bash
sudo apt update
sudo apt install usbguard
```

No **Fedora / RHEL**:
```bash
sudo dnf install usbguard
```

No **Arch Linux**:
```bash
sudo pacman -S usbguard
```

---

### 2. Gerando a política inicial de dispositivos conhecidos

Antes de ativar o bloqueio automático, é indispensável criar uma regra inicial que permita os dispositivos já conectados e em uso (como teclado, mouse e hubs internos). Caso contrário, você pode perder o controle do sistema assim que o serviço for iniciado.

Execute o comando a seguir para gerar uma política baseada nos periféricos atualmente ativos:

```bash
usbguard generate-policy > rules.conf
```

Inspecione o conteúdo do arquivo gerado para verificar quais dispositivos foram capturados:

```bash
cat rules.conf
```

Agora, instale esse arquivo no diretório oficial de configuração com as permissões restritas corretas:

```bash
sudo install -m 0600 -o root -g root rules.conf /etc/usbguard/rules.conf
```

---

### 3. Habilitando e iniciando o serviço

Com o arquivo de política posicionado, ative e inicie o daemon do USBGuard via `systemctl`:

```bash
sudo systemctl enable --now usbguard
```

A partir deste momento, qualquer novo dispositivo inserido em uma porta USB que não conste explicitamente na política será bloqueado por padrão (política de *default deny*).

---

## Gerenciando dispositivos via linha de comando

O utilitário `usbguard` permite listar, autorizar e revogar dispositivos em tempo real, sem a necessidade de reiniciar o sistema.

### Listar dispositivos detectados

Para visualizar todos os dispositivos conhecidos pelo USBGuard e seus respectivos status:

```bash
sudo usbguard list-devices
```

A saída exibirá um ID numérico para cada dispositivo, seu estado (`allow`, `block` ou `reject`) e os atributos do hardware:

```text
1: allow id 1d6b:0002 serial "0000:00:14.0" name "xHCI Host Controller" hash "..." at "usb1" via-port "usb1" with-interface 09:00:00
2: block id 058f:6387 serial "000000000001" name "Mass Storage Device" hash "..." at "1-1" via-port "1-1" with-interface 08:06:50
```

### Autorizar um dispositivo bloqueado

Ao conectar um pen drive legítimo, ele será bloqueado por padrão. Para autorizá-lo temporariamente nesta sessão, utilize o ID atribuído na listagem (por exemplo, ID `2`):

```bash
sudo usbguard allow-device 2
```

Para tornar essa permissão **permanente** (salvando a nova regra diretamente no arquivo `/etc/usbguard/rules.conf`), inclua a flag `-p`:

```bash
sudo usbguard allow-device 2 -p
```

### Bloquear ou rejeitar um dispositivo

Para alterar o estado de um dispositivo ativo para bloqueado:

```bash
sudo usbguard block-device 2
```

Existe uma diferença técnica relevante entre os comandos de restrição:
- **`block`**: Mantém a interface lógica do dispositivo silenciada e inativa.
- **`reject`**: Força o desligamento lógico do dispositivo no nível do barramento USB.

---

## Boas práticas e refinamento de segurança

1. **Evite autorizar periféricos apenas por VID/PID**: Ferramentas de ataque físico avançadas (como Rubber Ducky ou MalDuino) permitem clonar facilmente o VID e o PID de teclados comerciais populares. Sempre que possível, inclua parâmetros como o número de série e as interfaces permitidas na regra.
2. **Vincule regras às portas físicas**: Se um servidor possui um teclado fixo na porta `1-1`, especifique o parâmetro `via-port "1-1"` na regra. Isso impede que um invasor remova o teclado e conecte um dispositivo malicioso na mesma porta tentando herdar a autorização.
3. **Auditoria constante via logs**: Para acompanhar em tempo real as tentativas de conexão bloqueadas ou autorizadas, monitore os logs do daemon:
   ```bash
   sudo journalctl -u usbguard -f
   ```

## Conclusão

O USBGuard adiciona uma camada essencial de proteção em profundidade para computadores e servidores que operam em ambientes fisicamente acessíveis ou de alto risco. A adoção de uma postura de negação padrão em relação a hardwares desconhecidos é a abordagem mais eficaz para neutralizar vetores de ataque baseados em emulação de periféricos.
