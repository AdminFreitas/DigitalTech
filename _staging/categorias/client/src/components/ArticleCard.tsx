import { Clock, Bookmark } from 'lucide-react';
import { useLocation } from 'wouter';

interface ArticleCardProps {
  id: number;
  title: string;
  category: string;
  readTime: string;
  image: string;
  description: string;
  categoryColor?: string;
}

export default function ArticleCard({
  id,
  title,
  category,
  readTime,
  image,
  description,
  categoryColor = 'bg-primary/20 text-primary',
}: ArticleCardProps) {
  const [, setLocation] = useLocation();

  return (
    <article
      onClick={() => setLocation(`/artigo/${id}`)}
      className="stagger-item glass-hover rounded-lg overflow-hidden group cursor-pointer light-effect"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor}`}>
            {category}
          </span>
          <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors duration-200">
            <Bookmark size={16} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={14} />
            <span>{readTime}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/artigo/${id}`);
            }}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Ler Artigo →
          </button>
        </div>
      </div>
    </article>
  );
}
