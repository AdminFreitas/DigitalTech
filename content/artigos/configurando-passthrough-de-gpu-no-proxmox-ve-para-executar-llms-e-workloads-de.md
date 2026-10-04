---
title: "Configurando Passthrough de GPU no Proxmox VE"
slug: "configurando-passthrough-de-gpu-no-proxmox-ve-para-executar-llms-e-workloads-de"
category: "Hardware"
description: "Guia para configurar passthrough de GPU no Proxmox VE para executar LLMs e workloads de IA locais com melhoria no desempenho"
date: "2026-10-04 19:53:29.035655+00:00"
readTime: "2"
image: "https://images.pexels.com/photos/8622912/pexels-photo-8622912.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
imageAlt: "Configurando Passthrough de GPU no Proxmox VE"
imageAuthor: "Nana  Dua"
---

# Introdução ao Proxmox VE e ao Passthrough de GPU

O Proxmox VE é uma plataforma de virtualização de servidor que oferece uma ampla gama de recursos para a administração de máquinas virtuais. Uma das principais características do Proxmox!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! VE é a capacidade de realizar o passthrough de dispositivos, incluindo placas de vídeo (GPUs), para as máquinas virtuais. Isso é especialmente útil para executar workloads que exigem grande capacidade de processamento gráfico, como os modelos de linguagem grande (LLMs) e outras aplicações de inteligência artificial (IA).

## Por que Configurar o Passthrough de GPU?

A configuração do passthrough de GPU permite que as máquinas virtuais acessem diretamente a placa de vídeo física do host, em vez de utilizar um dispositivo de vídeo virtual. Isso traz várias vantagens, incluindo:

*   Melhoria no desempenho: Ao acessar a GPU física, as máquinas virtuais podem executar tarefas gráficas intensivas com muito mais eficiência do que com um dispositivo de vídeo virtual.
*   Suporte a aplicativos que exigem GPU: Muitos aplicativos de IA e LLMs são projetados para funcionar com GPUs específicas. O passthrough de GPU permite que esses aplicativos sejam executados em máquinas virtuais sem perda de desempenho.

## Requisitos para o Passthrough de GPU

Antes de configurar o passthrough de GPU, é importante garantir que o seu hardware atenda aos requisitos mínimos necessários. Isso inclui:

*   Uma placa-mãe que suporte o passthrough de dispositivos PCI (como a GPU).
*   Uma GPU compatível com o passthrough. A maioria das GPUs modernas suporta isso, mas é sempre uma boa ideia verificar a documentação do fabricante.
*   O Proxmox VE instalado e configurado no servidor.

## Passo a Passo para Configurar o Passthrough de GPU

A configuração do passthrough de GPU no Proxmox VE envolve várias etapas. Aqui está um resumo dos passos necessários:

1.  **Habilitar o IOMMU**: O IOMMU (Input-Output Memory Management Unit) é necessário para o passthrough de dispositivos. Verifique se o IOMMU está habilitado na BIOS ou UEFI do seu servidor.
2.  **Identificar a GPU**: Identifique a GPU que você deseja passar para a máquina virtual. Isso pode ser feito através do comando `lspci` no terminal do Proxmox VE.
3.  **Configurar o Passthrough**: Acesse a interface web do Proxmox VE, vá para a seção de configuração da máquina virtual e adicione o dispositivo PCI correspondente à GPU. Salve as alterações e reinicie a máquina virtual.
4.  **Instalar Drivers**: Certifique-se de que os drivers necessários para a GPU estejam instalados dentro da máquina virtual. Isso pode variar dependendo do sistema operacional e da GPU em uso.

## Considerações Finais

A configuração do passthrough de GPU no Proxmox VE é uma poderosa ferramenta para executar workloads de IA e LLMs locais. No entanto, é crucial garantir que todos os requisitos sejam atendidos e que a configuração seja feita corretamente para evitar problemas de desempenho ou instabilidade. Com as etapas certas e a configuração adequada, você pode desbloquear o verdadeiro potencial das suas máquinas virtuais e dos aplicativos que exigem grande capacidade de processamento gráfico.
