export interface FerramentaItem {
  name: string;
  desc: string;
  to: string;
}

export interface GrupoFerramentas {
  cat: string;
  cor: string;
  itens: FerramentaItem[];
}

// Fonte única das ferramentas reais (rotas confirmadas em
// src/routes/ferramentas/*.tsx). Tanto a página de listagem
// (/ferramentas) quanto a busca (pesquisar()) leem daqui —
// evita ter a mesma lista duplicada em dois arquivos.
export const GRUPOS_FERRAMENTAS: GrupoFerramentas[] = [
  {
    cat: "Texto & Conteúdo",
    cor: "text-[color:var(--primary-cyan)]",
    itens: [
      { name: "Markdown para HTML", desc: "Cole o texto em Markdown e copie o HTML pronto, com preview ao vivo.", to: "/ferramentas/markdown-html" },
      { name: "Reescritor", desc: "Reescreva textos para melhorar clareza, tom ou estilo.", to: "/ferramentas/rewriter" },
      { name: "Resumidor", desc: "Gere resumos concisos de longos artigos ou documentos.", to: "/ferramentas/summarizer" },
      { name: "Tradutor", desc: "Traduza textos entre diferentes idiomas.", to: "/ferramentas/translator" },
      { name: "Gerador de Prompts", desc: "Crie prompts otimizados para modelos de IA generativa.", to: "/ferramentas/prompt-generator" },
      { name: "Keyword Density", desc: "Analisador de densidade de palavras-chave em textos.", to: "/ferramentas/keyword-density" },
    ],
  },
  {
    cat: "SEO",
    cor: "text-[color:var(--secondary-jade)]",
    itens: [
      { name: "Meta Tags", desc: "Gerador e analisador de meta tags para otimização de SEO.", to: "/ferramentas/meta-tags" },
      { name: "Open Graph", desc: "Gerador de meta tags Open Graph para compartilhamento em redes sociais.", to: "/ferramentas/open-graph" },
      { name: "Canonical", desc: "Ferramenta para gerar e validar tags canônicas.", to: "/ferramentas/canonical" },
      { name: "Robots.txt", desc: "Gerador e validador de arquivo robots.txt.", to: "/ferramentas/robots" },
      { name: "Sitemap", desc: "Gerador de sitemap XML para indexação.", to: "/ferramentas/sitemap" },
      { name: "Schema", desc: "Gerador de dados estruturados (Schema.org) para rich snippets.", to: "/ferramentas/schema" },
      { name: "Pixel Helper", desc: "Auxilia na implementação e depuração de pixels de rastreamento.", to: "/ferramentas/pixel-helper" },
      { name: "UTM Builder", desc: "Crie URLs com parâmetros UTM para rastreamento de campanhas.", to: "/ferramentas/utm-builder" },
    ],
  },
  {
    cat: "Dados & Desenvolvimento",
    cor: "text-[color:var(--accent-amber)]",
    itens: [
      { name: "Conversor de Imagens", desc: "Converta JPG, PNG e WebP no navegador.", to: "/ferramentas/conversor-imagens" },
      { name: "Formatador de JSON", desc: "Formate, minifique e valide JSON diretamente no navegador.", to: "/ferramentas/formatador-json" },
      { name: "Gerador de UUID / Hash", desc: "UUIDs e hashes (MD5, SHA-256, etc.).", to: "/ferramentas/uuid" },
      { name: "Hash", desc: "Calcule hashes de strings.", to: "/ferramentas/hash" },
      { name: "Base64", desc: "Codifique e decodifique strings em Base64.", to: "/ferramentas/base64" },
      { name: "Color Picker", desc: "Seletor de cores com códigos em HEX, RGB e HSL.", to: "/ferramentas/color-picker" },
      { name: "Gerador de QR Code", desc: "Gere códigos QR a partir de URLs ou textos.", to: "/ferramentas/qr-code-generator" },
      { name: "Checador de Senha", desc: "Entropia, força e vazamentos conhecidos.", to: "/ferramentas/checador-senha" },
      { name: "Qual é o meu IP", desc: "Consulte seu endereço IP público e informações de localização aproximada.", to: "/ferramentas/meu-ip" },
      { name: "Consulta CPF / CNPJ", desc: "Obtenha informações detalhadas sobre CPF e CNPJ.", to: "/ferramentas/validador-cpf-cnpj" },
      { name: "Gerador de Cartão", desc: "Cartão de teste, formato válido — sem vínculo com conta real.", to: "/ferramentas/gerador-cartao" },
      { name: "Gerador de CEP", desc: "Gere CEPs com formatos brasileiros.", to: "/ferramentas/gerador-cep" },
      { name: "Gerador de CPF / CNPJ", desc: "Gere CPFs e CNPJs com formatos brasileiros.", to: "/ferramentas/gerador-cpf-cnpj" },
    ],
  },
];

// Versão achatada (sem agrupamento) — é o formato que a busca precisa.
export const FERRAMENTAS: FerramentaItem[] = GRUPOS_FERRAMENTAS.flatMap((g) => g.itens);
