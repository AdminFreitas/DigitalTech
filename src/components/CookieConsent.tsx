import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CONSENT_OPEN_EVENT, CONSENT_STORAGE_KEY } from "@/lib/gtm";

type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const consentSettings = (value: ConsentValue) => ({
  ad_storage: value,
  ad_user_data: value,
  ad_personalization: value,
  analytics_storage: value,
});

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (savedConsent !== "granted" && savedConsent !== "denied") {
        setVisible(true);
      }
    } catch (error) {
      console.error("Não foi possível ler as preferências de cookies.", error);
      setVisible(true);
    }

    const openConsent = () => {
      setVisible(true);
      requestAnimationFrame(() => regionRef.current?.focus());
    };
    window.addEventListener(CONSENT_OPEN_EVENT, openConsent);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openConsent);
  }, []);

  const chooseConsent = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch (error) {
      console.error("Não foi possível salvar as preferências de cookies.", error);
    }

    window.gtag?.("consent", "update", consentSettings(value));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-label="Aviso de cookies"
      tabIndex={-1}
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl outline-none"
    >
      <div className="glass flex flex-col gap-4 rounded-xl p-4 shadow-2xl sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
          Usamos cookies do Google (Analytics e Ads) para medir o uso do site e exibir anúncios
          relevantes. Você pode aceitar ou recusar. Saiba mais na{" "}
          <Link
            to="/politica-de-privacidade"
            className="text-[color:var(--primary-cyan)] underline-offset-2 hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => chooseConsent("denied")}
            className="rounded-md border border-[var(--glass-border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-cyan)]"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => chooseConsent("granted")}
            className="rounded-md bg-[var(--primary-cyan)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-cyan)]"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
