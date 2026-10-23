import React, { useEffect, useState, useCallback } from "react";
import { api, apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const STATUS = { pending: ["En attente", "text-[#D4AF37]"], approved: ["Validé", "text-emerald-brand"], rejected: ["Refusé", "text-destructive"] };

export const AdminMomo = ({ onChange }) => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/admin/momo"); setData(data); setForm(data.settings); onChange?.(data.pending); }
    catch (e) { toast.error(apiError(e)); }
  }, [onChange]);
  useEffect(() => { load(); }, [load]);

  const decide = async (id, d) => {
    if (d === "reject" && !window.confirm("Refuser ce paiement ?")) return;
    try { await api.post(`/admin/momo/${id}/${d}`); toast.success(d === "approve" ? "Paiement validé, accès activé" : "Paiement refusé"); load(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const save = async (e) => {
    e.preventDefault();
    try { await api.post("/admin/momo/settings", form); toast.success("Réglages enregistrés"); load(); }
    catch (err) { toast.error(apiError(err)); }
  };
  if (!data || !form) return null;

  return (
    <div className="space-y-6" data-testid="admin-momo">
      <div className="space-y-3">
        {data.requests.length === 0 && <p className="text-sm text-muted-foreground">Aucun paiement Mobile Money pour l'instant.</p>}
        {data.requests.map((r) => (
          <div key={r.request_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4" data-testid={`momo-req-${r.request_id}`}>
            <div className="text-sm">
              <p className="font-semibold">{r.display_name} <span className="text-xs text-muted-foreground">({r.email})</span></p>
              <p>{r.label} — <b>{r.amount.toLocaleString("fr-FR")} FCFA</b></p>
              <p className="text-xs text-muted-foreground">ID transaction : <b className="text-foreground">{r.transaction_ref}</b> · Tél : {r.payer_phone} · {new Date(r.created_at).toLocaleString("fr-FR")}</p>
              <p className={`text-xs font-semibold ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</p>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full" onClick={() => decide(r.request_id, "approve")} data-testid={`momo-approve-${r.request_id}`}><Check className="mr-1 h-4 w-4" />Valider</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => decide(r.request_id, "reject")} data-testid={`momo-reject-${r.request_id}`}><X className="mr-1 h-4 w-4" />Refuser</Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={save} className="grid gap-3 rounded-2xl border border-[hsl(var(--gold))]/30 bg-card p-4 sm:grid-cols-2" data-testid="momo-settings-form">
        <p className="font-serif text-lg font-semibold sm:col-span-2">Numéro affiché aux clients</p>
        <Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} placeholder="Opérateur" data-testid="momo-set-operator" />
        <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="Numéro" data-testid="momo-set-number" />
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom affiché" data-testid="momo-set-name" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} data-testid="momo-set-enabled" />Paiement manuel activé</label>
        <Button type="submit" className="rounded-full sm:col-span-2" data-testid="momo-settings-save">Enregistrer</Button>
      </form>
    </div>
  );
};
