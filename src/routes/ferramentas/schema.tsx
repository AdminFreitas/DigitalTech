import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolLayout } from '@/components/ferramentas/ToolLayout';

export function SchemaPage() {
  const [schemaType, setSchemaType] = useState('Article');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [author, setAuthor] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [dateModified, setDateModified] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationLogo, setOrganizationLogo] = useState('');

  const generateSchema = () => {
    const baseSchema: any = {
      '@context': 'https://schema.org',
      '@type': schemaType,
    };

    if (schemaType === 'Article') {
      if (title) baseSchema.headline = title;
      if (description) baseSchema.description = description;
      if (url) baseSchema.url = url;
      if (image) baseSchema.image = image;
      if (author) baseSchema.author = { '@type': 'Person', name: author };
      if (datePublished) baseSchema.datePublished = datePublished;
      if (dateModified) baseSchema.dateModified = dateModified;
    } else if (schemaType === 'Organization') {
      if (organizationName) baseSchema.name = organizationName;
      if (url) baseSchema.url = url;
      if (organizationLogo) baseSchema.logo = organizationLogo;
    } else if (schemaType === 'Product') {
      if (title) baseSchema.name = title;
      if (description) baseSchema.description = description;
      if (image) baseSchema.image = image;
    }

    return JSON.stringify(baseSchema, null, 2);
  };

  const schema = generateSchema();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    alert('Schema copiado para a Ã¡rea de transferÃªncia!');
  };

  const schemaTemplates = {
    Article: {
      icon: 'ðŸ“°',
      description: 'Para artigos e posts de blog',
    },
    Organization: {
      icon: 'ðŸ¢',
      description: 'Para informaÃ§Ãµes da organizaÃ§Ã£o',
    },
    Product: {
      icon: 'ðŸ›ï¸',
      description: 'Para produtos e serviÃ§os',
    },
    LocalBusiness: {
      icon: 'ðŸ“',
      description: 'Para negÃ³cios locais',
    },
    BreadcrumbList: {
      icon: 'ðŸ—ºï¸',
      description: 'Para navegaÃ§Ã£o em breadcrumbs',
    },
  };

  return (
    <ToolLayout
      title="Schema"
      description="Gerador de dados estruturados (Schema.org) para rich snippets."
    >
      <div className="space-y-8">
        {/* Schema Type Selection */}
        <div>
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Tipo de Schema
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(schemaTemplates).map(([type, { icon, description }]) => (
              <button
                key={type}
                onClick={() => setSchemaType(type)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  schemaType === type
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                    : 'border-[#161f30] bg-[#0b1020] hover:border-[#161f30]'
                }`}
              >
                <div className="mb-2 text-2xl">{icon}</div>
                <div className="font-medium text-[#f8fafc]">{type}</div>
                <div className="text-xs text-[#94a3b8]">{description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            InformaÃ§Ãµes
          </h3>

          <div className="space-y-4">
            {schemaType === 'Article' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    TÃ­tulo do Artigo
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o tÃ­tulo..."
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    DescriÃ§Ã£o
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="DescriÃ§Ã£o do artigo..."
                    rows={3}
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    URL do Artigo
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/artigo"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/imagem.jpg"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nome do autor..."
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                      Data de PublicaÃ§Ã£o
                    </label>
                    <input
                      type="date"
                      value={datePublished}
                      onChange={(e) => setDatePublished(e.target.value)}
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                      Data de ModificaÃ§Ã£o
                    </label>
                    <input
                      type="date"
                      value={dateModified}
                      onChange={(e) => setDateModified(e.target.value)}
                      className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>
                </div>
              </>
            )}

            {schemaType === 'Organization' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Nome da OrganizaÃ§Ã£o
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Digite o nome..."
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Website
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    URL do Logo
                  </label>
                  <input
                    type="url"
                    value={organizationLogo}
                    onChange={(e) => setOrganizationLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>
              </>
            )}

            {schemaType === 'Product' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o nome..."
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    DescriÃ§Ã£o
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="DescriÃ§Ã£o do produto..."
                    rows={3}
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#f8fafc]">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/produto.jpg"
                    className="w-full rounded-lg border border-[#161f30] bg-[#0b1020] px-4 py-2 text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            JSON-LD Gerado
          </h3>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97] max-h-96">
              {schema}
            </pre>

            <button
              onClick={copyToClipboard}
              className="absolute right-4 top-4 rounded-lg border border-[#161f30] bg-[#161f30] px-3 py-1 text-sm text-[#00d4ff] transition-all hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
            >
              Copiar
            </button>
          </div>

          <p className="mt-4 text-sm text-[#94a3b8]">
            Adicione este cÃ³digo dentro da tag <code className="bg-[#0b1020] px-2 py-1 rounded text-[#3ddc97]">&lt;head&gt;</code> do seu HTML:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-[#161f30] bg-[#0b1020] p-4 text-sm text-[#3ddc97]">
            {`<script type="application/ld+json">\n${schema}\n</script>`}
          </pre>
        </div>

        {/* Tips Section */}
        <div className="border-t border-[#161f30] pt-8">
          <h3 className="mb-4 font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#f8fafc]">
            Dicas
          </h3>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li>â€¢ Schema.org ajuda os mecanismos de busca a entender seu conteÃºdo</li>
            <li>â€¢ Use JSON-LD para melhor compatibilidade</li>
            <li>â€¢ Valide seu schema no Google Rich Results Test</li>
            <li>â€¢ Rich snippets podem melhorar seu CTR nos resultados de busca</li>
            <li>â€¢ Mantenha os dados estruturados atualizados</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}

export const Route = createFileRoute('/ferramentas/schema')({
  component: SchemaPage,
});

