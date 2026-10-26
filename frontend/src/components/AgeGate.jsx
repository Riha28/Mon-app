import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const AgeGate = () => {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const [age, setAge] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = parseInt(age, 10);
    if (!n || n < 18) {
      toast.error(t("auth.ageMin"));
      return;
    }
    if (!consent) {
      toast.error(t("auth.consentError"));
      return;
    }
 setBusy(true);
  try {
    localStorage.setItem("diaspora_age", String(n));
    setUser((prev) => ({ ...(prev || {}), age: n }));
    toast.success(t("agegate.ok"));
  } catch (err) {
    toast.error("Erreur");
  } finally {
    setBusy(false);
  }
  };
  
    <div className="flex min-h-screen items-center justify-center bg-background px-4" data-testid="age-gate">
      <div className="w-full max-w-md rounded-3xl border border-[hsl(var(--gold))]/30 bg-card p-8 text-center shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)]">
        <div className="mb-4 flex justify-center"><Logo /></div>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{t("agegate.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("agegate.desc")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4 text-left">
          <div className="space-y-1.5">
            <Label>{t("auth.age")}</Label>
            <Input type="number" min={18} max={120} value={age} onChange={(e) => setAge(e.target.value)} required data-testid="agegate-age-input" />
            <p className="text-xs text-muted-foreground">{t("auth.ageHint")}</p>
          </div>
          <div className="flex items-start gap-2" data-testid="agegate-consent-row">
            <Checkbox id="agegate-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" data-testid="agegate-consent-checkbox" />
            <label htmlFor="agegate-consent" className="text-xs leading-snug text-muted-foreground">
              {t("auth.consentPrefix")}{" "}
              <Link to="/legal" target="_blank" className="text-[hsl(var(--gold))] underline hover:opacity-80">{t("auth.consentTerms")}</Link>
            </label>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="agegate-submit-btn">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("agegate.confirm")}
          </Button>
        </form>
      </div>
    </div>
  );
};
