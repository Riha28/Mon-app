import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, apiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function ReportDialog({ open, onOpenChange, targetId, onBlocked }) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const reasons = [
    "Faux profil / arnaque",
    "Contenu inapproprié",
    "Harcèlement",
    "Demande d'argent",
    "Autre",
  ];

  const submit = async (block) => {
    setBusy(true);
    try {
      await api.post("/report", { reported_id: targetId, reason: reason || "Non précisé" });
      if (block) {
        await api.post("/block", { target_id: targetId });
        toast.success(t("common.blocked"));
        onBlocked && onBlocked();
      } else {
        toast.success(t("report.done"));
      }
      onOpenChange(false);
      setReason("");
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="report-dialog">
        <DialogHeader><DialogTitle>{t("report.title")}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("report.reason")}</label>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <button key={r} data-testid={`report-reason-${r}`} onClick={() => setReason(r)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {r}
              </button>
            ))}
          </div>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="…" className="mt-2" data-testid="report-textarea" />
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => submit(false)} disabled={busy} className="rounded-full" data-testid="report-submit-btn">{t("report.submit")}</Button>
          <Button onClick={() => submit(true)} disabled={busy} variant="destructive" className="rounded-full" data-testid="report-block-btn">{t("chat.block")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
