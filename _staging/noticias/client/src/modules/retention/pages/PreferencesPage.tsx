import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationPreferences } from "../components";
import { useLocation } from "wouter";

export default function PreferencesPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar autenticado para acessar suas preferências.</p>
          <Button onClick={() => navigate("/")}>Voltar à Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Preferências de Notificação</h1>
        <p className="text-muted-foreground mb-8">
          Configure como você deseja receber notificações sobre novas notícias e atualizações.
        </p>
        <NotificationPreferences />
      </div>
    </div>
  );
}
