import { useParams, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Clock, Share2 } from 'lucide-react';
import CommentsSection from '@/components/CommentsSection';

// Mock data for articles
const articlesData = [
  {
    id: 1,
    title: 'IA Transformando Programação em 2026',
    category: 'IA & ML',
    readTime: '8 min',
    image: '/manus-storage/article-ai_96545071.png',
    description: 'Como assistentes de IA estão mudando a forma como desenvolvemos software e quais ferramentas você deve conhecer.',
    author: 'Michel Freitas',
    date: '15 de junho, 2026',
    content: `
      <h2>Introdução</h2>
      <p>A inteligência artificial está revolucionando o desenvolvimento de software. Ferramentas como GitHub Copilot, Claude e ChatGPT mudaram fundamentalmente como os desenvolvedores escrevem código.</p>
      
      <h2>O Impacto da IA no Desenvolvimento</h2>
      <p>Assistentes de IA agora conseguem:</p>
      <ul>
        <li>Gerar código automaticamente a partir de descrições em linguagem natural</li>
        <li>Identificar bugs e sugerir correções</li>
        <li>Documentar código automaticamente</li>
        <li>Refatorar código legado</li>
        <li>Escrever testes unitários</li>
      </ul>
      
      <h2>Ferramentas Essenciais</h2>
      <p>As principais ferramentas que todo desenvolvedor deve conhecer em 2026:</p>
      <ul>
        <li><strong>GitHub Copilot:</strong> Integração direta no VS Code com sugestões contextuais</li>
        <li><strong>Claude:</strong> Excelente para análise de código e refatoração</li>
        <li><strong>ChatGPT:</strong> Versátil para explicações e brainstorming</li>
        <li><strong>Tabnine:</strong> Alternativa open-source com bom desempenho</li>
      </ul>
      
      <h2>Melhores Práticas</h2>
      <p>Para aproveitar ao máximo os assistentes de IA:</p>
      <ul>
        <li>Escreva prompts descritivos e específicos</li>
        <li>Revise sempre o código gerado antes de usar</li>
        <li>Use para acelerar, não para substituir o pensamento crítico</li>
        <li>Combine com testes automatizados</li>
      </ul>
      
      <h2>Conclusão</h2>
      <p>A IA não vai substituir desenvolvedores, mas desenvolvedores que usam IA vão substituir aqueles que não usam. O futuro é agora, e a hora de aprender é hoje.</p>
    `,
  },
  {
    id: 2,
    title: 'Guia Prático: Otimizando Queries SQL',
    category: 'Banco de Dados',
    readTime: '12 min',
    image: '/manus-storage/article-database_4d5e7a34.png',
    description: 'Técnicas essenciais para melhorar performance de consultas e reduzir latência em aplicações críticas.',
    author: 'Michel Freitas',
    date: '10 de junho, 2026',
    content: `
      <h2>Por que Otimizar Queries?</h2>
      <p>Queries mal otimizadas são uma das principais causas de lentidão em aplicações. Uma query que leva 5 segundos em vez de 50ms pode arruinar a experiência do usuário.</p>
      
      <h2>Técnicas de Otimização</h2>
      <p>As principais técnicas para otimizar suas queries SQL:</p>
      <ul>
        <li>Use índices apropriados</li>
        <li>Evite SELECT *</li>
        <li>Use EXPLAIN para analisar planos de execução</li>
        <li>Implemente paginação</li>
        <li>Cache de resultados</li>
      </ul>
      
      <h2>Exemplo Prático</h2>
      <p>Comparação de uma query lenta vs otimizada:</p>
      <p><strong>Lenta:</strong> SELECT * FROM users WHERE email LIKE '%@gmail.com'</p>
      <p><strong>Otimizada:</strong> SELECT id, name, email FROM users WHERE email LIKE '%@gmail.com' LIMIT 100</p>
      
      <h2>Monitoramento</h2>
      <p>Ferramentas essenciais para monitorar performance:</p>
      <ul>
        <li>MySQL Workbench</li>
        <li>PostgreSQL pgAdmin</li>
        <li>New Relic</li>
        <li>DataDog</li>
      </ul>
    `,
  },
  {
    id: 3,
    title: 'Cibersegurança: Tendências 2026',
    category: 'Segurança',
    readTime: '10 min',
    image: '/manus-storage/article-security_39e47671.png',
    description: 'Os principais riscos de segurança que toda empresa deve monitorar e como se preparar para eles.',
    author: 'Michel Freitas',
    date: '5 de junho, 2026',
    content: `
      <h2>Ameaças Emergentes</h2>
      <p>Em 2026, as principais ameaças de segurança são mais sofisticadas do que nunca.</p>
      
      <h2>Riscos Principais</h2>
      <ul>
        <li>Ataques de IA e machine learning</li>
        <li>Ransomware evoluído</li>
        <li>Supply chain attacks</li>
        <li>Zero-day exploits</li>
        <li>Social engineering aprimorado</li>
      </ul>
      
      <h2>Como se Proteger</h2>
      <p>Medidas essenciais de proteção:</p>
      <ul>
        <li>Implementar MFA em todos os sistemas</li>
        <li>Manter software atualizado</li>
        <li>Realizar auditorias de segurança regulares</li>
        <li>Treinar equipe em segurança</li>
        <li>Ter plano de resposta a incidentes</li>
      </ul>
    `,
  },
];

export default function Article() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const articleId = parseInt(params.id || '1');
  
  const article = articlesData.find(a => a.id === articleId);
  const currentIndex = articlesData.findIndex(a => a.id === articleId);
  const prevArticle = currentIndex > 0 ? articlesData[currentIndex - 1] : null;
  const nextArticle = currentIndex < articlesData.length - 1 ? articlesData[currentIndex + 1] : null;

  if (!article) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
        <button
          onClick={() => setLocation('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Article Header */}
      <article className="container py-12">
        <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
            >
              <ChevronLeft size={18} />
              Voltar para artigos
            </button>

            {/* Article Meta */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={14} />
                  {article.readTime}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="font-semibold text-foreground">{article.author}</p>
                  <p className="text-sm text-muted-foreground">{article.date}</p>
                </div>
                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Article Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none mb-12">
              <div
                className="text-foreground leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{
                  __html: article.content
                    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-foreground mt-8 mb-4">')
                    .replace(/<p>/g, '<p class="text-muted-foreground leading-relaxed">')
                    .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 text-muted-foreground">')
                    .replace(/<li>/g, '<li class="ml-2">')
                    .replace(/<strong>/g, '<strong class="text-foreground font-semibold">')
                }}
              />
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12 border-t border-border">
              {prevArticle ? (
                <button
                  onClick={() => setLocation(`/artigo/${prevArticle.id}`)}
                  className="glass-hover rounded-lg p-4 text-left group"
                >
                  <div className="flex items-center gap-2 text-primary mb-2 group-hover:gap-3 transition-all">
                    <ChevronLeft size={18} />
                    <span className="text-sm font-semibold">Artigo Anterior</span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {prevArticle.title}
                  </h3>
                </button>
              ) : (
                <div />
              )}

              {nextArticle ? (
                <button
                  onClick={() => setLocation(`/artigo/${nextArticle.id}`)}
                  className="glass-hover rounded-lg p-4 text-right group"
                >
                  <div className="flex items-center justify-end gap-2 text-primary mb-2 group-hover:gap-3 transition-all">
                    <span className="text-sm font-semibold">Próximo Artigo</span>
                    <ChevronRight size={18} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {nextArticle.title}
                  </h3>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Comments Section */}
            <CommentsSection articleId={article.id} />
          </div>
        </article>
    </>
  );
}
