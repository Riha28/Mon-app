import React, { useState } from "react";
import { api, apiError } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const MomoDialog = ({ item, config, onClose, onDone }) => {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  if (!item || !config) return null;

  const copy = () => { navigator.clipboard?.writeText(config.number.replace(/\s/g, "")); toast.success("Numéro copié"); };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/momo/requests", { ...item.payload, transaction_ref: ref, payer_phone: phone });
      toast.success("Paiement envoyé ! Activation après vérification (souvent en moins de 2 h).");
      onDone();
    } catch (err) { toast.error(apiError(err)); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card" data-testid="momo-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-2xl"><Smartphone className="h-5 w-5 text-[hsl(var(--gold))]" />Payer par Mobile Money</DialogTitle>
          <DialogDescription>{item.label}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3 text-sm">
          <li><span className="font-semibold text-[hsl(var(--gold))]">1.</span> Envoyez exactement <span className="font-bold text-foreground" data-testid="momo-amount">{item.amount.toLocaleString("fr-FR")} FCFA</span> par {config.operator} au :
            <div className="mt-2 flex items-center justify-between rounded-xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-4 py-3">
              <div><p className="font-serif text-xl font-bold" data-testid="momo-number">{config.number}</p>{config.name && <p className="text-xs text-muted-foreground" data-testid="momo-name">Nom : {config.name}</p>}</div>
              <button type="button" onClick={copy} className="rounded-full p-2 hover:bg-secondary" data-testid="momo-copy-btn"><Copy className="h-4 w-4" /></button>
            </div>
          </li>
          <li><span className="font-semibold text-[hsl(var(--gold))]">2.</span> Notez l'<b>ID de transaction</b> reçu par SMS, puis remplissez :</li>
        </ol>
        <form onSubmit={submit} className="space-y-3">
          <Input required minLength={4} maxLength={40} placeholder="ID de transaction (ex : 1234567890)" value={ref} onChange={(e) => setRef(e.target.value)} data-testid="momo-ref-input" />
          <Input required minLength={8} maxLength={20} type="tel" placeholder="Votre numéro Mobile Money" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="momo-phone-input" />
          <Button type="submit" className="w-full rounded-full" disabled={busy} data-testid="momo-submit-btn">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}J'ai payé — envoyer
          </Button>
          <p className="text-center text-xs text-muted-foreground">Votre accès est activé dès que notre équipe a vérifié le paiement.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
