# DigitalTech Notícias - TODO

## Fase 1: Análise e Design
- [x] Analisar site DigitalTech existente
- [x] Definir design tokens e paleta de cores
- [x] Criar plano de arquitetura

## Fase 2: Schema e Interfaces
- [x] Criar schema de banco de dados (news table com campos: id, title, slug, content, category, tags, author, publishedAt, featured, breaking, views, readingTime, seoTitle, seoDescription, categorySlug, status, updatedAt, coverImageAlt, pinned, priority, viewsLast7Days)
- [x] Executar migração SQL
- [x] Criar interfaces TypeScript (News, NewsCategory)
- [x] Implementar serviço de notícias com dados mock
- [x] Criar helpers de banco de dados (getNewsByCategory, getNewsBySlug, searchNews, etc)

## Fase 3: Componentes Visuais
- [x] Criar componente NewsHeroCard (notícia destaque principal)
- [x] Criar componente NewsCard (card secundário para listas)
- [x] Criar componente CategoryBadge (com cores distintas por categoria)
- [x] Criar componente NewsGrid (grade responsiva de artigos)
- [x] Criar componente NewsSearchBar (barra de pesquisa)
- [x] Criar componente RelatedNews (artigos relacionados)
- [x] Criar componente NewsMetadata (data, tempo de leitura, categoria)

## Fase 4: Rotas e Páginas
- [x] Criar rota /noticias (NewsHomePage com hero + destaques + lista)
- [x] Criar rota /noticias/:categoria/:slug (NewsArticlePage com conteúdo markdown)
- [x] Criar rota /noticias/pesquisa (NewsSearchPage com resultados)
- [x] Implementar navegação anterior/próximo em artigos
- [x] Implementar filtro por categoria
- [x] Implementar pesquisa funcional

## Fase 5: Integração com Home
- [x] Adicionar seção "Últimas Notícias" na home principal (3 cards)
- [x] Reutilizar componentes NewsCard na home
- [x] Adicionar link "Ver todas" → /noticias
- [x] Implementar SEO (meta tags, Open Graph, JSON-LD NewsArticle) - Básico implementado

## Fase 6: Testes e Validação
- [x] Testar rotas wouter (sem erros de navegação)
- [x] Validar carregamento de hero + destaques + lista
- [x] Testar navegação entre categorias
- [x] Testar pesquisa funcional
- [x] Testar renderização de markdown
- [x] Validar responsividade em mobile
- [x] Testar links anterior/próximo
- [x] Corrigir nested anchors em NewsCard e NewsHeroCard
- [x] Adicionar loading states em NewsArticlePage

## Fase 7: Entrega
- [x] Criar checkpoint final
- [x] Gerar relatório de arquivos criados
- [x] Confirmar servidor sobe sem erros
- [x] Entregar ao utilizador

## Fase 8: Funcionalidades Adicionais
- [x] Implementar botões de partilha em redes sociais (Twitter, LinkedIn, Facebook, WhatsApp)
- [x] Adicionar botão de copiar link
- [x] Integrar ShareButtons na página de artigo
- [x] Adicionar feedback visual (toast) ao copiar link

## ADENDO 2 - Fase 1: Itens que faltaram na primeira leva
- [x] Breadcrumb com Schema.org JSON-LD
- [x] Compartilhamento com parâmetros UTM automáticos
- [x] Artigo anterior/próximo (por categoria ou global)
- [x] Barra de progresso de leitura (scroll listener)
- [x] Histórico de leitura local (localStorage) com ReadingHistoryService
- [x] Seção "Continue lendo" na Home

## ADENDO 2 - Fase 2: Engajamento leve
- [x] Tendências (tags em alta dos últimos 7 dias)
- [x] Ranking do dia (mais lidas em 24h)
- [x] Favoritos/Salvar para ler depois com BookmarksService
- [x] Página /noticias/favoritos (NewsFavoritesPage com UI completa)
- [x] Ouvir a notícia (Web Speech API - texto para voz)
- [x] Enquete rápida no final do artigo com poll votes

## ADENDO 2 - Fase 3: Placeholders para futuro
- [x] Newsletter UI (sem envio real)
- [x] CommentsSection placeholder (Giscus/Disqus no futuro)
- [x] Documentação de notificações push (Web Push API)

## ADENDO 2 - Preparação de Banco de Dados
- [x] Desenhar schema PostgreSQL para newsletter_subscribers
- [x] Desenhar schema PostgreSQL para polls e poll_votes
- [x] Desenhar schema PostgreSQL para push_subscriptions
- [x] Desenhar schema PostgreSQL para user_bookmarks (futuro)
- [x] Desenhar schema PostgreSQL para user_reading_history (futuro)

## ADENDO 2 - Correções de Qualidade
- [x] PollsService: Gerenciar enquetes com localStorage persistente
- [x] NewsletterService: Gerenciar inscrições mock
- [x] markdownToPlainText: Converter markdown para texto puro
- [x] TextToSpeechButton: Usar markdown-to-text para leitura limpa
- [x] ReadingProgressBar: Medir apenas conteúdo do artigo (0-100%)
- [x] useReadingProgress: Atualizar para novo cálculo de progresso
- [x] NewsArticlePage: Ordenar anterior/próximo por publishedAt

## ADENDO 3 - Retenção de Leitores: Cadastro, Contato e Notificações

### Parte 1: Cadastro de Conta (Autenticação Local)
- [x] Schema: tabelas users (email, senha hash, created_at), user_preferences
- [x] Formulário de cadastro/login com validação de email
- [x] Autenticação com JWT (sessão em cookie)
- [x] Persistência de favoritos em banco de dados (migrar de localStorage)
- [x] Página de perfil do usuário com dados básicos

### Parte 2: Canal de Contato/Sugestão (Público, Sem Autenticação)
- [x] Schema: tabela contacts (name, email, phone, subject, message, status, created_at)
- [x] Formulário de contato/sugestão sem autenticação (validação básica)
- [x] Validação de email e campos obrigatórios
- [x] Armazenamento em banco de dados
- [x] Email de confirmação automático para o remetente

### Parte 3: Notificações Multi-Canal
- [x] Schema: tabela notification_channels (user_id, channel_type, identifier, is_active, verified_at)
- [x] Schema: tabela notification_preferences (user_id, frequency, categories, is_enabled)
- [x] Integração com Sendgrid (Email)
- [x] Integração com Twilio (WhatsApp)
- [x] Integração com Telegram Bot API
- [x] Dashboard de preferências de notificação
- [x] Notificações ao publicar novo artigo
- [x] Notificações de favoritos salvos

## Funcionalidades Finais
- [x] Validação robusta de campos no formulário de contato
- [x] Animações de feedback visual (sucesso/erro)
- [x] Proteção contra spam (honeypot + rate limiting)
- [x] Sistema de ordenação (recente, antiga, popular)
- [x] Rolagem infinita com IntersectionObserver
