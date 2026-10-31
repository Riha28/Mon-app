import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck2, ScanFace, Lock, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function KycDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  // COURT-CIRCUIT ADMIN : Si vous êtes admin, la pop-up ne s'ouvre jamais
  if (user?.role === "admin" || user?.email === "supportdiasporaloveconnect@gmail.com") {
    return null;
  }

  const start = async () => {
    setBusy(true);
    try {
      await refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(t("Error"));
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    { icon: FileCheck2, label: t("kyc.step1") },
    { icon: ScanFace, label: t("kyc.step2") },
    { icon: ShieldCheck, label: t("kyc.step3") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="kyc-dialog">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-2xl font-serif">{t("kyc.title")}</DialogTitle>
          <DialogDescription className="text-center">{t("kyc.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("kyc.privacy")}</span>
        </div>

        <Button className="w-full rounded-full" onClick={start} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("kyc.demoComplete")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
