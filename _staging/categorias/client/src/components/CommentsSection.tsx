import { useState } from 'react';
import { Send, User } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  email: string;
  content: string;
  date: string;
  avatar?: string;
}

interface CommentsSectionProps {
  articleId: number;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'João Silva',
      email: 'joao@example.com',
      content: 'Excelente artigo! Muito didático e bem estruturado. Vou aplicar essas técnicas nos meus projetos.',
      date: '2 dias atrás',
      avatar: '👨‍💻',
    },
    {
      id: 2,
      author: 'Maria Santos',
      email: 'maria@example.com',
      content: 'Concordo totalmente com os pontos levantados. Seria interessante um artigo sobre otimizações avançadas.',
      date: '1 dia atrás',
      avatar: '👩‍💼',
    },
  ]);

  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.author && formData.email && formData.content) {
      const newComment: Comment = {
        id: comments.length + 1,
        author: formData.author,
        email: formData.email,
        content: formData.content,
        date: 'agora',
      };
      
      setComments([newComment, ...comments]);
      setFormData({ author: '', email: '', content: '' });
      setSubmitted(true);
      
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-12 border-t border-border mt-12">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-8">Comentários</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="glass-hover rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Deixe seu comentário</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="author"
              placeholder="Seu nome"
              value={formData.author}
              onChange={handleInputChange}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="seu.email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
              required
            />
          </div>

          <textarea
            name="content"
            placeholder="Seu comentário aqui..."
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
            required
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Seu email não será publicado
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
            >
              <Send size={16} />
              Enviar
            </button>
          </div>

          {submitted && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
              ✓ Comentário enviado com sucesso!
            </div>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
          </h3>

          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="glass rounded-lg p-5 light-effect group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-lg">
                    {comment.avatar || <User size={20} className="text-primary" />}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {comment.author}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {comment.email}
                    </p>
                    <p className="text-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
