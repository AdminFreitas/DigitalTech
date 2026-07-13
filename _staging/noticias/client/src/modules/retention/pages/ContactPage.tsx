import { ContactForm } from "../components";

export default function ContactPage() {
  return (
    <div className="py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Entre em Contato</h1>
        <p className="text-muted-foreground mb-8">
          Tem uma sugestão de pauta, reportar um erro ou quer nos enviar um feedback? Preencha o formulário abaixo.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
