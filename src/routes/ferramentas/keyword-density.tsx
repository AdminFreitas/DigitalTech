import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

interface KeywordCount {
  word: string;
  count: number;
  percentage: number;
}

export function KeywordDensityPage() {
  const [text, setText] = useState('');
  const [minLength, setMinLength] = useState('3');

  const keywords = useMemo(() => {
    if (!text.trim()) return [];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= parseInt(minLength));

    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const totalWords = words.length;
    const keywordList: KeywordCount[] = Object.entries(wordCount)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / totalWords) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return keywordList;
  }, [text, minLength]);

  return (
    <ToolLayout
      title="Keyword Density"
      description="Analisador de densidade de palavras-chave em textos."
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            Texto para AnÃ¡lise
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole o texto aqui..."
            rows={6}
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
            Comprimento MÃ­nimo da Palavra
          </label>
          <input
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(e.target.value)}
            min="1"
            max="20"
            className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
          />
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Palavras-chave Encontradas
          </h3>

          {keywords.length === 0 ? (
            <p className="text-[#94a3b8]">Nenhuma palavra encontrada. Cole um texto para comeÃ§ar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#161f30]">
                    <th className="px-4 py-2 text-left text-[#f8fafc]">Palavra</th>
                    <th className="px-4 py-2 text-center text-[#f8fafc]">OcorrÃªncias</th>
                    <th className="px-4 py-2 text-right text-[#f8fafc]">Densidade</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, index) => (
                    <tr key={index} className="border-b border-[#161f30]">
                      <td className="px-4 py-3 text-[#f8fafc]">{kw.word}</td>
                      <td className="px-4 py-3 text-center text-[#3ddc97]">{kw.count}</td>
                      <td className="px-4 py-3 text-right text-[#00d4ff]">
                        {kw.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Densidade ideal de palavras-chave: 1-3%</li>
            <li>â€¢ Evite keyword stuffing (excesso de palavras-chave)</li>
            <li>â€¢ Foque em palavras-chave relevantes e naturais</li>
            <li>â€¢ Use sinÃ´nimos para variar o conteÃºdo</li>
            <li>â€¢ Priorize a experiÃªncia do leitor sobre SEO</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/keyword-density')({
  component: KeywordDensityPage,
});

