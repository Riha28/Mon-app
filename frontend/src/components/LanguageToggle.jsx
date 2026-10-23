import React from "react";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex overflow-hidden rounded-full border border-border text-xs font-medium ${className}`} data-testid="lang-toggle">
      {["fr", "en"].map((l) => (
        <button
          key={l}
          data-testid={`lang-${l}`}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
