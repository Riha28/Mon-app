import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, MessageCircleHeart, ArrowRight, Heart, BadgeCheck, MapPin, Check, Facebook, Twitter, Youtube, Star, LifeBuoy } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const WA_TZ = ["Africa/Abidjan", "Africa/Dakar", "Africa/Porto-Novo", "Africa/Lome", "Africa/Bamako", "Africa/Niamey", "Africa/Ouagadougou", "Africa/Bissau"];
function detectCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return WA_TZ.includes(tz) ? "fcfa" : "eur";
  } catch { return "eur"; }
}

const HERO = "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/78rcx4w0_IMG_0833.jpeg";
const COUPLES = [
  "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/2yfiix4l_IMG_0906.jpeg",
  "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/6jjbosvw_IMG_0908.webp",
  "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/i7thwyr3_IMG_0909.jpeg",
  "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/1nl37dle_IMG_0905.jpeg",
];

export default function Landing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [cur, setCur] = useState(detectCurrency());

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const features = [
    { icon: ShieldCheck, t: t("landing.cardVerified.t"), d: t("landing.cardVerified.d") },
    { icon: Lock, t: t("landing.cardPrivacy.t"), d: t("landing.cardPrivacy.d") },
    { icon: MessageCircleHeart, t: t("landing.cardSecure.t"), d: t("landing.cardSecure.d") },
  ];
  const steps = [t("landing.step1"), t("landing.step2"), t("landing.step3"), t("landing.step4"), t("landing.step5")];
  const plans = [
    { id: "decouverte", name: "Découverte", eur: "15€", fcfa: "5 000 FCFA", hot: false,
      feats: [t("landing.subs.d1"), t("landing.subs.d2"), t("landing.subs.d3"), t("landing.subs.d4")] },
    { id: "populaire", name: "Populaire", eur: "29,99€", fcfa: "10 000 FCFA", hot: true,
      feats: [t("landing.subs.p1"), t("landing.subs.p2"), t("landing.subs.p3"), t("landing.subs.p4")] },
    { id: "vip", name: "VIP", eur: "49,99€", fcfa: "15 000 FCFA", hot: false,
      feats: [t("landing.subs.v1"), t("landing.subs.v2"), t("landing.subs.v3"), t("landing.subs.v4")] },
    { id: "gold", name: "Gold", eur: "79,99€", fcfa: "25 000 FCFA", hot: false,
      feats: [t("landing.subs.g1"), t("landing.subs.g2"), t("landing.subs.g3"), t("landing.subs.g4")] },
    { id: "platinum", name: "Platinum", eur: "129,99€", fcfa: "40 000 FCFA", hot: false,
      feats: [t("landing.subs.pl1"), t("landing.subs.pl2"), t("landing.subs.pl3"), t("landing.subs.pl4")] },
  ];

  const compareCols = ["Découverte", "Populaire", "VIP", "Gold", "Platinum"];
  const compareRows = [
    { label: t("cmp.r1"), v: [true, true, true, true, true] },
    { label: t("cmp.r2"), v: [true, true, true, true, true] },
    { label: t("cmp.r3"), v: [true, true, true, true, true] },
    { label: t("cmp.r4"), v: [false, true, true, true, true] },
    { label: t("cmp.r5"), v: [false, true, true, true, true] },
    { label: t("cmp.r6"), v: [false, false, true, true, true] },
    { label: t("cmp.r7"), v: [false, false, true, true, true] },
    { label: t("cmp.r8"), v: [false, false, true, true, true] },
    { label: t("cmp.r9"), v: [false, false, false, true, true] },
    { label: t("cmp.r10"), v: [false, false, false, true, true] },
    { label: t("cmp.r11"), v: [false, false, false, true, true] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--gold))]/20 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="landing-logo-btn">
            <Logo size={44} withText />
          </button>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="border-b-2 border-[hsl(var(--gold))] pb-0.5 text-foreground" data-testid="landing-nav-home">{t("landing.nav.home")}</button>
            <button onClick={() => scrollTo("how")} className="transition-colors hover:text-foreground" data-testid="landing-nav-how">{t("landing.nav.how")}</button>
            <button onClick={() => scrollTo("pricing")} className="transition-colors hover:text-foreground" data-testid="landing-nav-pricing">{t("landing.nav.pricing")}</button>
            <button onClick={() => navigate("/auth")} className="transition-colors hover:text-foreground" data-testid="landing-nav-login">{t("nav.login")}</button>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth?mode=signup")} className="rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-4 py-2 text-sm font-semibold text-[#0A0908] shadow-[0_4px_20px_rgba(212,175,55,0.35)] ring-1 ring-[hsl(var(--gold))]/30 transition-transform hover:scale-[1.03]" data-testid="landing-signup-pill">
              {t("landing.signupFree")}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[hsl(var(--gold))]">
            <Heart className="h-3.5 w-3.5 text-[#E23B4E]" /> {t("landing.tagline")}
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
            <span className="gold-gradient-text">{t("landing.heroTitle1")}</span><br />
            <span className="gold-gradient-text">{t("landing.heroTitle2")}</span>
          </h1>
          <p className="mt-4 font-serif text-2xl italic text-[hsl(var(--gold))]/80">{t("landing.heroSub")}</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">{t("landing.subtitle")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate("/auth?mode=signup")} className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-8 py-3.5 text-base font-semibold text-[#0A0908] shadow-[0_4px_24px_rgba(212,175,55,0.35)] ring-1 ring-[hsl(var(--gold))]/30 transition-transform hover:scale-[1.03]" data-testid="landing-cta-btn">
              {t("landing.trialBtn")} <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/auth")} className="rounded-full border border-[hsl(var(--gold))] px-8 py-3.5 text-base font-medium text-[hsl(var(--gold))] transition-colors hover:bg-[hsl(var(--gold))]/10" data-testid="landing-cta2-btn">
              {t("landing.cta2")}
            </button>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BadgeCheck className="h-4 w-4 text-[hsl(var(--gold))]" /> KYC Stripe Identity</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-[hsl(var(--gold))]" /> Bénin · Togo · Côte d'Ivoire · Sénégal ↔ Europe</span>
          </div>
        </div>
        <div className="animate-fade-up">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[hsl(var(--gold))]/30 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.12)]">
            <img src={HERO} alt="Diaspora Love Connect" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Showcase couples — mis en avant juste sous la bannière */}
      <section className="mx-auto max-w-6xl px-4 pb-8" data-testid="landing-couples-showcase">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {COUPLES.map((src, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[hsl(var(--gold))]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]" data-testid={`landing-couple-${i}`}>
              <img src={src} alt="Couple" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908]/60 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* Welcome / Mission — explique le sens du site */}
      <section className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14" data-testid="landing-welcome">
        <div className="relative overflow-hidden rounded-[2rem] border border-[hsl(var(--gold))]/30 bg-gradient-to-br from-[hsl(var(--gold))]/10 via-card to-card p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(212,175,55,0.12)] sm:p-12">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/60 to-transparent" />
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[hsl(var(--gold))]">
              <Heart className="h-3.5 w-3.5 text-[#E23B4E]" /> {t("landing.welcome.tag")}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              <span className="gold-gradient-text">{t("landing.welcome.title")}</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{t("landing.welcome.p1")}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{t("landing.welcome.p2")}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
            {[
              { icon: Heart, t: t("landing.welcome.h1"), d: t("landing.welcome.h1d") },
              { icon: BadgeCheck, t: t("landing.welcome.h2"), d: t("landing.welcome.h2d") },
              { icon: MessageCircleHeart, t: t("landing.welcome.h3"), d: t("landing.welcome.h3d") },
            ].map((h, i) => (
              <div key={i} className="rounded-2xl border border-[hsl(var(--gold))]/20 bg-background/40 p-6 text-center" data-testid={`landing-welcome-pillar-${i}`}>
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><h.icon className="h-5 w-5" /></div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{h.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{h.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button onClick={() => navigate("/auth?mode=signup")} className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-8 py-3.5 text-base font-semibold text-[#0A0908] shadow-[0_4px_24px_rgba(212,175,55,0.35)] ring-1 ring-[hsl(var(--gold))]/30 transition-transform hover:scale-[1.03]" data-testid="landing-welcome-cta">
              {t("landing.welcome.cta")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl border border-[hsl(var(--gold))]/30 bg-card p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(212,175,55,0.12)] transition-all hover:-translate-y-1 hover:border-[hsl(var(--gold))]/60">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/50 to-transparent" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><f.icon className="h-6 w-6" /></div>
              <h3 className="font-serif text-2xl font-semibold text-foreground">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="mb-10 text-center font-serif text-4xl font-semibold text-foreground">{t("landing.how")}</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-2xl border border-[hsl(var(--gold))]/20 bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[hsl(var(--gold))] bg-transparent font-serif text-lg font-bold text-[hsl(var(--gold))]">{i + 1}</div>
              <p className="text-sm text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — subscriptions */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-3 text-center font-serif text-4xl font-semibold text-foreground">{t("landing.subs.title")}</h2>
        <p className="mb-6 text-center text-muted-foreground">{t("landing.subs.subtitle")}</p>

        <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-[hsl(var(--gold))]/30 bg-card p-1" data-testid="landing-currency-toggle">
          <button onClick={() => setCur("eur")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${cur === "eur" ? "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]" : "text-muted-foreground hover:text-foreground"}`} data-testid="currency-eur">€ Europe</button>
          <button onClick={() => setCur("fcfa")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${cur === "fcfa" ? "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]" : "text-muted-foreground hover:text-foreground"}`} data-testid="currency-fcfa">FCFA Afrique</button>
        </div>

        <div className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-3xl border border-[hsl(var(--gold))]/40 bg-gradient-to-br from-[hsl(var(--gold))]/10 to-transparent p-6 text-center sm:p-8" data-testid="landing-trial-banner">
          <span className="mb-2 inline-block rounded-full bg-[hsl(var(--gold))]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--gold))]">{t("landing.subs.trialTag")}</span>
          <h3 className="font-serif text-3xl font-bold text-foreground">{t("landing.subs.trialTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("landing.subs.trialDesc")}</p>
          <button onClick={() => navigate("/auth?mode=signup")} className="mt-5 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-7 py-2.5 text-sm font-semibold text-[#0A0908] ring-1 ring-[hsl(var(--gold))]/30 transition-transform hover:scale-[1.03]" data-testid="landing-trial-cta">
            {t("landing.subs.trialCta")}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((p, i) => (
            <div key={i} className={`relative flex flex-col rounded-3xl border p-7 ${p.hot ? "border-[hsl(var(--gold))] bg-card shadow-[0_0_40px_rgba(212,175,55,0.15)] ring-1 ring-[hsl(var(--gold))]/40" : "border-[hsl(var(--gold))]/25 bg-card"}`} data-testid={`landing-plan-${p.id}`}>
              {p.hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] px-3 py-1 text-xs font-semibold text-[#0A0908] ring-1 ring-[hsl(var(--gold))]/40">{t("landing.subs.popular")}</span>}
              <h3 className="font-serif text-2xl font-semibold text-foreground">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold gold-gradient-text">{cur === "fcfa" ? p.fcfa : p.eur}</span>
                <span className="text-sm text-muted-foreground">{t("landing.subs.month")}</span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--gold))]"><MessageCircleHeart className="h-4 w-4" /> {t("landing.subs.unlimited")}</p>
              <ul className="mt-4 flex-1 space-y-2.5 text-left">
                {p.feats.map((f, j) => <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-brand" />{f}</li>)}
              </ul>
              <button onClick={() => navigate("/auth?mode=signup")} className={`mt-6 rounded-full py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${p.hot ? "bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] text-[#0A0908] ring-1 ring-[hsl(var(--gold))]/30" : "border border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/10"}`} data-testid={`landing-plan-cta-${p.id}`}>
                {t("landing.subs.cta")}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison matrix */}
        <div className="mt-14" data-testid="landing-compare">
          <h3 className="mb-6 text-center font-serif text-2xl font-semibold text-foreground sm:text-3xl">{t("cmp.title")}</h3>
          <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--gold))]/25">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--gold))]/20 bg-[hsl(var(--gold))]/5">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("cmp.feature")}</th>
                  {compareCols.map((c, i) => (
                    <th key={c} className={`px-3 py-3 text-center font-serif text-base font-semibold ${i === 1 ? "text-[hsl(var(--gold))]" : "text-foreground"}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-left text-muted-foreground">{row.label}</td>
                    {row.v.map((on, ci) => (
                      <td key={ci} className="px-3 py-3 text-center">
                        {on
                          ? <Check className="mx-auto h-4 w-4 text-emerald-brand" />
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="border-t border-[hsl(var(--gold))]/15 bg-card/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center font-serif text-4xl font-semibold text-foreground">Ils se sont trouvés</h2>
          <p className="mb-10 text-center text-muted-foreground">Des témoignages de membres qui ont trouvé l'amour sur Diaspora Love Connect.</p>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { img: "https://images.unsplash.com/photo-1601326374180-e118ac4f7af4", name: "Aminata & Cheikh", loc: "Dakar ↔ Paris", quote: "On s'est rencontrés ici il y a un an. Aujourd'hui nous sommes fiancés. La vérification nous a mis en confiance dès le début." },
              { img: "https://images.unsplash.com/photo-1586232902955-df204f34b36e", name: "David", loc: "Marseille", quote: "Enfin une appli sérieuse pour la diaspora. J'ai rencontré une femme formidable d'Abidjan, on se voit chaque mois." },
              { img: "https://images.unsplash.com/photo-1709810529099-0ce6102692df", name: "Grace", loc: "Bruxelles", quote: "Le côté sécurisé et culturel change tout. Discussions sincères, respect, et une vraie belle histoire à la clé." },
            ].map((tt, i) => (
              <div key={i} className="rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" data-testid={`landing-testimonial-${i}`}>
                <div className="flex items-center gap-1 text-[hsl(var(--gold))]">
                  {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">“{tt.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={`${tt.img}?auto=format&fit=crop&w=120&h=120&q=80`} alt={tt.name} className="h-11 w-11 rounded-full object-cover ring-1 ring-[hsl(var(--gold))]/40" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tt.name}</p>
                    <p className="text-xs text-muted-foreground">{tt.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--gold))]/20 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Facebook className="h-4 w-4 transition-colors hover:text-[hsl(var(--gold))]" />
            <Twitter className="h-4 w-4 transition-colors hover:text-[hsl(var(--gold))]" />
            <Youtube className="h-4 w-4 transition-colors hover:text-[hsl(var(--gold))]" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/app/support")} className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--gold))]/50 px-3 py-1 font-medium text-[hsl(var(--gold))] transition-colors hover:bg-[hsl(var(--gold))]/10" data-testid="landing-support-link"><LifeBuoy className="h-4 w-4" />Aide & Support</button>
            <button onClick={() => navigate("/legal")} className="hover:text-foreground" data-testid="landing-about-link">{t("landing.about")}</button>
            <a href="mailto:supportdiasporaloveconnect@gmail.com" className="hover:text-foreground" data-testid="landing-contact-link">{t("landing.contact")} : supportdiasporaloveconnect@gmail.com</a>
            <button onClick={() => navigate("/legal")} className="hover:text-foreground" data-testid="landing-legal-link">{t("landing.footerLegal")}</button>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Diaspora Love Connect</p>
        </div>
      </footer>
    </div>
  );
}
