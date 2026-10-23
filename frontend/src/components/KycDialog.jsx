import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileCheck2, ScanFace, Lock, Loader2 } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function KycDialog({ open, onOpenChange }) {
  const { t } = useI18n();
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [mocked, setMocked] = useState(false);
  const status = user?.kyc_status || "none";

  const start = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/kyc/start");
      if (data.url) { window.location.href = data.url; return; }
      setMocked(!!data.mocked);
      await refresh();
      toast.info(t("kyc.pending"));
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  const demoComplete = async () => {
    setBusy(true);
    try {
      await api.post("/kyc/demo-complete");
      await refresh();
      toast.success(t("kyc.verified"));
      onOpenChange(false);
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
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
          <DialogTitle className="text-center text-2xl">{t("kyc.title")}</DialogTitle>
          <DialogDescription className="text-center">{t("kyc.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary"><s.icon className="h-5 w-5" /></div>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("kyc.privacy")}</span>
        </div>

        {status === "verified" ? (
          <div className="rounded-xl bg-blue-50 p-3 text-center text-sm font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{t("kyc.verified")} ✅</div>
        ) : (
          <div className="space-y-2">
            {status !== "pending" ? (
              <Button className="w-full rounded-full" onClick={start} disabled={busy} data-testid="kyc-start-btn">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("kyc.start")}
              </Button>
            ) : (
              <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{t("kyc.pending")}…</div>
            )}
            {mocked && (
              <>
                <Button variant="outline" className="w-full rounded-full" onClick={demoComplete} disabled={busy} data-testid="kyc-demo-complete-btn">
                  {t("kyc.demoComplete")}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">{t("kyc.mockNotice")}</p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
