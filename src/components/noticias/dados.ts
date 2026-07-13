export type Noticia = {
  slug: string; titulo: string; resumo: string;
  categoria: string; categoriaLabel: string;
  fonte: string; data: string; dataISO: string;
  destaque: boolean; coverImage: string; tempoLeitura: number;
};

export const NOTICIAS: Noticia[] = [
  { slug: "openai-gpt5", titulo: "OpenAI anuncia GPT-5 com capacidades multimodais", resumo: "Novo modelo promete raciocinio aprimorado e reducao de alucinacoes em 40%.", categoria: "ia", categoriaLabel: "Inteligencia Artificial", fonte: "The Verge", data: "10 jul 2026", dataISO: "2026-07-10", destaque: true, coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80", tempoLeitura: 5 },
  { slug: "brasil-lei-ia", titulo: "Brasil aprova marco regulatorio da IA", resumo: "Legislacao define responsabilidades para empresas que desenvolvem IA.", categoria: "ia", categoriaLabel: "Inteligencia Artificial", fonte: "G1", data: "09 jul 2026", dataISO: "2026-07-09", destaque: true, coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80", tempoLeitura: 4 },
  { slug: "google-quantum", titulo: "Google alcanca novo marco em computacao quantica", resumo: "Processador Willow 2 resolve em 5 minutos problema impossivel para supercomputadores.", categoria: "hardware", categoriaLabel: "Hardware", fonte: "Wired", data: "08 jul 2026", dataISO: "2026-07-08", destaque: true, coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", tempoLeitura: 6 },
  { slug: "linux-kernel-610", titulo: "Linux Kernel 6.10 lancado com melhorias ARM", resumo: "Nova versao traz suporte aprimorado para chips ARM e RISC-V.", categoria: "engenharia", categoriaLabel: "Engenharia", fonte: "Phoronix", data: "10 jul 2026", dataISO: "2026-07-10", destaque: false, coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80", tempoLeitura: 4 },
  { slug: "typescript-6-beta", titulo: "TypeScript 6.0 beta com inferencia mais poderosa", resumo: "Microsoft libera beta com melhorias na inferencia de tipos genericos.", categoria: "engenharia", categoriaLabel: "Engenharia", fonte: "Microsoft Blog", data: "09 jul 2026", dataISO: "2026-07-09", destaque: false, coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80", tempoLeitura: 5 },
  { slug: "postgresql-18", titulo: "PostgreSQL 18 Preview: novidades para devs", resumo: "Versao traz funcoes de janela aprimoradas e melhor suporte a JSON Schema.", categoria: "dados", categoriaLabel: "Dados", fonte: "PostgreSQL.org", data: "08 jul 2026", dataISO: "2026-07-08", destaque: false, coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80", tempoLeitura: 4 },
  { slug: "cloudflare-workers", titulo: "Cloudflare expande plano gratuito do Workers AI", resumo: "Desenvolvedores tem acesso a mais modelos no tier gratuito.", categoria: "cloud", categoriaLabel: "Cloud", fonte: "Cloudflare Blog", data: "07 jul 2026", dataISO: "2026-07-07", destaque: false, coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", tempoLeitura: 3 },
  { slug: "cve-openssh", titulo: "Vulnerabilidade critica no OpenSSH afeta servidores", resumo: "CVE-2026-4389 permite execucao remota sem autenticacao. Atualize agora.", categoria: "seguranca", categoriaLabel: "Seguranca", fonte: "CISA", data: "07 jul 2026", dataISO: "2026-07-07", destaque: false, coverImage: "https://images.unsplash.com/photo-1550439062-7cdcb8b1d4d7?w=800&q=80", tempoLeitura: 3 },
];

export const CATEGORIAS = [
  { slug: "todas", label: "Todas" },
  { slug: "ia", label: "Inteligencia Artificial" },
  { slug: "engenharia", label: "Engenharia" },
  { slug: "dados", label: "Dados" },
  { slug: "seguranca", label: "Seguranca" },
  { slug: "cloud", label: "Cloud" },
  { slug: "hardware", label: "Hardware" },
];
