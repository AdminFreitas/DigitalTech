import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Honeypot field names - obfuscated to avoid detection by simple bots
const HONEYPOT_FIELDS = {
  website: "website_url",
  company: "company_name",
};

// Rate limiting constants
const RATE_LIMIT_KEY = "contact_form_submissions";
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_HOUR = 3;

// Check if user has exceeded rate limit
const checkRateLimit = (): boolean => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (!stored) return true;
  
  const submissions = JSON.parse(stored);
  const now = Date.now();
  const recentSubmissions = submissions.filter((time: number) => now - time < RATE_LIMIT_WINDOW);
  
  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return false;
  }
  
  return true;
};

// Record submission for rate limiting
const recordSubmission = (): void => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const submissions = stored ? JSON.parse(stored) : [];
  const now = Date.now();
  const recentSubmissions = submissions.filter((time: number) => now - time < RATE_LIMIT_WINDOW);
  recentSubmissions.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
};

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [honeypot, setHoneypot] = useState({
    [HONEYPOT_FIELDS.website]: "",
    [HONEYPOT_FIELDS.company]: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Nome é obrigatório";
        if (value.trim().length < 2) return "Nome deve ter pelo menos 2 caracteres";
        return "";
      case "email":
        if (!value.trim()) return "Email é obrigatório";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email inválido";
        return "";
      case "phone":
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return "Telefone inválido";
        return "";
      case "subject":
        if (!value.trim()) return "Assunto é obrigatório";
        if (value.trim().length < 3) return "Assunto deve ter pelo menos 3 caracteres";
        return "";
      case "message":
        if (!value.trim()) return "Mensagem é obrigatória";
        if (value.trim().length < 10) return "Mensagem deve ter pelo menos 10 caracteres";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors({ ...errors, [name]: error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && formData.name && formData.email && formData.subject && formData.message;

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso!");
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});
      setTouched({});
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot fields
    if (honeypot[HONEYPOT_FIELDS.website] || honeypot[HONEYPOT_FIELDS.company]) {
      console.warn("Honeypot triggered - spam detected");
      toast.success("Mensagem enviada com sucesso!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setHoneypot({ [HONEYPOT_FIELDS.website]: "", [HONEYPOT_FIELDS.company]: "" });
      return;
    }
    
    // Check rate limit
    if (!checkRateLimit()) {
      toast.error("Você enviou muitas mensagens. Tente novamente em 1 hora.");
      return;
    }
    
    if (!isFormValid) {
      toast.error("Por favor, preencha todos os campos corretamente");
      return;
    }
    
    recordSubmission();
    submitMutation.mutate(formData);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Honeypot fields - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name={HONEYPOT_FIELDS.website}
          value={honeypot[HONEYPOT_FIELDS.website]}
          onChange={(e) => setHoneypot({ ...honeypot, [HONEYPOT_FIELDS.website]: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="text"
          name={HONEYPOT_FIELDS.company}
          value={honeypot[HONEYPOT_FIELDS.company]}
          onChange={(e) => setHoneypot({ ...honeypot, [HONEYPOT_FIELDS.company]: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Mensagem enviada com sucesso!</p>
            <p className="text-sm text-green-700">Obrigado por entrar em contato. Responderemos em breve.</p>
          </div>
        </motion.div>
      )}

      <div>
        <Label htmlFor="name">Nome</Label>
        <motion.div
          initial={false}
          animate={{ scale: errors.name && touched.name ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Seu nome"
            className={errors.name && touched.name ? "border-red-500 focus:ring-red-500" : ""}
          />
        </motion.div>
        {errors.name && touched.name && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-1 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </motion.div>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <motion.div
          initial={false}
          animate={{ scale: errors.email && touched.email ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="seu@email.com"
            className={errors.email && touched.email ? "border-red-500 focus:ring-red-500" : ""}
          />
        </motion.div>
        {errors.email && touched.email && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-1 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </motion.div>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <motion.div
          initial={false}
          animate={{ scale: errors.phone && touched.phone ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="+55 11 99999-9999"
            className={errors.phone && touched.phone ? "border-red-500 focus:ring-red-500" : ""}
          />
        </motion.div>
        {errors.phone && touched.phone && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-1 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.phone}
          </motion.div>
        )}
      </div>

      <div>
        <Label htmlFor="subject">Assunto</Label>
        <motion.div
          initial={false}
          animate={{ scale: errors.subject && touched.subject ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            onBlur={() => handleBlur("subject")}
            placeholder="Assunto da mensagem"
            className={errors.subject && touched.subject ? "border-red-500 focus:ring-red-500" : ""}
          />
        </motion.div>
        {errors.subject && touched.subject && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-1 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.subject}
          </motion.div>
        )}
      </div>

      <div>
        <Label htmlFor="message">Mensagem</Label>
        <motion.div
          initial={false}
          animate={{ scale: errors.message && touched.message ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            placeholder="Sua mensagem aqui..."
            rows={5}
            className={errors.message && touched.message ? "border-red-500 focus:ring-red-500" : ""}
          />
        </motion.div>
        {errors.message && touched.message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-1 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.message}
          </motion.div>
        )}
      </div>

      <motion.div
        whileHover={{ scale: isFormValid ? 1.02 : 1 }}
        whileTap={{ scale: isFormValid ? 0.98 : 1 }}
      >
        <Button
          type="submit"
          disabled={submitMutation.isPending || !isFormValid}
          className="w-full"
        >
          {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
        </Button>
      </motion.div>
    </motion.form>
  );
}
