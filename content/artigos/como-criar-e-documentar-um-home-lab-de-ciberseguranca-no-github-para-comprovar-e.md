---
title: "Criar Home Lab de Cibersegurança no GitHub"
slug: "como-criar-e-documentar-um-home-lab-de-ciberseguranca-no-github-para-comprovar-e"
category: "Carreira"
description: "Aprenda a criar e documentar um Home Lab de Cibersegurança no GitHub para demonstrar habilidades práticas em cibersegurança e impulsionar sua carreira em TI"
date: "2026-10-18 12:54:11.039832+00:00"
readTime: "5"
image: "https://images.unsplash.com/photo-1614064548237-096f735f344f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDA2NDQwfDB8MXxzZWFyY2h8M3x8Q3JpYXIlMjBEb2N1bWVudGFyJTIwSG9tZSUyMExhYiUyMENpYmVyc2VndXJhbiVDMyVBN2F8ZW58MHwwfHx8MTc5MjMyODAyNHww&ixlib=rb-4.1.0&q=80&w=400"
imageAlt: "Criar Home Lab de Cibersegurança no GitHub"
imageAuthor: "FlyD"
---

# Como Criar e Documentar um Home Lab de Cibersegurança no GitHub para Comprovar Experiência Prática

Um dos maiores desafios para quem deseja ingressar ou evoluir na área de cibersegurança é o clássico paradoxo do mercado de trabalho: vagas de nível de entrada costumam exigir experiência prévia comprovada. No entanto, demonstrar capacidade técnica não depende exclusivamente de ter trabalhado na área anteriormente. A construção de um **Home Lab** (laboratório caseiro) atrelada a uma documentação rigorosa no **GitHub** tornou-se uma das estratégias mais eficientes para demonstrar domínio prático a recrutadores e gestores técnicos.

Neste artigo, você aprenderá a planejar, implementar e documentar um ambiente de testes de cibersegurança, transformando projetos práticos em evidências auditáveis do seu conhecimento.

---

## 1. O Valor Estratégico de um Home Lab Documentado

Em processos seletivos técnicos, declarações genéricas no currículo como "conhecimento em SIEM" ou "experiência com testes de intrusão" possuem pouco peso sem contexto. Um repositório no GitHub contendo relatórios técnicos, scripts de automação e diagramas de rede funciona como um portfólio auditável.

Para o recrutador ou líder técnico, esse material comprova:

- **Capacidade de execução**: você sabe instalar, configurar e solucionar problemas reais de infraestrutura.
- **Metodologia e rigor**: você entende como registrar logs, analisar eventos e propor mitigações.
- **Comunicação técnica**: você consegue explicar conceitos complexos de forma clara, organizada e profissional.

---

## 2. Planejamento e Arquitetura Mínima do Home Lab

Um laboratório de cibersegurança não exige equipamentos caros ou servidores dedicados. É perfeitamente possível iniciar utilizando virtualização em um computador pessoal com configurações intermediárias (mínimo recomendável de 16 GB de RAM e um processador quad-core).

### Componentes Fundamentais

Um ambiente funcional para estudos de segurança ofensiva (Red Team) e defensiva (Blue Team) deve contar com três zonas virtuais isoladas:

1. **Máquina Atacante**: distribuição especializada contendo ferramentas de análise e teste, como Kali Linux ou Parrot OS.
2. **Máquina Alvo (Vulnerável)**: ambientes intencionalmente vulneráveis, como Metasploitable, DVWA (Damn Vulnerable Web Application) ou instâncias desatualizadas do Windows Server.
3. **Máquina de Monitoramento e Defesa**: soluções de análise de logs e detecção de ameaças, como Wazuh, Suricata ou uma stack ELK (Elasticsearch, Logstash, Kibana).

[IMAGEM]
tipo: diagrama
assunto: Topologia de rede de um Home Lab mostrando o isolamento entre a máquina atacante, alvos vulneráveis e o servidor de monitoramento SIEM
motivo: Explicar visualmente como segmentar a rede virtualizada de forma segura para evitar riscos à rede doméstica
[/IMAGEM]

### Isolamento de Rede

É fundamental utilizar redes virtuais do tipo *Host-Only* ou *Internal Network* no seu hipervisor (VirtualBox, VMware Workstation ou Proxmox). Isso garante que qualquer tráfego malicioso ou simulação de ataque fique estritamente contido no ambiente virtual, sem expor sua rede doméstica ou a internet.

---

## 3. Passo a Passo: Criando um Cenário Prático de Detecção

Para ilustrar como o laboratório opera na prática, veremos o fluxo para estruturar um projeto de detecção de ataques de força bruta SSH utilizando o **Wazuh** (solução SIEM/XDR) integrado a um servidor Linux.

### Etapa 1: Configuração do Coletor de Logs

Após a instalação do agente Wazuh no servidor alvo, edite o arquivo de configuração do agente (`/var/ossec/etc/ossec.conf`) para garantir que os eventos de autenticação sejam monitorados:

```xml
<localfile>
  <log_format>syslog</log_format>
  <location>/var/log/auth.log</location>
</localfile>
```

### Etapa 2: Simulação da Ameaça

A partir da máquina atacante, execute a simulação de força bruta contra o serviço SSH do alvo utilizando uma ferramenta de auditoria de senhas:

```bash
hydra -l usuario_teste -P /usr/share/wordlists/rockyou.txt ssh://192.168.56.101 -t 4
```

### Etapa 3: Análise do Evento

O servidor SIEM correlacionará as falhas consecutivas de autenticação registradas em `/var/log/auth.log` e gerará um alerta de segurança com o nível de gravidade correspondente, permitindo a análise detalhada no painel de controle.

---

## 4. Estruturando o Repositório no GitHub

A organização do seu repositório é determinante para prender a atenção do avaliador. Repositórios desorganizados ou sem explicação costumam ser ignorados.

### Estrutura de Pastas Recomendada

```text
home-lab-cybersecurity/
├── docs/
│   ├── architecture-diagram.png
│   └── setup-guide.md
├── projects/
│   ├── 01-ssh-bruteforce-detection/
│   │   ├── README.md
│   │   ├── logs/
│   │   └── screenshots/
│   └── 02-suricata-ids-rules/
├── scripts/
│   └── parse_logs.py
└── README.md
```

[IMAGEM]
tipo: screenshot
assunto: Exemplo de estrutura de diretórios e arquivo README formatado no GitHub
motivo: Ilustrar a organização limpa e profissional das pastas no repositório do projeto
[/IMAGEM]

---

## 5. Escrevendo um README.md Profissional

O arquivo `README.md` principal do repositório é o seu cartão de visitas. Para cada subprojeto na pasta `projects/`, mantenha um documento individual utilizando o modelo a seguir.

### Modelo de Documentação de Projeto

```markdown
# Detecção de Ataques de Força Bruta SSH via Wazuh SIEM

## 1. Objetivo
Demonstrar a configuração do agente Wazuh para capturar eventos de autenticação SSH e validar a criação de alertas automáticos em cenários de força bruta.

## 2. Topologia do Ambiente
- **Atacante**: Kali Linux (IP: 192.168.56.100)
- **Alvo**: Ubuntu Server 22.04 LTS (IP: 192.168.56.101) com Agente Wazuh
- **SIEM**: Wazuh Manager (IP: 192.168.56.102)

## 3. Metodologia e Execução
1. Configurado o monitoramento do arquivo `/var/log/auth.log`.
2. Executada simulação de ataque com Hydra (4 tentativas por segundo).
3. Analisados os alertas gerados no painel do Wazuh Dashboard.

## 4. Resultados e Evidências
- **Alerta Gerado**: ID 5712 - SSHD brute force attack.
- **Log de Exemplo**: `Failed password for usuario_teste from 192.168.56.100 port 45212 ssh2`

## 5. Mitigações Recomendadas
- Implementação de autenticação exclusiva via chave pública SSH.
- Desativação de login do usuário root via SSH.
- Configuração do serviço `fail2ban` para bloqueio automático de IPs após falhas consecutivas.
```

---

## 6. Como Apresentar o Laboratório em Processos Seletivos

Possuir o repositório estruturado é apenas a primeira etapa; é necessário posicioná-lo estrategicamente em sua apresentação profissional:

- **No Currículo**: Crie uma seção específica chamada "Projetos Práticos e Laboratório" e insira o link direto para o repositório no GitHub.
- **No LinkedIn**: Publique resumos técnicos destacando os cenários que você implementou, explicando o problema, a solução e o aprendizado obtido.
- **Na Entrevista Técnica**: Durante perguntas sobre conhecimentos práticos, mencione a construção do seu laboratório. Em vez de apenas declarar que conhece determinada ferramenta, explique como a configurou, os desafios enfrentados no setup e como estruturou a coleta de evidências.

---

## Conclusão

A criação de um Home Lab combinada com a documentação no GitHub transforma teoria em prova concreta de habilidade. Para profissionais em busca da primeira oportunidade ou em transição de carreira na área de cibersegurança, esse método demonstra proatividade, capacidade técnica e disciplina documental — características essenciais cobradas por equipes de tecnologia e segurança da informação.
