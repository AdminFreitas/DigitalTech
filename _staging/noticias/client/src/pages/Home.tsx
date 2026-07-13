import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { NewsCard } from "@/modules/news/components";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const { data: latestNews = [] } = trpc.news.list.useQuery();
  const recentNews = latestNews.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">DigitalTech</h1>
          <p className="text-xl text-blue-100 mb-8">
            Notícias, artigos e ferramentas sobre tecnologia, programação e inovação
          </p>
          <Link href="/noticias">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer">
              Explorar Notícias
            </Button>
          </Link>
        </div>
      </section>

      {/* Latest News Section */}
      {recentNews.length > 0 && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Últimas Notícias</h2>
              <Link href="/noticias">
                <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                  Ver todas
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Sobre DigitalTech</h2>
          <p className="text-gray-700 mb-4">
            DigitalTech é um portal independente brasileiro dedicado a trazer as
            notícias, artigos e ferramentas mais relevantes sobre tecnologia,
            programação, inovação e desenvolvimento de software.
          </p>
          <p className="text-gray-700">
            Nosso objetivo é manter desenvolvedores, engenheiros e entusiastas de
            tecnologia informados sobre as tendências, ferramentas e práticas mais
            importantes da indústria.
          </p>
        </div>
      </section>
    </div>
  );
}
