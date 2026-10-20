---
title: "Guia Prático: Varreduras de Vulnerabilidades em Redes Linux"
slug: "guia-pratico-como-realizar-varreduras-de-vulnerabilidades-em-redes-linux-com-ope"
category: "Open Source"
description: "Aprenda a realizar varreduras de vulnerabilidades em redes Linux com OpenVAS, uma ferramenta de auditoria de segurança para sistemas open source"
date: "2026-10-20 20:17:27.973521+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1618060932014-4deda4932554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8NXx8R3VpYSUyMFByJUMzJUExdGljbyUyMFJlYWxpemFyJTIwVmFycmVkdXJhcyUyMFZ1bG5lcmFiaWxpZGFkZXN8ZW58MHwwfHx8MTc5MjUyNzQzNnww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Guia Prático: Varreduras de Vulnerabilidades em Redes Linux"
imageAuthor: "FlyD"
---

# Guia Prático: Como Realizar Varreduras de Vulnerabilidades em Redes Linux com OpenVAS

A identificação precoce de falhas em sistemas e dispositivos de rede é uma exigência básica para qualquer estratégia de cibersegurança defensiva. No ecossistema de software livre, o OpenVAS (Open Vulnerability Assessment System) destaca-se como a principal ferramenta para auditoria e análise de vulnerabilidades.

Neste artigo, você entenderá o funcionamento do OpenVAS, seus componentes essenciais e um passo a passo para implementar varreduras eficazes em redes e sistemas operacionais baseados em código aberto.

## O que é o OpenVAS e o Ecossistema GVM

O OpenVAS é o mecanismo de varredura (scanner) que compõe a solução Greenbone Vulnerability Management (GVM). Ele utiliza uma base de dados atualizada constantemente com milhares de NVT (Network Vulnerability Tests) para testar serviços ativos, portas abertas, configurações incorretas e pacotes desatualizados.

A arquitetura do ecossistema é dividida em módulos principais:

* **Greenbone Vulnerability Management Daemon (GVMD):** O serviço central que gerencia tarefas, usuários, relatórios e agendamentos.
* **OpenVAS Scanner:** O motor que de fato realiza os testes contra os alvos definidos.
* **Greenbone Security Assistant (GSA):** A interface web intuitiva para administração do sistema e visualização dos relatórios.
* **Feeds de Vulnerabilidades:** A base de dados de assinaturas mantida pela comunidade ou por assinaturas comerciais.

[IMAGEM]
tipo: diagrama
assunto: Arquitetura funcional do ecossistema GVM com a relação entre GSA, GVMD e o OpenVAS Scanner
motivo: Ajudar o leitor a entender como os serviços internos do OpenVAS se comunicam antes de iniciar a instalação
[/IMAGEM]

## Pré-requisitos do Ambiente

Para executar uma instância estável do OpenVAS em um ambiente corporativo ou de testes, recomenda-se a seguinte infraestrutura mínima:

* **Sistema Operacional:** Linux (Debian, Ubuntu Server ou Kali Linux).
* **Processador:** 4 núcleos de CPU.
* **Memória RAM:** Mínimo de 8 GB (16 GB recomendado para atualizações céleres de feeds).
* **Armazenamento:** 50 GB de disco (preferencialmente SSD) para suporte ao banco de dados PostgreSQL.

## Passo a Passo: Instalação e Configuração

Em distribuições derivadas do Debian, o pacote `gvm` facilita o processo de implantação. Acompanhe os comandos essenciais a seguir.

### 1. Atualização e Instalação dos Pacotes

Primeiramente, atualize os repositórios do sistema e instale a suíte completa do GVM:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install gvm -y
```

### 2. Inicialização e Download das Assinaturas

Após o término da instalação dos pacotes, execute a rotina de configuração automatizada. Este processo irá criar o banco de dados PostgreSQL, sincronizar as listas de NVTs e gerar as credenciais de acesso do usuário administrador.

```bash
sudo gvm-setup
```

*Nota: O download inicial da base de dados de testes pode levar de dezenas de minutos a algumas horas, dependendo da velocidade da sua conexão.*

### 3. Validação do Status dos Serviços

Para confirmar que todos os daemons estão operando corretamente, utilize a ferramenta de verificação nativa:

```bash
sudo gvm-check-setup
```

Se o relatório final indicar "Your GVM-22.x.x installation is OK", a ferramenta estará pronta para uso.

## Executando sua Primeira Varredura de Vulnerabilidades

Com os serviços ativos, acesse a interface gráfica via navegador (geralmente em `https://localhost:9392` ou no IP do servidor configurado).

[IMAGEM]
tipo: screenshot
assunto: Interface de login e painel principal do Greenbone Security Assistant
motivo: Orientar o leitor sobre a navegação inicial na interface gráfica do sistema
[/IMAGEM]

### Passo 1: Definição do Alvo (Target)

1. No menu superior, navegue até **Configuration** > **Targets**.
2. Clique no ícone de estrela azul para criar um novo alvo.
3. Insira o nome do dispositivo ou sub-rede (exemplo: `Servidores_Linux_Internos`).
4. No campo **Hosts**, informe o endereço IP ou a faixa CIDR da rede (exemplo: `192.168.1.0/24`).
5. Escolha a lista de portas a serem testadas (exemplo: `All IANA assigned TCP`).

### Passo 2: Criação da Tarefa (Task)

1. Navegue até **Scans** > **Tasks**.
2. Crie uma nova tarefa selecionando o alvo criado anteriormente.
3. Defina o perfil da varredura (**Scan Config**). Para a maioria dos casos, o perfil **Full and Fast** oferece um equilíbrio ideal entre profundidade de análise e desempenho.

### Passo 3: Execução e Monitoramento

Inicie a tarefa clicando no botão de reprodução (*Play*). O OpenVAS iniciará o envio de pacotes e o teste ativo de serviços nos alvos definidos. O progresso será atualizado em tempo real no painel.

## Varreduras Autenticadas vs. Não Autenticadas

Um ponto crucial para a eficácia da análise é a distinção entre dois tipos de varredura:

* **Varredura Não Autenticada (Externa):** Simula a perspectiva de um atacante externo sem acesso prévio ao sistema. Ela identifica portas abertas, serviços expostos e banners de versão.
* **Varredura Autenticada (Interna):** O OpenVAS utiliza credenciais SSH (no caso do Linux) para acessar o sistema operacional e verificar pacotes vulneráveis instalados diretamente no gerenciador de pacotes (como `apt` ou `rpm`).

Para realizar varreduras autenticadas em servidores Linux, crie uma conta de usuário sem privilégios de superusuário no sistema de destino e cadastre essa credencial em **Configuration** > **Credentials** na interface do GVM.

## Análise e Interpretação do Relatório

Após a conclusão do processo, acesse **Scans** > **Reports** para consultar os resultados. As falhas são classificadas de acordo com a pontuação CVSS (Common Vulnerability Scoring System):

* **Crítica / Alta (7.0 - 10.0):** Exige mitigação imediata (ex.: execução remota de código, serviço desatualizado exposto).
* **Média (4.0 - 6.9):** Falhas de configuração ou vazamento de informações contextuais.
* **Baixa (0.1 - 3.9):** Boas práticas não seguidas ou informações gerais sobre o sistema.

## Boas Práticas na Análise de Vulnerabilidades

* **Evite varreduras cegas em produção:** Execute testes em horários de menor tráfego ou informe a equipe de infraestrutura, pois testes intensivos podem impactar serviços sensíveis.
* **Valide falsos positivos:** Nem todos os alertas gerados representam falhas exploráveis na sua infraestrutura específica. Analise o contexto antes de aplicar correções bruscas.
* **Mantenha os Feeds Atualizados:** Agende a atualização periódica da base de dados de assinaturas (`sudo gvm-feed-update`) para garantir a detecção de ameaças recentes (CVEs novas).
