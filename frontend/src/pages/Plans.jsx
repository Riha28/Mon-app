import React, { useEffect, useRef, useState } from "react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isFcfaCountry } from "@/lib/countries";
import { MomoDialog } from "@/components/MomoDialog";

function loadKkiapayScript() {
  return new Promise((resolve, reject) => {
    if (window.openKkiapayWidget) return resolve();
    const existing = document.getElementById("kkiapay-sdk");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const s = document.createElement("script");
    s.id = "kkiapay-sdk";
    s.src = "https://cdn.kkiapay.me/k.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Impossible de charger Kkiapay"));
    document.body.appendChild(s);
  });
}

export default function Plans() {
  const { user, refresh } = useAuth();
  const { t } = useI18n();
  const [packs, setPacks] = useState([]);
  const [subs, setSubs] = useState([]);
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState("");
  const intentRef = useRef(null);
  const listenersSet = useRef(false);
  const [momo, setMomo] = useState(null);
  const [momoItem, setMomoItem] = useState(null);
  const [momoReqs, setMomoReqs] = useState([]);
  const loadMomoReqs = async () => { try { const { data } = await api.get("/momo/requests/mine"); setMomoReqs(data.requests || []); } catch { /* */ } };
  const [currency, setCurrency] = useState(isFcfaCountry(user?.country) ? "fcfa" : "eur");
  const inAfrica = currency === "fcfa";
  const isSubscriber = user?.role === "admin" || ["standard", "premium", "vip", "gold", "platinum"].includes(user?.access_level);
  const showCredits = !isSubscriber;

  useEffect(() => {
    (async () => { try { const { data } = await api.get("/credits/packs"); setPacks(data.packs); } catch (e) { toast.error(apiError(e)); } })();
    (async () => { try { const { data } = await api.get("/subscription-options"); setSubs(data.plans || []); } catch { /* */ } })();
    (async () => { try { const { data } = await api.get("/momo/config"); setMomo(data); } catch { /* */ } })();
    loadMomoReqs();
    refresh();
    // eslint-disable-next-line
  }, []);

  const subscribe = async (plan) => {
    setBusy(plan.id + "-sub");
    try {
      const { data } = await api.post("/payments/subscribe", { plan: plan.id, months, origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) { toast.error(apiError(e)); setBusy(""); }
  };

  const stripe = async (pack) => {
    setBusy(pack.id + "-stripe");
    try {
      const { data } = await api.post("/credits/stripe/checkout", { pack_id: pack.id, origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) { toast.error(apiError(e)); setBusy(""); }
  };

  const registerListeners = () => {
    if (listenersSet.current || !window.addSuccessListener) return;
    listenersSet.current = true;
    window.addSuccessListener(async (resp) => {
      const txId = resp?.transactionId || resp;
      const intent = intentRef.current;
      if (!intent) return;
      try {
        if (intent.kind === "sub") {
          await api.post("/payments/kkiapay/verify", { intent_id: intent.id, transaction_id: txId });
          await refresh();
          toast.success(t("subs.kkSuccess"));
        } else {
          const { data } = await api.post("/credits/kkiapay/verify", { intent_id: intent.id, transaction_id: txId });
          await refresh();
          toast.success(t("credits.added", { n: data.added }));
        }
      } catch (e) { toast.error(apiError(e)); }
      finally { setBusy(""); intentRef.current = null; }
    });
    window.addFailedListener(() => { toast.error(t("plans.payFailed")); setBusy(""); intentRef.current = null; });
  };

  const kkiapay = async (pack) => {
    setBusy(pack.id + "-kkiapay");
    try {
      await loadKkiapayScript();
      registerListeners();
      const { data } = await api.post("/credits/kkiapay/intent", { pack_id: pack.id });
      intentRef.current = { id: data.intent_id, kind: "credit" };
      window.openKkiapayWidget({
        amount: data.amount, key: data.public_key, sandbox: data.sandbox,
        position: "center", paymentmethod: "momo", name: user?.display_name || "",
        data: data.intent_id, theme: "#D4AF37",
      });
    } catch (e) { toast.error(apiError(e)); setBusy(""); }
  };

  const momoOn = !!momo?.enabled;
  const momoSub = (p) => setMomoItem({ label: `Abonnement ${p.name} — 1 mois`, amount: p.price_fcfa, payload: { kind: "sub", plan: p.id } });
  const momoPack = (p) => setMomoItem({ label: `${p.credits} crédits`, amount: p.price_fcfa, payload: { kind: "credits", pack_id: p.id } });
  const pendingReqs = momoReqs.filter((r) => r.status !== "approved").slice(0, 3);

  const kkiapaySubscribe = async (plan) => {
    setBusy(plan.id + "-subkk");
    try {
      await loadKkiapayScript();
      registerListeners();
      const { data } = await api.post("/payments/kkiapay/intent", { plan: plan.id });
      intentRef.current = { id: data.intent_id, kind: "sub" };
      window.openKkiapayWidget({
        amount: data.amount, key: data.public_key, sandbox: data.sandbox,
        position: "center", paymentmethod: "momo", name: user?.display_name || "",
        data: data.intent_id, theme: "#D4AF37",
      });
    } catch (e) { toast.error(apiError(e)); setBusy(""); }
  };

  return (
    <div className="mx-auto max-w-5xl" data-testid="credits-page">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-4xl font-semibold">{showCredits ? t("credits.title") : t("subs.title")}</h1>
        <p className="mt-2 text-muted-foreground">{showCredits ? t("credits.subtitle") : t("subs.subtitle")}</p>
      </div>

      <MomoDialog item={momoItem} config={momo} onClose={() => setMomoItem(null)} onDone={() => { setMomoItem(null); loadMomoReqs(); }} />
      {pendingReqs.length > 0 && (
        <div className="mx-auto mb-6 max-w-lg space-y-2" data-testid="momo-my-requests">
          {pendingReqs.map((r) => (
            <div key={r.request_id} className={`rounded-xl border px-4 py-3 text-sm ${r.status === "pending" ? "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5" : "border-destructive/40 bg-destructive/10"}`} data-testid={`momo-my-req-${r.request_id}`}>
              <b>{r.label}</b> · {r.amount.toLocaleString("fr-FR")} FCFA — {r.status === "pending" ? "paiement en cours de vérification" : "paiement refusé, contactez l'Aide"}
            </div>
          ))}
        </div>
      )}

      {/* Balance for free accounts · unlimited banner for subscribers */}
      {showCredits ? (
        <div className="mx-auto mb-8 flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 p-5" data-testid="credits-balance">
          <Coins className="h-8 w-8 text-[hsl(var(--gold))]" />
          <div className="text-center">
            <p className="font-serif text-4xl font-bold text-[hsl(var(--gold))]" data-testid="credits-balance-value">{user?.credits ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("credits.balance")}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-2.5 rounded-2xl border border-emerald-brand/40 bg-emerald-brand/10 p-5 text-center" data-testid="credits-unlimited-banner">
          <Sparkles className="h-6 w-6 shrink-0 text-emerald-brand" />
          <p className="text-sm font-semibold text-foreground">{t("plans.unlimitedActive")}</p>
        </div>
      )}

      {showCredits && (
        <>
          <p className="mb-5 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-[hsl(var(--gold))]" /> {t("credits.howitworks")}
          </p>

          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-[hsl(var(--gold))]/40 bg-gradient-to-br from-[hsl(var(--gold))]/10 to-transparent p-4 text-center" data-testid="credits-welcome-note">
            <p className="text-sm font-medium text-foreground">🎁 <span className="font-semibold text-[hsl(var(--gold))]">5 crédits de bienvenue</span> offerts à l'inscription</p>
          </div>
        </>
      )}

      {/* Subscriptions — unlimited */}
      {subs.length > 0 && (
        <div className="mb-10" data-testid="subs-section">
          <h2 className="mb-1 text-center font-serif text-2xl font-semibold">{t("subs.title")}</h2>
          <p className="mb-4 text-center text-sm text-muted-foreground">{t("subs.subtitle")}</p>
          <div className="mb-4 flex justify-center" data-testid="currency-toggle">
            <div className="inline-flex rounded-full border border-[hsl(var(--gold))]/40 p-1 text-sm">
              {[["fcfa", "Afrique · FCFA"], ["eur", "Europe · €"]].map(([k, l]) => (
                <button key={k} onClick={() => setCurrency(k)} data-testid={`currency-${k}`}
                  className={`rounded-full px-4 py-1.5 font-medium transition-colors ${currency === k ? "bg-[hsl(var(--gold))] text-[#0A0908]" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
              ))}
            </div>
          </div>

          {!inAfrica && (
            <div className="mb-6 flex flex-wrap justify-center gap-2" data-testid="duration-toggle">
              {(subs[0]?.durations || []).map((d) => (
                <button key={d.months} onClick={() => setMonths(d.months)} data-testid={`duration-${d.months}`}
                  className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${months === d.months ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {d.label}
                  {d.discount_pct > 0 && <span className="ml-1.5 rounded-full bg-emerald-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-brand">-{d.discount_pct}%</span>}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((p) => {
              const d = p.durations.find((x) => x.months === months) || p.durations[0];
              const current = user?.subscription_plan === p.id && user?.subscription_status === "active";
              return (
                <div key={p.id} data-testid={`sub-card-${p.id}`} className={`relative flex flex-col rounded-3xl border p-6 ${p.popular ? "border-[hsl(var(--gold))] bg-card ring-1 ring-[hsl(var(--gold))]/40" : "border-border bg-card"}`}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-3 py-1 text-xs font-semibold text-[#0A0908]">{t("plans.popular")}</span>}
                  <h3 className="font-serif text-xl font-semibold">{p.name}</h3>
                  {inAfrica ? (
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold">{(p.price_fcfa || 0).toLocaleString("fr-FR")}</span>
                      <span className="text-sm text-muted-foreground">FCFA / {t("plans.month")}</span>
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-serif text-3xl font-bold">{d.total_eur}€</span>
                        <span className="text-sm text-muted-foreground">/ {months === 1 ? t("plans.month") : d.label}</span>
                      </div>
                      {months > 1 && <p className="text-xs text-muted-foreground">≈ {d.per_month_eur}€ / {t("plans.month")}{d.discount_pct > 0 && <span className="ml-1 font-semibold text-emerald-brand">(-{d.discount_pct}%)</span>}</p>}
                    </>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[hsl(var(--gold))]"><Sparkles className="h-3 w-3" /> {t("subs.unlimited")}</p>
                  <ul className="mt-3 flex-1 space-y-2 text-left text-sm text-muted-foreground">
                    {p.features.slice(0, 4).map((f, i) => <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-brand" />{f}</li>)}
                  </ul>
                  {current ? (
                    <div className="mt-5 rounded-full bg-secondary py-2.5 text-center text-sm font-medium text-muted-foreground" data-testid={`sub-current-${p.id}`}>{t("plans.current")}</div>
                  ) : inAfrica ? (
                    <Button className="mt-5 w-full rounded-full" onClick={() => (momoOn ? momoSub(p) : kkiapaySubscribe(p))} disabled={!!busy} data-testid={`sub-kkiapay-${p.id}`}>
                      {busy === p.id + "-subkk" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}{t("subs.kkSubscribe")}
                    </Button>
                  ) : (
                    <Button className="mt-5 w-full rounded-full" onClick={() => subscribe(p)} disabled={!!busy} data-testid={`sub-stripe-${p.id}`}>
                      {busy === p.id + "-sub" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("subs.subscribe")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">{inAfrica ? t("subs.kkNote") : t("subs.autorenew")}</p>
          {showCredits && (
            <>
              <div className="my-8 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs uppercase tracking-widest text-muted-foreground">{t("subs.or")}</span><div className="h-px flex-1 bg-border" /></div>
              <h2 className="mb-1 text-center font-serif text-2xl font-semibold">{t("credits.packsTitle")}</h2>
              <p className="mb-5 text-center text-sm text-muted-foreground">{t("credits.packsSubtitle")}</p>
            </>
          )}
        </div>
      )}

      {showCredits && (<>
      <div className="grid gap-5 sm:grid-cols-3">
        {packs.map((p) => (
          <div key={p.id} data-testid={`pack-card-${p.id}`}
            className={`relative flex flex-col rounded-3xl border p-6 text-center transition-all ${p.popular ? "border-[hsl(var(--gold))] bg-card shadow-[0_0_40px_rgba(212,175,55,0.15)] ring-1 ring-[hsl(var(--gold))]/40" : "border-border bg-card"}`}>
            {p.tag && (
              <span className="absolute left-4 top-4 max-w-[45%] rounded-md bg-[hsl(var(--gold))]/15 px-2 py-1 text-left text-[10px] font-semibold leading-tight text-[hsl(var(--gold))]" data-testid={`pack-tag-${p.id}`}>
                {p.tag}
              </span>
            )}
            {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-3 py-1 text-xs font-semibold text-[#0A0908]">{t("plans.popular")}</span>}
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><Coins className="h-6 w-6" /></div>
            <div className="font-serif text-5xl font-bold gold-gradient-text">{p.credits}</div>
            <p className="text-sm text-muted-foreground">{t("credits.creditsLabel")}</p>
            <div className="mt-3 font-serif text-2xl font-bold">{inAfrica ? `${p.price_fcfa.toLocaleString("fr-FR")} FCFA` : `${p.price_eur}€`}</div>
            <ul className="mx-auto mt-4 mb-5 flex-1 space-y-2 text-left text-sm">
              {(p.features || []).map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-brand" />{f}</li>
              ))}
            </ul>
            {inAfrica ? (
              <Button className="w-full rounded-full" onClick={() => (momoOn ? momoPack(p) : kkiapay(p))} disabled={!!busy} data-testid={`pack-kkiapay-${p.id}`}>
                {busy === p.id + "-kkiapay" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}{t("plans.buy")}
              </Button>
            ) : (
              <Button className="w-full rounded-full" onClick={() => stripe(p)} disabled={!!busy} data-testid={`pack-stripe-${p.id}`}>
                {busy === p.id + "-stripe" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}{t("plans.buy")}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[hsl(var(--gold))]/20 bg-card p-5 text-center text-sm text-muted-foreground" data-testid="credits-vip-note">
        <Sparkles className="mx-auto mb-1 h-5 w-5 text-[hsl(var(--gold))]" />
        {t("credits.vipNote")}
      </div>
      </>)}
    </div>
  );
}
