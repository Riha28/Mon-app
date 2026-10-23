import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [params] = useSearchParams();
  const isCancel = location.pathname.includes("cancel");
  const [status, setStatus] = useState(isCancel ? "cancel" : "polling");

  useEffect(() => {
    if (isCancel) return;
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const { data } = await api.get(`/credits/stripe/status/${sessionId}`);
        if (data.credited) { await refresh(); setStatus("success"); return; }
      } catch { /* */ }
      if (attempts >= 12) { setStatus("timeout"); return; }
      setTimeout(poll, 2000);
    };
    poll();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center" data-testid="payment-result">
        {status === "polling" && <><Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" /><p className="text-muted-foreground">Confirmation du paiement…</p></>}
        {status === "success" && <><CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-brand" /><h1 className="font-serif text-2xl font-semibold">Crédits ajoutés 🎉</h1><p className="mt-2 text-sm text-muted-foreground">Vos crédits ont été ajoutés à votre solde.</p><Button className="mt-6 rounded-full" onClick={() => navigate("/app")} data-testid="payment-continue-btn">Continuer</Button></>}
        {(status === "cancel" || status === "timeout" || status === "error") && <><XCircle className="mx-auto mb-4 h-14 w-14 text-destructive" /><h1 className="font-serif text-2xl font-semibold">{status === "cancel" ? "Paiement annulé" : "Paiement en attente"}</h1><Button variant="outline" className="mt-6 rounded-full" onClick={() => navigate("/app/plans")} data-testid="payment-retry-btn">Retour aux crédits</Button></>}
      </div>
    </div>
  );
}
