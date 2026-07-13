import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    emailNotifications: "all" as "all" | "weekly" | "never",
    whatsappNotifications: "never" as "all" | "weekly" | "never",
    telegramNotifications: "never" as "all" | "weekly" | "never",
    preferredCategories: "",
  });

  const preferencesQuery = trpc.notifications.getPreferences.useQuery();
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferências atualizadas!");
    },
    onError: () => {
      toast.error("Erro ao atualizar preferências");
    },
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      setPreferences({
        emailNotifications: (preferencesQuery.data.emailNotifications || "all") as "all" | "weekly" | "never",
        whatsappNotifications: (preferencesQuery.data.whatsappNotifications || "never") as "all" | "weekly" | "never",
        telegramNotifications: (preferencesQuery.data.telegramNotifications || "never") as "all" | "weekly" | "never",
        preferredCategories: preferencesQuery.data.preferredCategories || "",
      });
    }
  }, [preferencesQuery.data]);

  const handleSave = () => {
    updateMutation.mutate(preferences);
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <Label>Notificações por Email</Label>
        <Select value={preferences.emailNotifications} onValueChange={(value) => setPreferences({ ...preferences, emailNotifications: value as "all" | "weekly" | "never" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as notificações</SelectItem>
            <SelectItem value="weekly">Resumo semanal</SelectItem>
            <SelectItem value="never">Desativar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Notificações por WhatsApp</Label>
        <Select value={preferences.whatsappNotifications} onValueChange={(value) => setPreferences({ ...preferences, whatsappNotifications: value as "all" | "weekly" | "never" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as notificações</SelectItem>
            <SelectItem value="weekly">Resumo semanal</SelectItem>
            <SelectItem value="never">Desativar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Notificações por Telegram</Label>
        <Select value={preferences.telegramNotifications} onValueChange={(value) => setPreferences({ ...preferences, telegramNotifications: value as "all" | "weekly" | "never" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as notificações</SelectItem>
            <SelectItem value="weekly">Resumo semanal</SelectItem>
            <SelectItem value="never">Desativar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending || preferencesQuery.isLoading}>
        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Preferências
      </Button>
    </div>
  );
}
