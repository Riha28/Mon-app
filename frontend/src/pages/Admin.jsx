import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, UserCheck, Flag, Users, TrendingUp, Gem, Crown, ShieldCheck, Image as ImageIcon, Activity, Video, Heart, MessageCircle, UserPlus, LifeBuoy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminMomo } from "@/components/AdminMomo";
import { AdminSignupBell } from "@/components/AdminSignupBell";

const FUNNEL_LABELS = { signup: "Inscriptions", profile: "Profils complets", like: "Ont liké", match: "Matchs", kyc: "KYC vérifiés", message: "Ont écrit", subscription: "Abonnés" };
const PLAN_FR = { trial: "Gratuit", free: "Gratuit", standard: "Standard", premium: "Premium", vip: "VIP", gold: "Gold", platinum: "Platinum" };
const KYC_FR = { verified: "Vérifié", pending: "En attente", none: "Non vérifié", requires_input: "Incomplet", rejected: "Refusé", canceled: "Annulé" };
const PLAN_META = { standard: { icon: ShieldCheck, label: "Standard" }, premium: { icon: Crown, label: "Premium" }, vip: { icon: Gem, label: "VIP" }, gold: { icon: Crown, label: "Gold" }, platinum: { icon: Gem, label: "Platinum" } };

export default function Admin() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState(null);
  const [media, setMedia] = useState([]);
  const [act, setAct] = useState(null);
  const [demo, setDemo] = useState(null);
  const [ads, setAds] = useState(null);
  const [adForm, setAdForm] = useState({ label: "", amount: "", currency: "EUR" });
  const [support, setSupport] = useState(null);
  const [supReply, setSupReply] = useState({});
  const [vip, setVip] = useState(null);
  const [newRoom, setNewRoom] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState("activity");
  const [momoPending, setMomoPending] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, k, r, u, sub, m, a, d, ad, sup, vc] = await Promise.all([
        api.get("/admin/stats"), api.get("/admin/kyc"), api.get("/admin/reports"),
        api.get("/admin/users"), api.get("/admin/subscribers"), api.get("/admin/media"), api.get("/admin/activity"),
        api.get("/admin/demo/status"), api.get("/admin/ad-expenses"), api.get("/admin/support"), api.get("/admin/vip-club"),
      ]);
      setStats(s.data.funnel); setKyc(k.data.queue); setReports(r.data.reports);
      setUsers(u.data.users); setSubs(sub.data); setMedia(m.data.media); setAct(a.data); setDemo(d.data); setAds(ad.data); setSupport(sup.data); setVip(vc.data);
      setNotifyEmail(sup.data?.notify_email || "");
    } catch (e) { toast.error(apiError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const kycDecision = async (user_id, decision) => {
    try { await api.post("/admin/kyc/decision", { user_id, decision }); toast.success("OK"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const reportAction = async (report_id, target_id, action) => {
    try { await api.post("/admin/reports/action", { report_id, target_id, action }); toast.success("OK"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const userAction = async (user_id, action) => {
    try { await api.post("/admin/users/action", { user_id, action }); toast.success("OK"); loadAll(); if (detail?.user_id === user_id) openDetail(user_id); }
    catch (e) { toast.error(apiError(e)); }
  };
  const mediaRemove = async (storage_path, owner_id) => {
    try { await api.post("/admin/media/remove", { storage_path, owner_id }); toast.success("OK"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const openDetail = async (user_id) => {
    try { const { data } = await api.get(`/admin/user/${user_id}`); setDetail(data); }
    catch (e) { toast.error(apiError(e)); }
  };
  const clearDemo = async () => {
    if (!window.confirm(t("admin.demoClearConfirm"))) return;
    try { const { data } = await api.post("/admin/demo/clear"); toast.success(`${data.deleted} profils démo supprimés`); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const [testCount, setTestCount] = useState(0);
  useEffect(() => { api.get("/admin/users/test-count").then(({ data }) => setTestCount(data.count)).catch(() => {}); }, [users]);
  const purgeTest = async () => {
    if (!window.confirm(`Supprimer définitivement ${testCount} comptes de test ?`)) return;
    try { const { data } = await api.post("/admin/users/purge-test"); toast.success(`${data.deleted} comptes de test supprimés`); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const deleteUser = async (u) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${u.display_name || u.email} ? Cette action est irréversible.`)) return;
    try { await api.post(`/admin/users/${u.user_id}/delete`); toast.success("Compte supprimé"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const restoreDemo = async () => {
    try { await api.post("/admin/demo/restore"); toast.success("Profils démo restaurés"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const addAd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/ad-expenses", { label: adForm.label, amount: parseFloat(adForm.amount), currency: adForm.currency });
      setAdForm({ label: "", amount: "", currency: "EUR" });
      loadAll();
    } catch (err) { toast.error(apiError(err)); }
  };
  const delAd = async (id) => {
    try { await api.delete(`/admin/ad-expenses/${id}`); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const toggleSupportAI = async () => {
    try { await api.post("/admin/support/ai-toggle", { enabled: !support?.ai_enabled }); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const sendSupReply = async (uid) => {
    const content = (supReply[uid] || "").trim();
    if (!content) return;
    try { await api.post("/admin/support/reply", { user_id: uid, content }); setSupReply((s) => ({ ...s, [uid]: "" })); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const markSupportRead = async () => {
    if (!support?.unread) return;
    try { await api.post("/admin/support/mark-read"); setSupport((s) => ({ ...s, unread: 0, threads: (s?.threads || []).map((t) => ({ ...t, unread: 0 })) })); }
    catch { /* ignore */ }
  };
  const markSubscribersRead = async () => {
    if (!subs?.new_count) return;
    try { await api.post("/admin/subscribers/mark-read"); setSubs((s) => ({ ...s, new_count: 0 })); }
    catch { /* ignore */ }
  };
  const vipDelete = async (message_id) => {
    if (!window.confirm("Supprimer ce message du Club VIP ?")) return;
    try { await api.delete(`/admin/vip-club/${message_id}`); toast.success("Message supprimé"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const addRoom = async (e) => {
    e.preventDefault();
    const name = newRoom.trim();
    if (!name) return;
    try { await api.post("/admin/vip-club/rooms", { name }); setNewRoom(""); toast.success("Salon ajouté"); loadAll(); }
    catch (err) { toast.error(apiError(err)); }
  };
  const delRoom = async (room_id) => {
    if (!window.confirm("Supprimer ce salon ? Ses messages seront masqués.")) return;
    try { await api.delete(`/admin/vip-club/rooms/${room_id}`); toast.success("Salon supprimé"); loadAll(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const saveNotifyEmail = async () => {
    try { await api.post("/admin/support/notify-email", { email: notifyEmail.trim() }); toast.success("E-mail de notification enregistré"); }
    catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/app")} className="rounded-full p-1.5 hover:bg-secondary" data-testid="admin-back-btn"><ArrowLeft className="h-5 w-5" /></button>
            <Logo size={34} withText variant="dark" />
          </div>
          <div className="flex items-center gap-2">
            <AdminSignupBell onOpenUser={openDetail} />
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t("admin.title")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
          <>
          {support?.unread > 0 && (
            <button onClick={() => { setTab("support"); markSupportRead(); }} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-left transition-colors hover:bg-destructive/15" data-testid="admin-support-banner">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white animate-pulse"><LifeBuoy className="h-5 w-5" /></span>
              <span className="text-sm"><span className="font-semibold text-destructive">{support.unread} nouveau(x) message(s) de support</span><span className="block text-xs text-muted-foreground">Cliquez pour répondre aux membres</span></span>
            </button>
          )}
          {subs?.new_count > 0 && (
            <button onClick={() => { setTab("subscribers"); markSubscribersRead(); }} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-emerald-brand/40 bg-emerald-brand/10 px-4 py-3 text-left transition-colors hover:bg-emerald-brand/15" data-testid="admin-subs-banner">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-brand text-white animate-pulse"><Gem className="h-5 w-5" /></span>
              <span className="text-sm"><span className="font-semibold text-emerald-brand">{subs.new_count} nouvel(aux) abonné(s)</span><span className="block text-xs text-muted-foreground">Cliquez pour voir vos nouveaux clients</span></span>
            </button>
          )}
          <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v === "support") markSupportRead(); if (v === "subscribers") markSubscribersRead(); }}>
            <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1">
              <TabsTrigger value="activity" data-testid="admin-tab-activity"><Activity className="mr-1.5 h-4 w-4" />{t("admin.activity")}</TabsTrigger>
              <TabsTrigger value="funnel" data-testid="admin-tab-funnel"><TrendingUp className="mr-1.5 h-4 w-4" />{t("admin.funnel")}</TabsTrigger>
              <TabsTrigger value="subscribers" data-testid="admin-tab-subscribers" className="relative"><Gem className="mr-1.5 h-4 w-4" />{t("admin.subscribers")} ({subs?.total ?? 0})
                {subs?.new_count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-brand px-1 text-[10px] font-bold text-white animate-pulse" data-testid="admin-subs-new">{subs.new_count}</span>}
              </TabsTrigger>
              <TabsTrigger value="media" data-testid="admin-tab-media"><ImageIcon className="mr-1.5 h-4 w-4" />{t("admin.media")} ({media.length})</TabsTrigger>
              <TabsTrigger value="kyc" data-testid="admin-tab-kyc"><UserCheck className="mr-1.5 h-4 w-4" />{t("admin.kyc")} ({kyc.length})</TabsTrigger>
              <TabsTrigger value="reports" data-testid="admin-tab-reports"><Flag className="mr-1.5 h-4 w-4" />{t("admin.reports")} ({reports.length})</TabsTrigger>
              <TabsTrigger value="users" data-testid="admin-tab-users"><Users className="mr-1.5 h-4 w-4" />{t("admin.users")} ({users.length})</TabsTrigger>
              <TabsTrigger value="support" data-testid="admin-tab-support" onClick={markSupportRead} className="relative"><LifeBuoy className="mr-1.5 h-4 w-4" />Support ({support?.threads?.length ?? 0})
                {support?.unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white animate-pulse" data-testid="admin-support-unread">{support.unread}</span>}
              </TabsTrigger>
              <TabsTrigger value="momo" data-testid="admin-tab-momo" className="relative">Mobile Money ({momoPending})
                {momoPending > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="vipclub" data-testid="admin-tab-vipclub"><Gem className="mr-1.5 h-4 w-4" />Club VIP ({vip?.messages?.length ?? 0})</TabsTrigger>
            </TabsList>

            {/* ACTIVITY */}
            <TabsContent value="activity">
              <div className="mb-5 grid grid-cols-3 gap-3" data-testid="admin-overview">
                <div className="rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 p-5 text-center">
                  <Users className="mx-auto mb-1 h-5 w-5 text-[hsl(var(--gold))]" />
                  <p className="font-serif text-3xl font-bold text-[hsl(var(--gold))]" data-testid="ov-total">{act?.overview?.total_users ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Inscrits</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 p-5 text-center">
                  <Gem className="mx-auto mb-1 h-5 w-5 text-[hsl(var(--gold))]" />
                  <p className="font-serif text-3xl font-bold text-[hsl(var(--gold))]" data-testid="ov-subs">{act?.overview?.subscribers ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Abonnés</p>
                </div>
                <div className="rounded-2xl border border-emerald-brand/40 bg-emerald-brand/5 p-5 text-center">
                  <span className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full bg-emerald-brand shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <p className="font-serif text-3xl font-bold text-emerald-brand" data-testid="ov-online">{act?.overview?.online ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">En ligne (5 min)</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2" data-testid="admin-activity">
                <ActivityCard title={t("admin.recentSignups")} icon={UserPlus} items={act?.signups} render={(x) => (
                  <><span className="font-medium">{x.display_name}</span><span className="text-xs text-muted-foreground"> · {x.country || "—"}</span></>
                )} />
                <ActivityCard title={t("admin.recentSubs")} icon={Gem} items={act?.subscriptions} render={(x) => (
                  <><span className="font-medium">{x.display_name}</span> <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{x.plan}</span></>
                )} />
                <ActivityCard title={t("admin.recentMatches")} icon={Heart} items={act?.matches} render={(x) => (
                  <span className="text-sm">{(x.names || []).join(" ↔ ")}</span>
                )} />
                <ActivityCard title={t("admin.recentReports")} icon={Flag} items={act?.reports} render={(x) => (
                  <><span className="font-medium">{x.reported || "?"}</span><span className="text-xs text-muted-foreground"> · {x.reason}</span></>
                )} />
              </div>
            </TabsContent>

            {/* FUNNEL */}
            <TabsContent value="funnel">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" data-testid="admin-funnel">
                {stats && Object.entries(FUNNEL_LABELS).map(([k, label]) => (
                  <div key={k} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <p className="font-serif text-3xl font-bold text-primary">{stats[k] ?? 0}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* SUBSCRIBERS */}
            <TabsContent value="subscribers">
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-testid="admin-sub-counts">
                <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 text-center">
                  <p className="font-serif text-3xl font-bold text-primary" data-testid="admin-sub-total">{subs?.total ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("admin.totalSubs")}</p>
                </div>
                {["standard", "premium", "vip", "gold", "platinum"].map((p) => {
                  const Icon = PLAN_META[p].icon;
                  return (
                    <div key={p} className="rounded-2xl border border-border bg-card p-4 text-center">
                      <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <p className="font-serif text-2xl font-bold">{subs?.counts?.[p] ?? 0}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{PLAN_META[p].label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3" data-testid="admin-mrr">
                <div className="rounded-2xl border border-emerald-brand/40 bg-emerald-brand/5 p-4 text-center">
                  <p className="font-serif text-2xl font-bold text-emerald-brand" data-testid="admin-mrr-eur">{(subs?.mrr_eur ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("admin.mrrEur")}</p>
                </div>
                <div className="rounded-2xl border border-emerald-brand/40 bg-emerald-brand/5 p-4 text-center">
                  <p className="font-serif text-2xl font-bold text-emerald-brand" data-testid="admin-mrr-fcfa">{(subs?.mrr_fcfa ?? 0).toLocaleString("fr-FR")} FCFA</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("admin.mrrFcfa")}</p>
                </div>
              </div>

              {/* Finances : dépenses pub + résultat net */}
              <div className="mb-6 grid gap-3 lg:grid-cols-2" data-testid="admin-finances">
                {[
                  { cur: "EUR", sym: "€", rev: subs?.mrr_eur ?? 0, spend: ads?.total_eur ?? 0 },
                  { cur: "FCFA", sym: "FCFA", rev: subs?.mrr_fcfa ?? 0, spend: ads?.total_fcfa ?? 0 },
                ].map((f) => {
                  const net = f.rev - f.spend;
                  const fmt = (n) => n.toLocaleString("fr-FR", f.cur === "EUR" ? { minimumFractionDigits: 2 } : {});
                  return (
                    <div key={f.cur} className="rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.cur === "EUR" ? "Europe (€)" : "Afrique (FCFA)"}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-emerald-brand font-serif text-lg font-bold" data-testid={`fin-rev-${f.cur}`}>{fmt(f.rev)} {f.sym}</p><p className="text-[11px] text-muted-foreground">Revenu</p></div>
                        <div><p className="font-serif text-lg font-bold text-[#D4AF37]" data-testid={`fin-spend-${f.cur}`}>−{fmt(f.spend)} {f.sym}</p><p className="text-[11px] text-muted-foreground">Dépenses pub</p></div>
                        <div><p className={`font-serif text-lg font-bold ${net >= 0 ? "text-[hsl(var(--gold))]" : "text-destructive"}`} data-testid={`fin-net-${f.cur}`}>{fmt(net)} {f.sym}</p><p className="text-[11px] text-muted-foreground">Net</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gestion des dépenses publicitaires */}
              <div className="mb-6 rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4" data-testid="admin-ads">
                <h3 className="mb-3 font-medium">Dépenses publicitaires</h3>
                <form onSubmit={addAd} className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input value={adForm.label} onChange={(e) => setAdForm((f) => ({ ...f, label: e.target.value }))} placeholder="Libellé (ex. Facebook Ads)" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="ad-label-input" />
                  <input type="number" step="0.01" value={adForm.amount} onChange={(e) => setAdForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Montant / mois" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm sm:w-36" data-testid="ad-amount-input" />
                  <select value={adForm.currency} onChange={(e) => setAdForm((f) => ({ ...f, currency: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="ad-currency-select">
                    <option value="EUR">€ (EUR)</option>
                    <option value="FCFA">FCFA</option>
                  </select>
                  <Button type="submit" size="sm" className="rounded-full" data-testid="ad-add-btn">Ajouter</Button>
                </form>
                {(!ads?.expenses || ads.expenses.length === 0) ? <p className="text-sm text-muted-foreground">Aucune dépense enregistrée.</p> : (
                  <ul className="space-y-2">
                    {ads.expenses.map((e) => (
                      <li key={e.expense_id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid={`ad-item-${e.expense_id}`}>
                        <span>{e.label}</span>
                        <span className="flex items-center gap-3">
                          <span className="font-medium">{e.amount.toLocaleString("fr-FR")} {e.currency === "EUR" ? "€" : "FCFA"}</span>
                          <button onClick={() => delAd(e.expense_id)} className="text-destructive hover:underline" data-testid={`ad-del-${e.expense_id}`}>Suppr.</button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {(!subs?.subscribers || subs.subscribers.length === 0) ? <p className="py-10 text-center text-muted-foreground">{t("admin.noItems")}</p> : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                  <Table>
                    <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Pays</TableHead><TableHead>Plan</TableHead><TableHead>Paiement</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {subs.subscribers.map((s) => (
                        <TableRow key={s.user_id} data-testid={`admin-sub-${s.user_id}`} className="cursor-pointer" onClick={() => openDetail(s.user_id)}>
                          <TableCell className="font-medium">{s.display_name}<div className="text-xs text-muted-foreground">{s.email}</div></TableCell>
                          <TableCell>{s.country || "—"}</TableCell>
                          <TableCell><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{s.plan}</span></TableCell>
                          <TableCell className="capitalize">{s.provider}</TableCell>
                          <TableCell className="capitalize">{s.status || "active"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* MEDIA */}
            <TabsContent value="media">
              {media.length === 0 ? <p className="py-10 text-center text-muted-foreground">{t("admin.noItems")}</p> : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="admin-media-grid">
                  {media.map((m) => (
                    <div key={m.storage_path} className="overflow-hidden rounded-2xl border border-border bg-card" data-testid={`admin-media-${m.owner_id}`}>
                      <div className="relative aspect-square bg-secondary">
                        {m.kind === "video"
                          ? <video src={mediaUrl(m.url)} className="h-full w-full object-cover" muted playsInline />
                          : <img src={mediaUrl(m.url)} alt="" className="h-full w-full object-cover" />}
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                          {m.kind === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          {m.kind === "video" ? t("admin.video") : t("admin.image")}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium">{m.owner_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.owner_email}</p>
                        <Button size="sm" variant="destructive" className="mt-2 w-full rounded-full" onClick={() => mediaRemove(m.storage_path, m.owner_id)} data-testid={`admin-media-remove-${m.owner_id}`}>{t("admin.remove")}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* KYC */}
            <TabsContent value="kyc">
              {kyc.length === 0 ? <p className="py-10 text-center text-muted-foreground">{t("admin.noItems")}</p> : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {kyc.map((item) => (
                    <div key={item.user.user_id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4" data-testid={`admin-kyc-${item.user.user_id}`}>
                      {item.user.photo_url && <img src={mediaUrl(item.user.photo_url)} alt="" className="h-14 w-14 rounded-xl object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.user.display_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.user.email}</p>
                        <p className="text-xs text-muted-foreground">{item.user.city}, {item.user.country}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" className="rounded-full" onClick={() => kycDecision(item.user.user_id, "verified")} data-testid={`admin-kyc-approve-${item.user.user_id}`}>{t("admin.approve")}</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => kycDecision(item.user.user_id, "requires_input")} data-testid={`admin-kyc-reject-${item.user.user_id}`}>{t("admin.reject")}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* REPORTS */}
            <TabsContent value="reports">
              {reports.length === 0 ? <p className="py-10 text-center text-muted-foreground">{t("admin.noItems")}</p> : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r.report.report_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4" data-testid={`admin-report-${r.report.report_id}`}>
                      <div>
                        <p className="font-medium">{r.reported.display_name} <span className="text-xs text-muted-foreground">signalé par {r.reporter}</span></p>
                        <p className="text-sm text-muted-foreground">{r.report.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => reportAction(r.report.report_id, r.reported.user_id, "dismiss")} data-testid={`admin-report-dismiss-${r.report.report_id}`}>{t("admin.dismiss")}</Button>
                        <Button size="sm" variant="destructive" className="rounded-full" onClick={() => reportAction(r.report.report_id, r.reported.user_id, "ban")} data-testid={`admin-report-ban-${r.report.report_id}`}>{t("admin.ban")}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* USERS */}
            <TabsContent value="users">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4" data-testid="admin-demo-bar">
                <div className="text-sm">
                  <span className="font-medium">{t("admin.demoProfiles")}</span>
                  <span className="ml-2 text-muted-foreground">{demo?.count ?? 0} {t("admin.demoActive")}</span>
                </div>
                {demo?.disabled
                  ? <Button size="sm" variant="outline" className="rounded-full" onClick={restoreDemo} data-testid="admin-demo-restore">{t("admin.demoRestore")}</Button>
                  : <Button size="sm" variant="destructive" className="rounded-full" onClick={clearDemo} data-testid="admin-demo-clear">{t("admin.demoClear")}</Button>}
              </div>
              {testCount > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-card p-4" data-testid="admin-test-bar">
                  <span className="text-sm"><span className="font-medium">Comptes de test</span><span className="ml-2 text-muted-foreground">{testCount} comptes créés pendant la construction du site</span></span>
                  <Button size="sm" variant="destructive" className="rounded-full" onClick={purgeTest} data-testid="admin-test-purge">Supprimer les comptes de test</Button>
                </div>
              )}
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <Table>
                  <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Pays</TableHead><TableHead>KYC</TableHead><TableHead>Plan</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.user_id} data-testid={`admin-user-${u.user_id}`}>
                        <TableCell className="font-medium">
                          <button className="flex items-center gap-3 text-left" onClick={() => openDetail(u.user_id)} data-testid={`admin-user-detail-${u.user_id}`}>
                            {u.photo_url
                              ? <img src={mediaUrl(u.photo_url)} alt="" className="h-11 w-11 shrink-0 rounded-full border border-[hsl(var(--gold))]/40 object-cover" />
                              : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{(u.display_name || "?")[0]}</span>}
                            <span className="min-w-0">
                              <span className="block hover:underline">{u.display_name}</span>
                              <span className="block text-xs text-muted-foreground">{u.email}</span>
                              <span className="block text-xs font-medium text-[hsl(var(--gold))]">Voir le profil →</span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>{u.country || "—"}</TableCell>
                        <TableCell><span className={u.kyc_status === "verified" ? "text-blue-600" : "text-muted-foreground"}>{KYC_FR[u.kyc_status] || u.kyc_status}</span></TableCell>
                        <TableCell>{PLAN_FR[u.subscription_plan] || u.subscription_plan}</TableCell>
                        <TableCell>
                          {u.is_banned ? <span className="text-destructive">Banni</span> : u.is_suspended ? <span className="text-[#D4AF37]">Suspendu</span> : "Actif"}
                          {!u.email_verified && <div className="text-xs text-[#D4AF37]">e-mail non vérifié</div>}
                        </TableCell>
                        <TableCell>
                          {u.role !== "admin" && (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {u.kyc_status === "verified"
                                ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(u.user_id, "unverify_kyc")} data-testid={`admin-unverify-${u.user_id}`}>{t("admin.unverifyKyc")}</Button>
                                : <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(u.user_id, "verify_kyc")} data-testid={`admin-verify-${u.user_id}`}>{t("admin.verifyKyc")}</Button>}
                              {u.is_suspended
                                ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(u.user_id, "unsuspend")} data-testid={`admin-unsuspend-${u.user_id}`}>{t("admin.unsuspend")}</Button>
                                : <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(u.user_id, "suspend")} data-testid={`admin-suspend-${u.user_id}`}>{t("admin.suspend")}</Button>}
                              {u.is_banned
                                ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(u.user_id, "unban")} data-testid={`admin-unban-${u.user_id}`}>{t("admin.unban")}</Button>
                                : <Button size="sm" variant="destructive" className="rounded-full" onClick={() => userAction(u.user_id, "ban")} data-testid={`admin-ban-${u.user_id}`}>{t("admin.ban")}</Button>}
                              <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => deleteUser(u)} data-testid={`admin-delete-${u.user_id}`}>Supprimer</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            {/* SUPPORT */}
            <TabsContent value="support">
              <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4">
                <div className="text-sm"><span className="font-medium">Assistant IA</span> <span className="ml-2 text-muted-foreground">{support?.ai_enabled ? "réponses automatiques activées" : "désactivé"}</span></div>
                <Button size="sm" variant={support?.ai_enabled ? "destructive" : "default"} className="rounded-full" onClick={toggleSupportAI} data-testid="admin-support-ai-toggle">
                  {support?.ai_enabled ? "Désactiver l'IA" : "Activer l'IA"}
                </Button>
              </div>
              <div className="mb-4 rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4" data-testid="admin-support-notify">
                <h3 className="mb-1 flex items-center gap-2 font-medium"><LifeBuoy className="h-4 w-4 text-[hsl(var(--gold))]" />Alerte e-mail support</h3>
                <p className="mb-3 text-xs text-muted-foreground">Recevez un e-mail à chaque nouveau message de support. Laissez vide pour utiliser l'e-mail admin par défaut.</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="ex. support@diasporaloveconnect.com" className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm" data-testid="admin-notify-email-input" />
                  <Button size="sm" className="rounded-full" onClick={saveNotifyEmail} data-testid="admin-notify-email-save">Enregistrer</Button>
                </div>
              </div>
              {(!support?.threads || support.threads.length === 0) ? <p className="py-10 text-center text-muted-foreground">Aucune discussion.</p> : (
                <div className="space-y-4">
                  {support.threads.map((th) => (
                    <div key={th.user_id} className="rounded-2xl border border-border bg-card p-4" data-testid={`admin-support-thread-${th.user_id}`}>
                      <p className="mb-2 font-medium">{th.display_name} <span className="text-xs text-muted-foreground">{th.email}</span></p>
                      <div className="mb-3 max-h-56 space-y-2 overflow-y-auto">
                        {th.messages.map((m) => (
                          <div key={m.message_id} className={`flex ${m.sender === "user" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-sm ${m.sender === "user" ? "bg-secondary" : m.sender === "admin" ? "bg-[hsl(var(--gold))]/15 border border-[hsl(var(--gold))]/40" : "bg-primary/10"}`}>
                              <span className="mr-1 text-[10px] uppercase opacity-60">{m.sender === "user" ? "Membre" : m.sender === "admin" ? "Vous" : "IA"}</span>
                              {m.content}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={supReply[th.user_id] || ""} onChange={(e) => setSupReply((s) => ({ ...s, [th.user_id]: e.target.value }))} placeholder="Répondre en tant qu'équipe…" className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm" data-testid={`admin-support-input-${th.user_id}`} />
                        <Button size="sm" className="rounded-full" onClick={() => sendSupReply(th.user_id)} data-testid={`admin-support-send-${th.user_id}`}>Envoyer</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* VIP CLUB */}
            <TabsContent value="momo" forceMount className="data-[state=inactive]:hidden"><AdminMomo onChange={setMomoPending} /></TabsContent>

            <TabsContent value="vipclub">
              <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Gem className="h-5 w-5 text-[hsl(var(--gold))]" />
                  <span className="font-medium">Membres VIP actifs</span>
                  <span className="rounded-full bg-[hsl(var(--gold))]/15 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--gold))]" data-testid="admin-vip-members">{vip?.members ?? 0}</span>
                </div>
                <span className="text-xs text-muted-foreground">{vip?.messages?.length ?? 0} message(s)</span>
              </div>
              <div className="mb-4 rounded-2xl border border-border bg-card p-4" data-testid="admin-vip-rooms">
                <h3 className="mb-3 flex items-center gap-2 font-medium"><Gem className="h-4 w-4 text-[hsl(var(--gold))]" />Salons VIP</h3>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(vip?.rooms || []).map((r) => (
                    <span key={r.room_id} className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/10 px-3 py-1 text-sm" data-testid={`admin-room-${r.room_id}`}>
                      {r.name}
                      <button onClick={() => delRoom(r.room_id)} className="text-destructive hover:scale-110" title="Supprimer" data-testid={`admin-room-del-${r.room_id}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    </span>
                  ))}
                </div>
                <form onSubmit={addRoom} className="flex gap-2">
                  <input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Nouveau salon (ex. Afrique de l'Ouest)" maxLength={40} className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm" data-testid="admin-room-input" />
                  <Button type="submit" size="sm" className="rounded-full" data-testid="admin-room-add-btn">Ajouter</Button>
                </form>
              </div>
              {(!vip?.messages || vip.messages.length === 0) ? <p className="py-10 text-center text-muted-foreground">Aucun message dans le Club VIP.</p> : (
                <div className="space-y-2" data-testid="admin-vipclub-list">
                  {vip.messages.map((m) => (
                    <div key={m.message_id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-3" data-testid={`admin-vip-msg-${m.message_id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{m.display_name} <span className="text-xs text-muted-foreground">{m.email}</span> <span className="ml-1 rounded-full bg-[hsl(var(--gold))]/10 px-2 py-0.5 text-[10px] text-[hsl(var(--gold))]">{m.room_name}</span></p>
                        <p className="mt-0.5 break-words text-sm text-muted-foreground">{m.text}</p>
                        {m.filtered && <span className="mt-1 inline-block rounded bg-[hsl(var(--gold))]/15 px-1.5 py-0.5 text-[10px] text-[hsl(var(--gold))]">coordonnées masquées</span>}
                      </div>
                      <Button size="icon" variant="ghost" className="shrink-0 text-destructive hover:bg-destructive/10" onClick={() => vipDelete(m.message_id)} data-testid={`admin-vip-del-${m.message_id}`}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          </>
        )}
      </main>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto" data-testid="admin-user-detail-dialog">
          <DialogHeader><DialogTitle>{t("admin.details")}</DialogTitle><DialogDescription className="sr-only">Fiche détaillée du membre</DialogDescription></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(detail.photos || []).map((ph, i) => (
                  <img key={i} src={mediaUrl(ph.url || ph)} alt="" className="h-24 w-24 rounded-xl object-cover" />
                ))}
                {(!detail.photos || detail.photos.length === 0) && <p className="text-sm text-muted-foreground">Aucune photo</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Info label="Nom" value={detail.display_name} />
                <Info label="E-mail" value={detail.email} />
                <Info label="E-mail vérifié" value={detail.email_verified ? "Oui" : "Non"} />
                <Info label="Âge" value={detail.age} />
                <Info label="Pays" value={detail.country} />
                <Info label="Ville" value={detail.city} />
                <Info label="Genre" value={detail.gender} />
                <Info label="Recherche" value={detail.seeking} />
                <Info label="KYC" value={KYC_FR[detail.kyc_status] || detail.kyc_status} />
                <Info label="Plan" value={PLAN_FR[detail.subscription_plan] || detail.subscription_plan} />
                <Info label="Paiement" value={detail.payment_provider || "—"} />
                <Info label="Statut" value={detail.is_banned ? "Banni" : detail.is_suspended ? "Suspendu" : "Actif"} />
              </div>
              {detail.bio && <p className="rounded-lg bg-secondary p-3 text-sm">{detail.bio}</p>}
              <div className="grid grid-cols-4 gap-2 text-center">
                <Stat icon={Heart} label="Likes" value={detail.likes_sent} />
                <Stat icon={Users} label="Matchs" value={detail.matches} />
                <Stat icon={MessageCircle} label="Messages" value={detail.messages_sent} />
                <Stat icon={Flag} label="Signalé" value={detail.reports_against} />
              </div>
              {detail.email !== "admin@diasporaloveconnect.com" && (
                <Button size="sm" variant="outline" className="w-full rounded-full border-[hsl(var(--gold))]/50 text-[hsl(var(--gold))]" onClick={() => { if (window.confirm(detail.role === "admin" ? "Retirer l'accès admin à ce membre ?" : "Donner l'accès admin à ce membre ? Il pourra tout gérer.")) userAction(detail.user_id, detail.role === "admin" ? "remove_admin" : "make_admin"); }} data-testid="admin-toggle-role">
                  {detail.role === "admin" ? "Retirer l'accès admin" : "Donner l'accès admin"}
                </Button>
              )}
              {detail.role !== "admin" && (
                <div className="flex flex-wrap gap-2">
                  {detail.kyc_status === "verified"
                    ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(detail.user_id, "unverify_kyc")}>{t("admin.unverifyKyc")}</Button>
                    : <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(detail.user_id, "verify_kyc")}>{t("admin.verifyKyc")}</Button>}
                  {detail.is_suspended
                    ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(detail.user_id, "unsuspend")}>{t("admin.unsuspend")}</Button>
                    : <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(detail.user_id, "suspend")}>{t("admin.suspend")}</Button>}
                  {detail.is_banned
                    ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => userAction(detail.user_id, "unban")}>{t("admin.unban")}</Button>
                    : <Button size="sm" variant="destructive" className="rounded-full" onClick={() => userAction(detail.user_id, "ban")}>{t("admin.ban")}</Button>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Info = ({ label, value }) => (
  <div><span className="text-xs text-muted-foreground">{label}</span><div className="font-medium capitalize">{value ?? "—"}</div></div>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-card p-2">
    <Icon className="mx-auto h-4 w-4 text-primary" />
    <p className="mt-1 font-serif text-lg font-bold">{value ?? 0}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const ActivityCard = ({ title, icon: Icon, items, render }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <h3 className="mb-3 flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-primary" />{title}</h3>
    {(!items || items.length === 0) ? <p className="text-sm text-muted-foreground">—</p> : (
      <ul className="space-y-2">
        {items.map((x, i) => <li key={i} className="border-b border-border/50 pb-2 text-sm last:border-0 last:pb-0">{render(x)}</li>)}
      </ul>
    )}
  </div>
);
