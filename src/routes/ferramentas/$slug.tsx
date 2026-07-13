import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { buscarFerramenta, prepararHtmlFerramenta } from "@/lib/ferramentas";

export const Route = createFileRoute("/ferramentas/$slug")({
  head: ({ params }) => {
    const ferramenta = buscarFerramenta(params.slug);
    return {
      meta: [
        {
          title: ferramenta
            ? `${ferramenta.name} — DIGITALTECH`
            : "Ferramenta não encontrada — DIGITALTECH",
        },
        { name: "description", content: ferramenta?.desc ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const ferramenta = buscarFerramenta(params.slug);
    if (!ferramenta) throw notFound();
    return ferramenta;
  },
  component: FerramentaPage,
});

function FerramentaPage() {
  const ferramenta = Route.useLoaderData();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const html = prepararHtmlFerramenta(ferramenta.html);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    return () => URL.revokeObjectURL(url);
  }, [ferramenta.html]);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      <Link
        to="/ferramentas"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        ← Todas as ferramentas
      </Link>
      <iframe
        ref={iframeRef}
        title={ferramenta.name}
        className="mt-6 w-full border-0"
        style={{ minHeight: "80vh" }}
      />
    </div>
  );
}
