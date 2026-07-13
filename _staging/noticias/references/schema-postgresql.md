# Schema PostgreSQL - Preparação para Futuro

Este documento descreve o schema PostgreSQL que será implementado quando o banco de dados for migrado de MySQL para PostgreSQL. Atualmente, todas as funcionalidades estão usando localStorage (mock), mas seguem esta estrutura de dados.

## Tabelas Existentes (já em MySQL)

```sql
-- news: artigos do blog
-- categories: categorias (IA, Engenharia, Segurança, Cloud, Dados, Carreira)
-- authors: autores dos artigos
-- tags: tags/etiquetas dos artigos
-- news_tags: relação muitos-para-muitos entre news e tags
-- news_images: imagens dos artigos
```

## Tabelas Novas (a implementar em PostgreSQL)

### newsletter_subscribers
Gerencia inscrições na newsletter com double opt-in.

```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  utm_source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(confirmed);
```

### polls
Enquetes/votações associadas a artigos.

```sql
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  options JSONB NOT NULL, -- [{id: string, label: string}, ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_polls_news_id ON polls(news_id);
```

### poll_votes
Votos individuais em enquetes.

```sql
CREATE TABLE poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id VARCHAR(50) NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  anonymous_session_id VARCHAR(100), -- identificador local sem login
  user_id INT REFERENCES users(id) ON DELETE SET NULL, -- futuro: quando houver autenticação
  ip_hash VARCHAR(64), -- hash do IP para evitar múltiplos votos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_session ON poll_votes(anonymous_session_id);
CREATE UNIQUE INDEX idx_poll_votes_unique ON poll_votes(poll_id, anonymous_session_id);
```

### push_subscriptions
Inscrições para notificações push (Web Push API).

```sql
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(500) UNIQUE NOT NULL,
  keys JSONB NOT NULL, -- {p256dh: string, auth: string}
  user_agent VARCHAR(500),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT REFERENCES users(id) ON DELETE CASCADE, -- futuro
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(last_active);
```

### user_bookmarks
Favoritos/bookmarks salvos por usuários (quando houver autenticação).

```sql
CREATE TABLE user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, news_id)
);

CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_news_id ON user_bookmarks(news_id);
```

### user_reading_history
Histórico de leitura com progresso de scroll (quando houver autenticação).

```sql
CREATE TABLE user_reading_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scroll_percentage INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(user_id, news_id)
);

CREATE INDEX idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX idx_user_reading_history_news_id ON user_reading_history(news_id);
CREATE INDEX idx_user_reading_history_read_at ON user_reading_history(read_at);
```

## Notas de Implementação

1. **Migração de localStorage para banco de dados:**
   - ReadingHistoryService → user_reading_history (quando houver login)
   - BookmarksService → user_bookmarks (quando houver login)
   - PollSection votos → poll_votes (já estruturado para isso)
   - NewsletterSection → newsletter_subscribers (já estruturado)

2. **Campos JSONB:**
   - Usar JSONB em PostgreSQL para flexibilidade (options em polls, keys em push_subscriptions)
   - Criar índices GIN para queries eficientes em JSONB

3. **Timestamps:**
   - Todos em UTC
   - Usar CURRENT_TIMESTAMP para defaults
   - Manter updated_at para rastrear mudanças

4. **Índices:**
   - Criar índices em todas as foreign keys
   - Índices em campos frequentemente filtrados (email, user_id, news_id)
   - Índices compostos para queries comuns (user_id + created_at)

5. **Constraints:**
   - UNIQUE em combinações de campos (user_id + news_id)
   - ON DELETE CASCADE/SET NULL conforme necessário
   - NOT NULL em campos obrigatórios

## Próximos Passos

1. Provisionar PostgreSQL (RDS, Supabase, ou outro)
2. Executar scripts de criação de tabelas
3. Migrar dados de MySQL (se houver)
4. Atualizar serviços (ReadingHistoryService, BookmarksService, etc.) para usar banco de dados
5. Implementar autenticação de usuário (se ainda não houver)
6. Testar todas as funcionalidades com dados reais
