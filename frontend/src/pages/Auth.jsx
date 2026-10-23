import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function Auth() {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [form, setForm] = useState({ email: "", password: "", display_name: "", age: "" });
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resending, setResending] = useState(false);
  const [consent, setConsent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const age = parseInt(form.age, 10);
        if (!age || age < 18) {
          toast.error(t("auth.ageMin"));
          setBusy(false);
          return;
        }
        if (!consent) {
          toast.error(t("auth.consentError"));
          setBusy(false);
          return;
        }
        await api.post("/auth/register", { ...form, age });
        setSentTo(form.email);
        setBusy(false);
        return;
      }
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      setUser(data);
      navigate("/app");
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.detail?.code === "email_not_verified") {
        setNeedsVerify(true);
        toast.error(t("auth.verifyNeeded"));
      } else {
        toast.error(apiError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification", { email: sentTo || form.email });
      toast.success(t("auth.verifyResent"));
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setResending(false);
    }
  };

  const google = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/app";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="auth-back-btn">
          <ArrowLeft className="h-4 w-4" /> <Logo size={34} withText variant="dark" />
        </button>
        <LanguageToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-up rounded-3xl border border-[hsl(var(--gold))]/30 bg-card p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(212,175,55,0.12)]">
          <div className="mb-6 flex justify-center"><Logo size={150} stacked /></div>
          {sentTo ? (
            <div className="text-center" data-testid="verify-sent-panel">
              <MailCheck className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 font-serif text-2xl font-semibold">{t("auth.verifySentTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("auth.verifySentBody")} <strong className="break-all text-foreground">{sentTo}</strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("auth.verifyExpiry")}</p>
              <Button variant="outline" className="mt-6 w-full rounded-full" onClick={resend} disabled={resending} data-testid="verify-resend-btn">
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("auth.verifyResend")}
              </Button>
              <button className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => { setSentTo(null); setMode("login"); }} data-testid="verify-back-login-btn">
                {t("auth.toLogin")}
              </button>
            </div>
          ) : (
          <>
          <h1 className="font-serif text-3xl font-semibold">{mode === "signup" ? t("auth.createTitle") : t("auth.welcome")}</h1>
          {mode === "signup" && <p className="mt-1 text-sm text-primary">{t("auth.trialNote")}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>{t("auth.displayName")}</Label>
                <Input value={form.display_name} onChange={set("display_name")} required data-testid="auth-name-input" />
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>{t("auth.age")}</Label>
                <Input type="number" min={18} max={120} value={form.age} onChange={set("age")} required data-testid="auth-age-input" />
                <p className="text-xs text-muted-foreground">{t("auth.ageHint")}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{t("auth.email")}</Label>
              <Input type="email" value={form.email} onChange={set("email")} required data-testid="auth-email-input" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("auth.password")}</Label>
              <Input type="password" value={form.password} onChange={set("password")} required data-testid="auth-password-input" />
              {mode === "login" && (
                <button type="button" onClick={() => navigate("/reset-password")} className="text-xs font-medium text-[hsl(var(--gold))] hover:underline" data-testid="auth-forgot-password-link">Mot de passe oublié ?</button>
              )}
            </div>
            {mode === "signup" && (
              <div className="flex items-start gap-2" data-testid="auth-consent-row">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" data-testid="auth-consent-checkbox" />
                <label htmlFor="consent" className="text-xs leading-snug text-muted-foreground">
                  {t("auth.consentPrefix")}{" "}
                  <Link to="/legal" target="_blank" className="text-[hsl(var(--gold))] underline hover:opacity-80">{t("auth.consentTerms")}</Link>
                </label>
              </div>
            )}
            <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="auth-submit-btn">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "signup" ? t("auth.signup") : t("auth.login")}
            </Button>
          </form>

          {needsVerify && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-center" data-testid="login-verify-notice">
              <p className="text-xs text-muted-foreground">{t("auth.verifyNeeded")}</p>
              <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={resend} disabled={resending} data-testid="login-resend-btn">
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("auth.verifyResend")}
              </Button>
            </div>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />{t("auth.or")}<div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full rounded-full" onClick={google} data-testid="auth-google-btn">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" /></svg>
            {t("auth.google")}
          </Button>

          <button className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")} data-testid="auth-toggle-mode-btn">
            {mode === "signup" ? t("auth.toLogin") : t("auth.toSignup")}
          </button>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
