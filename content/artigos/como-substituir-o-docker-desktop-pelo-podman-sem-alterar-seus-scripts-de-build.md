---
title: "Como Substituir Docker Desktop por Podman Sem Alterar Scripts"
slug: "como-substituir-o-docker-desktop-pelo-podman-sem-alterar-seus-scripts-de-build"
category: "Open Source"
description: "Saiba como migrar do Docker Desktop para o Podman mantendo compatibilidade com scripts de build, docker-compose e CI/CD sem alterar seu código."
date: "2026-09-01 19:43:49.919051+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/22719124/pexels-photo-22719124.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Como Substituir Docker Desktop por Podman Sem Alterar Scripts"
imageAuthor: "Wolfgang Weiser"
---

# Como Substituir o Docker Desktop pelo Podman sem Alterar seus Scripts de Build

A transição de ferramentas no ambiente de desenvolvimento frequentemente levanta preocupações sobre compatibilidade e quebra de automações pré-existentes. O Docker Desktop tornou-se o padrão de fato para a execução de containers em máquinas locais, mas mudanças no licenciamento corporativo e a busca por arquiteturas mais leves impulsionaram a adoção do Podman (Pod Manager).

O Podman é uma ferramenta open source para gerenciamento de containers OCI (Open Container Initiative) que se destaca por funcionar sem um daemon centralizado (*daemonless*) e por executar containers sem privilégios de superusuário (*rootless*) por padrão.

A principal vantagem técnica para equipes de engenharia é que o Podman foi projetado para ser uma substituição direta (*drop-in replacement*) do Docker. Veja como configurar o Podman para responder exatamente aos mesmos comandos, sockets e scripts de build (`docker build`, `docker-compose`, Makefiles e scripts de CI/CD locais) sem alterar nenhuma linha de código.

---

## Arquitetura: Docker vs. Podman

Para entender como a substituição funciona, é essencial compreender a diferença fundamental de arquitetura entre as duas ferramentas:

* **Docker:** Utiliza um modelo cliente-servidor. A CLI do Docker envia requisições via socket REST para um daemon em segundo plano (`dockerd`), que possui privilégios elevados e gerencia a execução dos containers.
* **Podman:** Utiliza uma arquitetura cliente-fork. Ao executar um comando, o Podman dispara diretamente o processo do container (utilizando a biblioteca `crun` ou `runc`) como um filho do processo atual, eliminando a necessidade de um daemon intermediário.

[IMAGEM]
tipo: diagrama
assunto: Comparação entre a arquitetura cliente-daemon do Docker e a arquitetura sem daemon (daemonless) do Podman com socket de emulação
motivo: Explicar visualmente como o Podman consegue interagir com ferramentas legadas através do socket de compatibilidade.
[/IMAGEM]

Para garantir que scripts antigos continuem funcionando, o Podman disponibiliza um serviço de socket que emula a API REST do Docker, permitindo que ferramentas como Testcontainers, pipelines de CI local e o próprio Docker Compose continuem operando normalmente.

---

## Passo 1: Instalação do Podman

A instalação varia conforme o sistema operacional:

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y podman podman-docker
```

### macOS (via Homebrew)

```bash
brew install podman
podman machine init
podman machine start
```

### Windows (via WSL2 / Winget)

```powershell
winget install RedHat.Podman
podman machine init
podman machine start
```

---

## Passo 2: Redirecionando a CLI (`docker` -> `podman`)

Seus scripts de build provavelmente utilizam o comando `docker` (como `docker build -t app:v1 .`). Para redirecionar essa chamada sem modificar os scripts, existem duas abordagens principais.

### Opção A: Utilizar o pacote `podman-docker` (Linux)

Em distribuições Linux, a instalação do pacote `podman-docker` cria um atalho nativo no sistema que redireciona qualquer invocação do binário `docker` para o `podman`.

### Opção B: Configuração de Alias e Symlink (macOS / Linux / WSL)

Você pode adicionar um alias no arquivo de configuração do seu shell (`~/.bashrc` ou `~/.zshrc`):

```bash
alias docker=podman
```

Para garantir que scripts executados em subprocessos (que não carregam os aliases do shell) também funcionem, crie um link simbólico no PATH do sistema:

```bash
sudo ln -s $(which podman) /usr/local/bin/docker
```

---

## Passo 3: Ativando o Socket de Emulação do Docker

Muitas ferramentas de automação não chamam a CLI diretamente, mas conectam-se ao Unix Socket do Docker (`/var/run/docker.sock`). O Podman permite criar um socket equivalente.

### No Linux (Rootless)

Ative o serviço de socket do Podman no nível de usuário com o `systemctl`:

```bash
systemctl --user enable --now podman.socket
```

Em seguida, defina a variável de ambiente `DOCKER_HOST` apontando para o socket do usuário:

```bash
export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/podman/podman.sock"
```

Para manter compatibilidade com ferramentas que procuram estritamente por `/var/run/docker.sock`, crie um symlink:

```bash
sudo ln -s $XDG_RUNTIME_DIR/podman/podman.sock /var/run/docker.sock
```

### No macOS e Windows

Quando a máquina virtual do Podman é iniciada (`podman machine start`), ela expõe um socket local. Você pode checar o caminho do socket com o comando:

```bash
podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
```

Basta exportar essa localização na variável `DOCKER_HOST` no seu perfil de ambiente.

---

## Passo 4: Garantindo Compatibilidade com Docker Compose

Existem duas estratégias para continuar usando o Compose:

1. **Usar o `docker-compose` oficial apontando para o Socket do Podman:** Como ativamos o socket de emulação no Passo 3, o executável padrão do `docker-compose` funcionará de forma transparente.
2. **Usar o `podman-compose`:** Um projeto mantido pela comunidade que traduz arquivos `docker-compose.yml` diretamente em comandos de pods do Podman.

Recomenda-se manter o `docker-compose` oficial conectado ao socket do Podman para evitar discrepâncias de sintaxe em arquivos YAML complexos.

---

## Cuidados e Ajustes Práticos

Embora a transição seja simples, atenção a duas particularidades do modelo Rootless:

* **Portas Privilegiadas (< 1024):** Por padrão, usuários comuns no Linux não podem mapear portas abaixo de 1024 (ex.: porta 80 ou 443). Se seus scripts exigem essas portas, ajuste o `sysctl` no sistema operacional (`net.ipv4.ip_unprivileged_port_start=80`).
* **Permissões de Volumes e Mapeamento de UID:** Como o container roda com o seu ID de usuário comum, a escrita em volumes montados do host respeita rigorosamente as permissões do seu usuário, eliminando problemas de arquivos criados pelo `root` no host.

---

## Conclusão

A migração do Docker Desktop para o Podman pode ser realizada sem causar impacto nas automações de build existentes. Ao utilizar a emulação de CLI, o socket REST compatível e a variável `DOCKER_HOST`, a infraestrutura local ganha em segurança com a execução rootless e reduz o consumo de recursos associado a daemons persistentes.
