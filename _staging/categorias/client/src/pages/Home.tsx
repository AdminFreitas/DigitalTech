import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';

// Mock data for articles
const articles = [
  {
    id: 1,
    title: 'IA Transformando Programação em 2026',
    category: 'IA & ML',
    readTime: '8 min',
    image: '/manus-storage/article-ai_96545071.png',
    description: 'Como assistentes de IA estão mudando a forma como desenvolvemos software e quais ferramentas você deve conhecer.',
    categoryColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 2,
    title: 'Guia Prático: Otimizando Queries SQL',
    category: 'Banco de Dados',
    readTime: '12 min',
    image: '/manus-storage/article-database_4d5e7a34.png',
    description: 'Técnicas essenciais para melhorar performance de consultas e reduzir latência em aplicações críticas.',
    categoryColor: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 3,
    title: 'Cibersegurança: Tendências 2026',
    category: 'Segurança',
    readTime: '10 min',
    image: '/manus-storage/article-security_39e47671.png',
    description: 'Os principais riscos de segurança que toda empresa deve monitorar e como se preparar para eles.',
    categoryColor: 'bg-red-500/20 text-red-300',
  },
  {
    id: 4,
    title: 'TypeScript vs JavaScript: Quando Usar?',
    category: 'Programação',
    readTime: '7 min',
    image: '/manus-storage/article-ai_96545071.png',
    description: 'Análise comparativa dos dois linguagens e quando cada uma é a melhor escolha para seu projeto.',
    categoryColor: 'bg-yellow-500/20 text-yellow-300',
  },
  {
    id: 5,
    title: 'Docker: Containerização Prática',
    category: 'DevOps',
    readTime: '15 min',
    image: '/manus-storage/article-database_4d5e7a34.png',
    description: 'Guia completo para containerizar suas aplicações e simplificar o deployment em produção.',
    categoryColor: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 6,
    title: 'API REST vs GraphQL',
    category: 'Arquitetura',
    readTime: '11 min',
    image: '/manus-storage/article-security_39e47671.png',
    description: 'Comparação detalhada entre os dois padrões de API e quando usar cada um em seus projetos.',
    categoryColor: 'bg-purple-500/20 text-purple-300',
  },
  {
    id: 7,
    title: 'React 19: Novidades e Mudanças',
    category: 'Frontend',
    readTime: '9 min',
    image: '/manus-storage/article-ai_96545071.png',
    description: 'Explore as novas features do React 19 e como migrar seus projetos existentes.',
    categoryColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 8,
    title: 'Monitoramento com Prometheus',
    category: 'DevOps',
    readTime: '13 min',
    image: '/manus-storage/article-database_4d5e7a34.png',
    description: 'Setup completo de monitoramento e alertas para suas aplicações em produção.',
    categoryColor: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 9,
    title: 'Autenticação OAuth2 Explicada',
    category: 'Segurança',
    readTime: '10 min',
    image: '/manus-storage/article-security_39e47671.png',
    description: 'Entenda como OAuth2 funciona e implemente autenticação segura em suas aplicações.',
    categoryColor: 'bg-red-500/20 text-red-300',
  },
  {
    id: 10,
    title: 'Algoritmos de Busca Eficientes',
    category: 'Programação',
    readTime: '14 min',
    image: '/manus-storage/article-ai_96545071.png',
    description: 'Estude os principais algoritmos de busca e quando cada um oferece melhor performance.',
    categoryColor: 'bg-yellow-500/20 text-yellow-300',
  },
  {
    id: 11,
    title: 'Machine Learning com Python',
    category: 'IA & ML',
    readTime: '16 min',
    image: '/manus-storage/article-database_4d5e7a34.png',
    description: 'Introdução prática a machine learning usando bibliotecas populares como scikit-learn e TensorFlow.',
    categoryColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 12,
    title: 'Testes Automatizados com Jest',
    category: 'Programação',
    readTime: '11 min',
    image: '/manus-storage/article-security_39e47671.png',
    description: 'Aprenda a escrever testes robustos e manter a qualidade do seu código JavaScript.',
    categoryColor: 'bg-yellow-500/20 text-yellow-300',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Hero />

      {/* Articles Grid */}
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Últimos Artigos
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Conteúdo técnico aprofundado sobre programação, IA, cibersegurança e muito mais.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                category={article.category}
                readTime={article.readTime}
                image={article.image}
                description={article.description}
                categoryColor={article.categoryColor}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
