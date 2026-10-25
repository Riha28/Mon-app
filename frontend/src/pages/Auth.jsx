import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Auth() {
 const { t } = useI18n();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", display_name: "", age: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const auth = getAuth(app);
      if (mode === "signup") {
        const age = parseInt(form.age, 10);
        if (isNaN(age) || age < 18) {
          toast.error(t("auth.ageMin"));
          setBusy(false);
          return;
        }
        if (!consent) {
          toast.error(t("auth.consentError"));
          setBusy(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await sendEmailVerification(cred.user);
        setSentTo(form.email);
        setNeedsVerify(true);
        toast.success(t("auth.checkEmail"));
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        setUser(cred.user);
        navigate("/app");
      }
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        toast.error(t("auth.invalidCredentials"));
      } else if (err.code === "auth/email-already-in-use") {
        toast.error(t("auth.emailInUse"));
      } else {
        toast.error(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const auth = getAuth(app);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success(t("auth.verifyResent"));
      } else {
        toast.success(t("auth.verifyResent"));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  const google = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      navigate("/app");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> <Logo size={34} withText variant="dark" />
        </button>
        <LanguageToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-up rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 flex justify-center"><Logo size={150} stacked /></div>
          {needsVerify ? (
            <div className="text-center" data-testid="verify-sent-panel">
              <MailCheck className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 font-serif text-2xl font-semibold">{t("auth.verifySentTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("auth.verifySentBody")} <strong className="break-all text-foreground">{sentTo}</strong></p>
              <p className="mt-1 text-xs text-muted-foreground">{t("auth.verifyExpiry")}</p>
              <Button variant="outline" className="mt-6 w-full rounded-full" onClick={resend} disabled={resending}>
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("auth.verifyResend")}
              </Button>
              <button className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => { setSentTo(null); setMode("login"); }}>
                {t("auth.toLogin")}
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl font-semibold">{mode === "signup" ? t("auth.createTitle") : t("auth.loginTitle")}</h1>
              {mode === "signup" && <p className="mt-1 text-sm text-muted-foreground">{t("auth.trialNote")}</p>}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <>
                    <div className="space-y-1.5">
                      <Label>{t("auth.displayName")}</Label>
                      <Input value={form.display_name} onChange={(e) => setForm({...form, display_name: e.target.value})} required data-testid="auth-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("auth.age")}</Label>
                      <Input type="number" min={18} max={120} value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} required data-testid="auth-age" />
                      <p className="text-xs text-muted-foreground">{t("auth.ageHint")}</p>
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label>{t("auth.email")}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required data-testid="auth-email" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("auth.password")}</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required data-testid="auth-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                {mode === "login" && (
                  <button type="button" onClick={() => navigate("/reset-password")} className="text-xs text-muted-foreground hover:text-foreground">
                    {t("auth.forgotPassword")}
                  </button>
                )}
                {mode === "signup" && (
                  <div className="flex items-start gap-2" data-testid="auth-consent-row">
                    <Checkbox id="consent" checked={consent} onCheckedChange={() => setConsent(v => !v)} className="mt-0.5" />
                    <label htmlFor="consent" className="text-xs leading-snug text-muted-foreground">
                      {t("auth.consentPrefix")}{" "}
                      <Link to="/legal" target="_blank" className="text-[hsl(var(--gold))] underline hover:opacity-80">{t("auth.consentLink")}</Link>
                    </label>
                  </div>
                )}
                <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="auth-submit">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {mode === "signup" ? t("auth.signup") : t("auth.login")}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />{t("auth.or")}<div className="h-px flex-1 bg-border" />
              </div>

              <Button variant="outline" className="w-full rounded-full" onClick={google} data-testid="auth-google">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {t("auth.google")}
              </Button>

              <button className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "signup" ? "login" : "signup")} data-testid="auth-toggle-mode">
                {mode === "signup" ? t("auth.toLogin") : t("auth.toSignup")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
