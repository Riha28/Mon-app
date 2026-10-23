import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, MailCheck, ArrowLeft } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const requestLink = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post("/auth/forgot-password", { email }); setSent(true); }
    catch (err) { toast.error(apiError(err)); }
    finally { setBusy(false); }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (pw !== pw2) { toast.error("Les deux mots de passe ne sont pas identiques"); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password: pw });
      toast.success(data.message);
      navigate("/auth");
    } catch (err) { toast.error(apiError(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8"><Logo size={40} withText variant="dark" /></div>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl" data-testid="reset-password-page">
        <KeyRound className="mx-auto h-10 w-10 text-[hsl(var(--gold))]" />
        <h1 className="mt-4 text-center font-serif text-2xl font-semibold">{token ? "Nouveau mot de passe" : "Mot de passe oublié"}</h1>

        {token ? (
          <form onSubmit={reset} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label>Nouveau mot de passe (8 caractères minimum)</Label>
              <Input type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} data-testid="reset-new-password-input" /></div>
            <div className="space-y-1.5"><Label>Confirmez le mot de passe</Label>
              <Input type="password" minLength={8} required value={pw2} onChange={(e) => setPw2(e.target.value)} data-testid="reset-confirm-password-input" /></div>
            <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="reset-submit-btn">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer le mot de passe
            </Button>
          </form>
        ) : sent ? (
          <div className="mt-6 text-center" data-testid="forgot-sent">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-brand" />
            <p className="mt-3 text-sm text-muted-foreground">Si un compte existe avec <b className="text-foreground">{email}</b>, vous allez recevoir un e-mail avec un lien pour choisir un nouveau mot de passe (valable 1 heure). Pensez à vérifier vos spams.</p>
          </div>
        ) : (
          <form onSubmit={requestLink} className="mt-6 space-y-4">
            <p className="text-center text-sm text-muted-foreground">Entrez votre e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
            <Input type="email" required placeholder="Votre e-mail" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email-input" />
            <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="forgot-submit-btn">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Recevoir le lien
            </Button>
          </form>
        )}

        <button onClick={() => navigate("/auth")} className="mx-auto mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="reset-back-login-btn">
          <ArrowLeft className="h-4 w-4" />Retour à la connexion
        </button>
      </div>
    </div>
  );
}
