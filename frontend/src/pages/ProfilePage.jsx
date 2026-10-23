import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl, isVideo } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { KycDialog } from "@/components/KycDialog";
import { PlanBadge, KycBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, ShieldCheck, CreditCard, CheckCircle2, Trash2, Star, X, Play, GripVertical, Lock, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { COUNTRY_GROUPS } from "@/lib/countries";

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    display_name: user.display_name || "", age: user.age || "", gender: user.gender || "",
    seeking: user.seeking || "", country: user.country || "", city: user.city || "", bio: user.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSeeCredits = user?.role === "admin" || user?.has_purchased || ["standard", "premium", "vip", "gold", "platinum"].includes(user?.access_level);
  const [prefs, setPrefs] = useState(user.email_prefs || { weekly_recap: true, favorite: true });
  const savePref = async (key, value) => {
    const prev = prefs;
    setPrefs((p) => ({ ...p, [key]: value }));
    try { await api.put("/profile/email-prefs", { [key]: value }); await refresh(); toast.success(t("profile.saved")); }
    catch (err) { setPrefs(prev); toast.error(apiError(err)); }
  };

  const cancelSub = async () => {
    if (!window.confirm(t("account.cancelConfirm"))) return;
    try { await api.post("/payments/cancel"); await refresh(); toast.success(t("account.cancelled")); }
    catch (e) { toast.error(apiError(e)); }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age, 10) : null };
      await api.put("/profile", payload);
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post("/profile/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) { toast.error(apiError(err)); }
    finally { setUploading(false); }
  };

  const photo = user.photo_url ? mediaUrl(user.photo_url) : user.picture;

  const deletePhoto = async (path) => {
    try { await api.delete("/profile/photo", { data: { path } }); await refresh(); }
    catch (err) { toast.error(apiError(err)); }
  };
  const setPrimaryPhoto = async (path) => {
    try { await api.put("/profile/photo/primary", { path }); await refresh(); toast.success(t("profile.saved")); }
    catch (err) { toast.error(apiError(err)); }
  };
  const [items, setItems] = useState([]);
  const dragIndex = useRef(null);
  useEffect(() => { setItems((user.photos || []).filter((p) => p.path)); }, [user.photos]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("kyc") === "done") {
      (async () => {
        try { await api.get("/kyc/status"); await refresh(); toast.info(t("kyc.pending")); }
        catch { /* */ }
        window.history.replaceState(null, "", "/app/profile");
      })();
    }
    // eslint-disable-next-line
  }, []);
  const gallery = items;
  const persistOrder = async (arr) => {
    setItems(arr);
    try { await api.put("/profile/photos/order", { order: arr.map((i) => i.path) }); await refresh(); }
    catch (err) { toast.error(apiError(err)); await refresh(); }
  };
  const onDropItem = (i) => {
    const from = dragIndex.current; dragIndex.current = null;
    if (from == null || from === i) return;
    const arr = [...items]; const [m] = arr.splice(from, 1); arr.splice(i, 0, m); persistOrder(arr);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      toast.success(t("account.deleted"));
      await logout();
      navigate("/");
    } catch (err) { toast.error(apiError(err)); setDeleting(false); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">{t("profile.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <PlanBadge level={user.access_level} daysLeft={user.trial_days_left} />
          <KycBadge verified={user.kyc_status === "verified"} />
        </div>
      </div>

      {/* Photo gallery */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5" data-testid="photo-gallery">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">{t("profile.photo")}</h2>
          <span className="text-xs text-muted-foreground">{gallery.length}/10</span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((p, i) => {
            const isPrimary = user.photo_url === p.url;
            const isVid = isVideo(p.url);
            return (
              <div key={p.path}
                draggable
                onDragStart={() => { dragIndex.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropItem(i)}
                className="group relative aspect-square cursor-move overflow-hidden rounded-xl border border-border bg-secondary" data-testid={`gallery-item`}>
                {isVid
                  ? <video src={mediaUrl(p.url)} className="pointer-events-none h-full w-full object-cover" muted playsInline preload="metadata" />
                  : <img src={mediaUrl(p.url)} alt="" className="pointer-events-none h-full w-full object-cover" />}
                <span className="pointer-events-none absolute right-1 top-1 rounded bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"><GripVertical className="h-3.5 w-3.5" /></span>
                {isVid && <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 p-1 text-white"><Play className="h-3 w-3" /></span>}
                {isPrimary && <span className="pointer-events-none absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{t("profile.complete") === "Profil complet" ? "Principale" : "Main"}</span>}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {!isPrimary && !isVid && (
                    <button onClick={() => setPrimaryPhoto(p.path)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary" title="Définir principale" data-testid="gallery-set-primary"><Star className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => deletePhoto(p.path)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive" title="Supprimer" data-testid="gallery-delete"><X className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
          {gallery.length < 10 && (
            <button onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary" data-testid="upload-photo-btn">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Camera className="h-6 w-6" /><span className="text-xs">{t("profile.uploadPhoto")}</span></>}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={upload} data-testid="photo-file-input" />
        </div>
        {!user.profile_complete && <p className="mt-3 text-xs text-amber-600">{t("profile.incomplete")}</p>}
      </div>

      {/* Status cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <button onClick={() => setKycOpen(true)} className="flex flex-col items-start rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/40" data-testid="profile-kyc-card">
          <ShieldCheck className="mb-2 h-6 w-6 text-primary" />
          <p className="font-medium">{t("kyc.title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{user.kyc_status === "verified" ? t("kyc.verified") : user.kyc_status === "pending" ? t("kyc.pending") : t("chat.verifyNow")}</p>
        </button>

        <button onClick={() => navigate("/app/plans")} className="flex flex-col items-start rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/40" data-testid="profile-plan-card">
          <CreditCard className="mb-2 h-6 w-6 text-primary" />
          <p className="font-medium">{t("nav.plans")}</p>
          {canSeeCredits ? (
            <p className="mt-1 text-xs text-muted-foreground"><span className="font-semibold text-[hsl(var(--gold))]">{user.credits ?? 0}</span> {t("credits.creditsLabel")}</p>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3 text-[hsl(var(--gold))]" /> {t("credits.unlockHint")}</p>
          )}
        </button>
      </div>

      {["standard", "premium", "vip"].includes(user.subscription_plan) && user.subscription_status === "active" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5 p-4" data-testid="sub-active-banner">
          <p className="text-sm">Abonnement <span className="font-semibold capitalize text-[hsl(var(--gold))]">{user.subscription_plan}</span> actif · conversations illimitées</p>
          <Button size="sm" variant="outline" className="rounded-full" onClick={cancelSub} data-testid="cancel-sub-btn">{t("account.cancelSub")}</Button>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6" data-testid="profile-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>{t("profile.name")}</Label><Input value={form.display_name} onChange={set("display_name")} data-testid="profile-name-input" /></div>
          <div className="space-y-1.5"><Label>{t("profile.age")}</Label><Input type="number" min="18" max="99" value={form.age} onChange={set("age")} data-testid="profile-age-input" /></div>
          <div className="space-y-1.5">
            <Label>{t("profile.gender")}</Label>
            <select value={form.gender} onChange={set("gender")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="profile-gender-select">
              <option value="">—</option><option value="femme">{t("profile.woman")}</option><option value="homme">{t("profile.man")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.seeking")}</Label>
            <select value={form.seeking} onChange={set("seeking")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="profile-seeking-select">
              <option value="">—</option><option value="femme">{t("profile.woman")}</option><option value="homme">{t("profile.man")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.country")}</Label>
            <select value={form.country} onChange={set("country")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="profile-country-select">
              <option value="">—</option>
              {COUNTRY_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="space-y-1.5"><Label>{t("profile.city")}</Label><Input value={form.city} onChange={set("city")} data-testid="profile-city-input" /></div>
        </div>
        <div className="space-y-1.5"><Label>{t("profile.bio")}</Label><Textarea value={form.bio} onChange={set("bio")} rows={4} data-testid="profile-bio-input" /></div>
        <Button type="submit" className="rounded-full" disabled={saving} data-testid="profile-save-btn">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("profile.save")}
        </Button>
      </form>

      <KycDialog open={kycOpen} onOpenChange={setKycOpen} />

      {/* Email preferences */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6" data-testid="email-prefs">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><Mail className="h-5 w-5 text-[hsl(var(--gold))]" />{t("prefs.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("prefs.subtitle")}</p>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div><p className="text-sm font-medium">{t("prefs.weekly")}</p><p className="text-xs text-muted-foreground">{t("prefs.weeklyDesc")}</p></div>
          <Switch checked={prefs.weekly_recap !== false} onCheckedChange={(v) => savePref("weekly_recap", v)} data-testid="pref-weekly-switch" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div><p className="text-sm font-medium">{t("prefs.favorite")}</p><p className="text-xs text-muted-foreground">{t("prefs.favoriteDesc")}</p></div>
          <Switch checked={prefs.favorite !== false} onCheckedChange={(v) => savePref("favorite", v)} data-testid="pref-favorite-switch" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div><p className="text-sm font-medium">{t("prefs.activity")}</p><p className="text-xs text-muted-foreground">{t("prefs.activityDesc")}</p></div>
          <Switch checked={prefs.activity !== false} onCheckedChange={(v) => savePref("activity", v)} data-testid="pref-activity-switch" />
        </div>
      </div>

      {/* Danger zone — RGPD right to erasure */}
      <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6" data-testid="account-danger-zone">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-destructive"><Trash2 className="h-5 w-5" />{t("account.dangerZone")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("account.deleteDesc")}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 rounded-full" data-testid="delete-account-btn">
              <Trash2 className="mr-2 h-4 w-4" />{t("account.delete")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="delete-account-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("account.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("account.deleteDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="delete-account-cancel">{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="delete-account-confirm">
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("account.deleteConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
