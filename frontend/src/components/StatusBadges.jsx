import React from "react";
import { Clock, ShieldCheck, Crown, BadgeCheck, Lock, Gem } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PlanBadge({ level, daysLeft }) {
  const { t } = useI18n();
  const map = {
    trial: { label: `${t("status.trial")}${daysLeft != null ? ` · ${daysLeft}${t("status.daysLeft")}` : ""}`, icon: Clock, cls: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/60" },
    free: { label: t("status.free"), icon: Lock, cls: "bg-stone-200 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700" },
    standard: { label: t("status.standard"), icon: ShieldCheck, cls: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700/60" },
    premium: { label: t("status.premium"), icon: Crown, cls: "border-[hsl(var(--gold))]/60 bg-gradient-to-r from-[#1A1615] to-[#3a2f18] text-[hsl(var(--gold))]" },
    vip: { label: t("status.vip"), icon: Gem, cls: "border-[hsl(var(--gold))] bg-gradient-to-r from-[#2a2010] to-[#4a3a16] text-[hsl(var(--gold))] shadow-[0_0_14px_rgba(212,175,55,0.35)]" },
    gold: { label: "Gold", icon: Crown, cls: "border-[hsl(var(--gold))] bg-gradient-to-r from-[#3a2d10] to-[#6a5016] text-[hsl(var(--gold))] shadow-[0_0_14px_rgba(212,175,55,0.4)]" },
    platinum: { label: "Platinum", icon: Gem, cls: "border-slate-300 bg-gradient-to-r from-[#2a2d33] to-[#4a5460] text-slate-100 shadow-[0_0_14px_rgba(203,213,225,0.35)]" },
  };
  const c = map[level] || map.free;
  const Icon = c.icon;
  return (
    <span data-testid={`badge-plan-${level}`} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${c.cls}`}>
      <Icon className="h-3.5 w-3.5" /> {c.label}
    </span>
  );
}

export function OnlineDot({ online, className = "" }) {
  if (!online) return null;
  return (
    <span data-testid="online-dot" className={`inline-block h-3 w-3 rounded-full border-2 border-background bg-emerald-brand shadow-[0_0_8px_rgba(16,185,129,0.9)] ${className}`} title="En ligne" />
  );
}

export function KycBadge({ verified }) {
  const { t } = useI18n();
  if (verified) {
    return (
      <span data-testid="badge-kyc-verified" className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--gold))] bg-gradient-to-r from-[#2a2010] to-[#4a3a16] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--gold))] shadow-[0_0_12px_rgba(212,175,55,0.3)]">
        <BadgeCheck className="h-3.5 w-3.5" /> {t("status.verified")}
      </span>
    );
  }
  return (
    <span data-testid="badge-kyc-unverified" className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
      <Lock className="h-3.5 w-3.5" /> {t("status.unverified")}
    </span>
  );
}
