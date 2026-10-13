---
title: "Guia Prático de OpenSCAP para Segurança Linux"
slug: "guia-pratico-de-openscap-como-automatizar-a-conformidade-de-seguranca-em-ambient"
category: "Open Source"
description: "Aprenda a automatizar a conformidade de segurança em servidores Linux com OpenSCAP, uma ferramenta open source para auditoria e correção de vulnerabilidades"
date: "2026-10-13 16:40:56.866279+00:00"
readTime: "5"
image: "https://images.pexels.com/photos/8439174/pexels-photo-8439174.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Guia Prático de OpenSCAP para Segurança Linux"
imageAuthor: "Pavel Danilyuk"
---

Manter infraestruturas Linux alinhadas a padrões rígidos de segurança é um dos maiores desafios em operações de TI e Segurança da Informação. À medida que o número de servidores cresce, a verificação manual de parâmetros de sistema — como permissões de arquivos, configurações de SSH, regras de firewall e políticas de senha — torna-se impraticável e suscetível a erros humanos.

Para resolver essa complexidade, utiliza-se o **OpenSCAP**, um ecossistema open source que implementa o padrão SCAP (*Security Content Automation Protocol*). O OpenSCAP permite automatizar a auditoria de vulnerabilidades e a verificação de conformidade de sistemas operacionalizados em Linux com base em perfis consolidados no mercado, como CIS (*Center for Internet Security*), STIG (*Security Technical Implementation Guides*) e PCI-DSS.

Neste artigo, você entenderá a arquitetura básica do OpenSCAP e aprenderá a executar auditorias e gerar relatórios e scripts de correção automatizados.

## Conceitos Fundamentais do Ecossistema SCAP

Antes de executar comandos no terminal, é importante compreender a estrutura de padrões mantida pelo NIST (*National Institute of Standards and Technology*):

*   **SCAP (Security Content Automation Protocol):** Uma especificação que padroniza o formato como as configurações de segurança e vulnerabilidades são expressas.
*   **XCCDF (Extensible Configuration Checklist Description Format):** Formato XML usado para estruturar listas de verificação (*checklists*), perfis de conformidade e regras de endurecimento (*hardening*).
*   **OVAL (Open Vulnerability and Assessment Language):** Linguagem declarativa usada para codificar os testes operacionais (por exemplo, verificar se um pacote específico está instalado ou se uma variável no `/etc/sysctl.conf` tem o valor correto).
*   **SSG (SCAP Security Guide):** O pacote de conteúdo prático que contém os guias e perfis pré-definidos para distribuições Linux como Red Hat Enterprise Linux, Fedora, Ubuntu, Debian e SUSE.

[IMAGEM]
tipo: diagrama
assunto: Fluxo de trabalho do OpenSCAP recebendo conteúdo SCAP e gerando relatórios e scripts de remediação
motivo: Explicar como a ferramenta consome os arquivos XCCDF/OVAL para auditar o sistema e produzir os artefatos finais
[/IMAGEM]

## Passo 1: Instalação do OpenSCAP e do Conteúdo de Segurança

A ferramenta principal de linha de comando é o `oscap`, fornecido pelo pacote `openscap-scanner`. O conteúdo com os perfis de conformidade é fornecido pelo pacote `scap-security-guide`.

### Em distribuições baseadas em RHEL / CentOS / Fedora:

```bash
sudo dnf install -y openscap-scanner scap-security-guide
```

### Em distribuições baseadas em Ubuntu / Debian:

```bash
sudo apt update
sudo apt install -y libopenscap8 ssg-debian ssg-ubuntu
```

Após a instalação, os arquivos de conteúdo XML (conhecidos como Datastreams) ficam armazenados no diretório `/usr/share/xml/scap/ssg/content/`.

## Passo 2: Listando Perfis Disponíveis

Os arquivos de Datastream agrupam múltiplos perfis de conformidade. Para visualizar quais perfis estão disponíveis para o seu sistema operacional, utilize o comando `oscap info` apontando para o arquivo correspondente.

Exemplo para RHEL 9 / Rocky Linux 9:

```bash
oscap info /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml
```

A saída exibirá dados estruturados incluindo a seção **Profiles**. Você verá identificadores semelhantes a:

*   `xccdf_org.ssgproject.content_profile_cis`: Perfil alinhado ao padrão CIS Benchmark.
*   `xccdf_org.ssgproject.content_profile_pci-dss`: Perfil direcionado a ambientes que processam dados de cartão de crédito.
*   `xccdf_org.ssgproject.content_profile_hipaa`: Perfil voltado para normas de privacidade em saúde.

## Passo 3: Executando uma Auditoria de Conformidade

Para auditar o sistema atual em relação a um perfil específico, utiliza-se o subcomando `xccdf eval`. O parâmetro `--report` gera um relatório em HTML visualmente amigável para análise posterior.

Executando uma verificação com o perfil CIS Benchmark em um servidor RHEL/Enterprise Linux:

```bash
sudo oscap xccdf eval \
  --profile xccdf_org.ssgproject.content_profile_cis \
  --report /var/www/html/relatorio-conformidade.html \
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml
```

Durante o processo, o OpenSCAP executará dezenas ou centenas de verificações individuais. No terminal, cada item exibirá um status:

*   `pass`: O sistema atende ao requisito.
*   `fail`: O sistema viola a regra de segurança.
*   `notapplicable`: A regra não se aplica ao ambiente atual.

Ao final da execução, abra o arquivo `relatorio-conformidade.html` em um navegador para visualizar a pontuação geral de conformidade (*Compliance Score*), a justificativa detalhada de cada falha e o impacto das configurações.

## Passo 4: Automatizando a Remediação de Falhas

Identificar não conformidades é apenas metade do trabalho. O OpenSCAP também permite gerar artefatos para corrigir (*remediar*) as falhas encontradas de forma automática.

Existem duas estratégias principais para remediação:

### Estratégia A: Gerar um script Bash de correção

Você pode extrair todas as correções necessárias para um script Shell editável antes de executá-lo:

```bash
oscap xccdf generate fix \
  --profile xccdf_org.ssgproject.content_profile_cis \
  --template urn:xccdf:fix:script:sh \
  --output script-correcao.sh \
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml
```

Recomenda-se inspecionar o conteúdo de `script-correcao.sh` antes de sua execução em ambientes produtivos.

### Estratégia B: Gerar um Playbook Ansible

Caso sua infraestrutura utilize gerenciamento de configuração via Ansible, é possível exportar as correções no formato de Playbook:

```bash
oscap xccdf generate fix \
  --profile xccdf_org.ssgproject.content_profile_cis \
  --template urn:xccdf:fix:script:ansible \
  --output playbook-correcao.yml \
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml
```

## Cuidados e Boas Práticas ao Automatizar Remediações

A aplicação automatizada de perfis rígidos de *hardening* (como CIS Nível 2 ou STIG) pode indisponibilizar serviços caso parâmetros críticos sejam alterados sem validação prévia. Entre os problemas comuns resultantes de remediações cegas, destacam-se:

1.  **Bloqueio de acesso SSH:** Alterações em métodos de autenticação autorizados sem a devida substituição de chaves públicas.
2.  **Particionamento e Pontos de Montagem:** Regras que exigem partições separadas (como `/var/log` ou `/tmp`) com opções `nodev`, `nosuid` e `noexec` podem quebrar aplicações que gravam scripts executáveis nesses diretórios.
3.  **Restrições de Serviços de Rede:** Desativação automática de interfaces ou módulos de kernel necessários para a infraestrutura.

**Recomendação editorial:** Trate os relatórios do OpenSCAP como um guia de auditoria contínua. Sempre valide os scripts ou playbooks em um ambiente de homologação idêntico ao de produção antes de aplicar correções em massa.

## Integração em Esteiras de CI/CD e Agendamentos

Para garantir conformidade contínua (*Continuous Compliance*), o OpenSCAP pode ser integrado a *cron jobs*, *systemd timers* ou pipelines de construção de imagens (como Packer ou Image Builder). Dessa forma, imagens de máquinas virtuais e contêineres já chegam ao ambiente de implantação pré-auditadas e dentro dos padrões operacionais definidos pela equipe de segurança.
