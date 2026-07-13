export type CategoriaFerramenta = 'SEO' | 'IA' | 'Desenvolvimento' | 'Marketing'

export interface Ferramenta {
  /** identificador único, usado como key */
  slug: string
  nome: string
  descricao: string
  categoria: CategoriaFerramenta
  /** emoji usado como ícone do card */
  icone: string
  /**
   * 'react'  -> navegação interna via TanStack Router (ex: /ferramentas/meta-tags)
   * 'html'   -> página estática servida de public/ferramentas/... (ex: /ferramentas/imagens/compressor.html)
   */
  tipo: 'react' | 'html'
  /** caminho completo usado no link do card */
  path: string
}

/**
 * Catálogo único do hub de Ferramentas.
 * Para adicionar uma nova ferramenta React: crie o arquivo em
 * src/routes/ferramentas/{slug}.tsx e adicione um item aqui com tipo: 'react'.
 * Para adicionar uma ferramenta estática: coloque o .html em public/ferramentas/...
 * e adicione um item aqui com tipo: 'html' apontando o path exato do arquivo.
 */
export const ferramentas: Ferramenta[] = [
  // ── SEO (React) ──────────────────────────────────────────
  { slug: 'meta-tags', nome: 'Meta Tags', descricao: 'Gere tags de título, descrição, canonical, Open Graph e Twitter Card.', categoria: 'SEO', icone: '🏷️', tipo: 'react', path: '/ferramentas/meta-tags' },
  { slug: 'sitemap', nome: 'Sitemap', descricao: 'Monte um sitemap.xml a partir de uma lista de URLs.', categoria: 'SEO', icone: '🗺️', tipo: 'react', path: '/ferramentas/sitemap' },
  { slug: 'robots', nome: 'Robots.txt', descricao: 'Gere regras de allow/disallow e aponte o sitemap para os crawlers.', categoria: 'SEO', icone: '🤖', tipo: 'react', path: '/ferramentas/robots' },
  { slug: 'schema', nome: 'Schema', descricao: 'Gere dados estruturados JSON-LD (Organization, Article, Product, FAQ).', categoria: 'SEO', icone: '🧩', tipo: 'react', path: '/ferramentas/schema' },
  { slug: 'canonical', nome: 'Canonical', descricao: 'Gere a tag <link rel="canonical"> ideal para sua URL.', categoria: 'SEO', icone: '🔗', tipo: 'react', path: '/ferramentas/canonical' },
  { slug: 'keyword-density', nome: 'Keyword Density', descricao: 'Analise a densidade de palavras-chave em um texto.', categoria: 'SEO', icone: '📊', tipo: 'react', path: '/ferramentas/keyword-density' },
  { slug: 'open-graph', nome: 'Open Graph', descricao: 'Pré-visualize e gere tags Open Graph para redes sociais.', categoria: 'SEO', icone: '🖼️', tipo: 'react', path: '/ferramentas/open-graph' },

  // ── IA (React) ───────────────────────────────────────────
  { slug: 'prompt-generator', nome: 'Gerador de Prompts', descricao: 'Monte prompts estruturados para diferentes tarefas com IA.', categoria: 'IA', icone: '✨', tipo: 'react', path: '/ferramentas/prompt-generator' },
  { slug: 'rewriter', nome: 'Reescritor', descricao: 'Reescreva textos em diferentes tons e estilos.', categoria: 'IA', icone: '📝', tipo: 'react', path: '/ferramentas/rewriter' },
  { slug: 'translator', nome: 'Tradutor', descricao: 'Traduza textos entre múltiplos idiomas.', categoria: 'IA', icone: '🌐', tipo: 'react', path: '/ferramentas/translator' },
  { slug: 'summarizer', nome: 'Resumidor', descricao: 'Resuma textos longos em poucos parágrafos.', categoria: 'IA', icone: '📄', tipo: 'react', path: '/ferramentas/summarizer' },

  // ── Desenvolvimento (React) ────────────────────────────────
  { slug: 'json-formatter', nome: 'JSON Formatter', descricao: 'Formate, valide e minifique JSON.', categoria: 'Desenvolvimento', icone: '{ }', tipo: 'react', path: '/ferramentas/json-formatter' },
  { slug: 'base64', nome: 'Base64 (texto)', descricao: 'Codifique e decodifique texto em Base64.', categoria: 'Desenvolvimento', icone: '🔐', tipo: 'react', path: '/ferramentas/base64' },
  { slug: 'uuid', nome: 'UUID', descricao: 'Gere identificadores UUID v4.', categoria: 'Desenvolvimento', icone: '🆔', tipo: 'react', path: '/ferramentas/uuid' },
  { slug: 'hash', nome: 'Hash', descricao: 'Gere hashes MD5, SHA-1 e SHA-256.', categoria: 'Desenvolvimento', icone: '#️⃣', tipo: 'react', path: '/ferramentas/hash' },
  { slug: 'color-picker', nome: 'Color Picker', descricao: 'Escolha cores e converta entre HEX, RGB e HSL.', categoria: 'Desenvolvimento', icone: '🎨', tipo: 'react', path: '/ferramentas/color-picker' },

  // ── Desenvolvimento (HTML estático em public/ferramentas) ───
  { slug: 'markdown-html', nome: 'Markdown para HTML', descricao: 'Cole o texto e copie o HTML gerado.', categoria: 'Desenvolvimento', icone: '📃', tipo: 'html', path: '/ferramentas/gerador/conversor-markdown-html.html' },
  { slug: 'gerador-cartao', nome: 'Gerador de Cartão', descricao: 'Dados de cartão para testes.', categoria: 'Desenvolvimento', icone: '💳', tipo: 'html', path: '/ferramentas/gerador/gerador-cartao.html' },
  { slug: 'gerador-cpf', nome: 'Gerador de CPF', descricao: 'Gere CPFs válidos para testes.', categoria: 'Desenvolvimento', icone: '🪪', tipo: 'html', path: '/ferramentas/gerador/gerador-cpf.html' },
  { slug: 'gerador-email', nome: 'Gerador de E-mail', descricao: 'E-mails temporários para testes.', categoria: 'Desenvolvimento', icone: '📧', tipo: 'html', path: '/ferramentas/gerador/gerador-email.html' },
  { slug: 'gerador-senha', nome: 'Gerador de Senha', descricao: 'Senhas fortes e seguras, geradas localmente.', categoria: 'Desenvolvimento', icone: '🔑', tipo: 'html', path: '/ferramentas/gerador/gerador-senha.html' },
  { slug: 'testador-regex', nome: 'Testador de Regex', descricao: 'Padrões PCRE com explicação visual.', categoria: 'Desenvolvimento', icone: '🧪', tipo: 'html', path: '/ferramentas/gerador/testador-regex.html' },
  { slug: 'validador-cpf', nome: 'Validador de CPF', descricao: 'Valide se um CPF é válido.', categoria: 'Desenvolvimento', icone: '✅', tipo: 'html', path: '/ferramentas/seguranca/validador-cpf.html' },
  { slug: 'verificador-senha', nome: 'Verificador de Senha', descricao: 'Analise a força da sua senha.', categoria: 'Desenvolvimento', icone: '🛡️', tipo: 'html', path: '/ferramentas/seguranca/verificador-senha.html' },
  { slug: 'verificador-vazamento', nome: 'Verificador de Vazamento', descricao: 'Veja se sua senha já foi vazada.', categoria: 'Desenvolvimento', icone: '⚠️', tipo: 'html', path: '/ferramentas/seguranca/verificador-vazamento-senha.html' },
  { slug: 'meu-ip', nome: 'Meu IP', descricao: 'Descubra seu IP público.', categoria: 'Desenvolvimento', icone: '📡', tipo: 'html', path: '/ferramentas/rede/meu-ip.html' },
  { slug: 'compressor-imagens', nome: 'Compressor de Imagens', descricao: 'Reduza JPG, PNG e WebP no navegador.', categoria: 'Desenvolvimento', icone: '🗜️', tipo: 'html', path: '/ferramentas/imagens/compressor.html' },
  { slug: 'cortar-imagem', nome: 'Cortar Imagem', descricao: 'Recorte imagens no navegador.', categoria: 'Desenvolvimento', icone: '✂️', tipo: 'html', path: '/ferramentas/imagens/cortar.html' },
  { slug: 'redimensionar-imagem', nome: 'Redimensionar Imagem', descricao: 'Redimensione imagens online.', categoria: 'Desenvolvimento', icone: '📐', tipo: 'html', path: '/ferramentas/imagens/redimensionar.html' },
  { slug: 'jpg-para-pdf', nome: 'JPG para PDF', descricao: 'Converta imagens JPG em PDF.', categoria: 'Desenvolvimento', icone: '📎', tipo: 'html', path: '/ferramentas/imagens/jpg-para-pdf.html' },
  { slug: 'pdf-para-jpg', nome: 'PDF para JPG', descricao: 'Converta páginas PDF em imagens JPG.', categoria: 'Desenvolvimento', icone: '📎', tipo: 'html', path: '/ferramentas/imagens/pdf-para-jpg.html' },
  { slug: 'base64-imagem', nome: 'Base64 (imagem)', descricao: 'Codifique e decodifique imagens em Base64.', categoria: 'Desenvolvimento', icone: '🖼️', tipo: 'html', path: '/ferramentas/imagens/conversor-base64.html' },

  // ── Marketing (React) ──────────────────────────────────────
  { slug: 'utm-builder', nome: 'UTM Builder', descricao: 'Monte links com parâmetros UTM para campanhas.', categoria: 'Marketing', icone: '📈', tipo: 'react', path: '/ferramentas/utm-builder' },
  { slug: 'pixel-helper', nome: 'Pixel Helper', descricao: 'Valide a instalação de pixels de rastreamento.', categoria: 'Marketing', icone: '📍', tipo: 'react', path: '/ferramentas/pixel-helper' },
  { slug: 'qr-code-generator', nome: 'Gerador de QR Code', descricao: 'Gere QR Codes para links, texto ou contato.', categoria: 'Marketing', icone: '🔳', tipo: 'react', path: '/ferramentas/qr-code-generator' },

  // ── Marketing (Calculadoras HTML — versões financeiras/trabalhistas) ─
  { slug: 'juros-compostos', nome: 'Juros Compostos', descricao: 'Calcule o crescimento de investimentos.', categoria: 'Marketing', icone: '📊', tipo: 'html', path: '/ferramentas/calculadoraIA/financeiras/juros-compostos/index.html' },
  { slug: 'margem-de-lucro', nome: 'Margem de Lucro', descricao: 'Calcule a margem ideal para seus produtos.', categoria: 'Marketing', icone: '💹', tipo: 'html', path: '/ferramentas/calculadoraIA/financeiras/margem-de-lucro/index.html' },
  { slug: 'roi', nome: 'ROI', descricao: 'Calcule o retorno sobre investimento.', categoria: 'Marketing', icone: '📈', tipo: 'html', path: '/ferramentas/calculadoraIA/financeiras/roi/index.html' },
  { slug: 'simulador-emprestimo', nome: 'Simulador de Empréstimo', descricao: 'Simule parcelas e juros de um empréstimo.', categoria: 'Marketing', icone: '🏦', tipo: 'html', path: '/ferramentas/calculadoraIA/financeiras/simulador-emprestimo/index.html' },
  { slug: 'fgts', nome: 'FGTS', descricao: 'Calcule o FGTS acumulado.', categoria: 'Marketing', icone: '🏛️', tipo: 'html', path: '/ferramentas/calculadoraIA/trabalhistas/fgts/index.html' },
  { slug: 'rescisao', nome: 'Rescisão Trabalhista', descricao: 'Calcule verbas rescisórias.', categoria: 'Marketing', icone: '📋', tipo: 'html', path: '/ferramentas/calculadoraIA/trabalhistas/rescisao/index.html' },
  { slug: 'horas-extras', nome: 'Horas Extras', descricao: 'Calcule o valor de horas extras trabalhadas.', categoria: 'Marketing', icone: '⏱️', tipo: 'html', path: '/ferramentas/calculadoraIA/trabalhistas/horas-extras/index.html' },
  { slug: 'salario-liquido', nome: 'Salário Líquido', descricao: 'Calcule o salário líquido com descontos.', categoria: 'Marketing', icone: '💵', tipo: 'html', path: '/ferramentas/calculadoraIA/trabalhistas/salario-liquido/index.html' },
  { slug: 'aposentadoria', nome: 'Aposentadoria', descricao: 'Simule sua aposentadoria e planejamento previdenciário.', categoria: 'Marketing', icone: '👴', tipo: 'html', path: '/ferramentas/calculadoraIA/aposentadoria.index.html' },
  { slug: 'imobiliarias', nome: 'Calculadoras Imobiliárias', descricao: 'Simulações para financiamento e investimento imobiliário.', categoria: 'Marketing', icone: '🏠', tipo: 'html', path: '/ferramentas/calculadoraIA/imobiliarias.index.html' },
  { slug: 'impostos', nome: 'Calculadoras de Impostos', descricao: 'Simule impostos e tributos.', categoria: 'Marketing', icone: '🧾', tipo: 'html', path: '/ferramentas/calculadoraIA/impostos.index.html' },
  { slug: 'investimentos', nome: 'Calculadoras de Investimentos', descricao: 'Simule retornos e cenários de investimento.', categoria: 'Marketing', icone: '💎', tipo: 'html', path: '/ferramentas/calculadoraIA/investimentos.index.html' },
]

export const categorias: CategoriaFerramenta[] = ['SEO', 'IA', 'Desenvolvimento', 'Marketing']

/** Cor de destaque por categoria, usando as CSS vars já existentes no projeto */
export const corPorCategoria: Record<CategoriaFerramenta, string> = {
  SEO: 'var(--primary-cyan)',
  IA: 'var(--secondary-jade)',
  Desenvolvimento: 'var(--accent-amber)',
  Marketing: '#c084fc', // purple-400, para diferenciar visualmente da 4ª categoria
}
