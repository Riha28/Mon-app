javascript
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl, isVideo } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    display_name: user?.display_name || "",
    age: user?.age || "",
    gender: user?.gender || "",
    seeking: user?.seeking || "",
    country: user?.country || "",
    city: user?.city || "",
    bio: user?.bio || ""
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSeeCredits = user?.role === "admin" || user?.has_purchased || ["standard", "premium", "vip", "gold", "platinum"].includes(user?.access_level);
  const [prefs, setPrefs] = useState(user?.email_prefs || { weekly_recap: true, favorite: true });

  const savePref = async (key, value) => {
    const prev = prefs;
    setPrefs((p) => ({ ...p, [key]: value }));
    try {
      await api.put("/profile/email-prefs", { [key]: value });
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) {
      setPrefs(prev);
      toast.error(apiError(err));
    }
  };

  const cancelSub = async () => {
    if (!window.confirm(t("account.cancelConfirm"))) return;
    try {
      await api.post("/payments/cancel");
      await refresh();
      toast.success(t("account.cancelled"));
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age, 10) : null };
      await api.put("/profile", payload);
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
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
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (path) => {
    try {
      await api.delete("/profile/photo", { data: { path } });
      await refresh();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const setPrimaryPhoto = async (path) => {
    try {
      await api.put("/profile/photo/primary", { path });
      await refresh();
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const [items, setItems] = useState([]);
  const constDragIndex = useRef(null);

  useEffect(() => {
    setItems((user?.photos || []).filter((p) => p.path));
  }, [user?.photos]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("kyc") === "done") {
      (async () => {
        try {
          await refresh();
        } catch (e) {}
      })();
    }
  }, []);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      toast.success(t("account.deleted"));
      await logout();
      navigate("/");
    } catch (err) {
      toast.error(apiError(err));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">{t("profile.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <PlanBadge level={user?.access_level} daysLeft={user?.trial_days_left} />
          <KycBadge verified={user?.kyc_status === "verified"} />
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mediaUrl(user?.photo_url)} />
                <AvatarFallback>{user?.display_name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input type="file" ref={fileRef} onChange={upload} accept="image/*" className="hidden" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-medium">{user?.display_name || t("profile.noName")}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-medium">{t("profile.info")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">{t("profile.name")}</Label>
              <Input id="display_name" value={form.display_name} onChange={set("display_name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">{t("profile.age")}</Label>
              <Input id="age" type="number" value={form.age} onChange={set("age")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{t("profile.gender")}</Label>
              <select id="gender" value={form.gender} onChange={set("gender")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">--</option>
                <option value="male">{t("gender.male")}</option>
                <option value="female">{t("gender.female")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seeking">{t("profile.seeking")}</Label>
              <select id="seeking" value={form.seeking} onChange={set("seeking")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">--</option>
                <option value="female">{t("gender.female")}</option>
                <option value="male">{t("gender.male")}</option>
                <option value="both">{t("gender.both")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("profile.country")}</Label>
              <select id="country" value={form.country} onChange={set("country")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">--</option>
                {COUNTRY_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("profile.city")}</Label>
              <Input id="city" value={form.city} onChange={set("city")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t("profile.bio")}</Label>
            <Textarea id="bio" value={form.bio} onChange={set("bio")} rows={4} />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("profile.saveButton")}
          </Button>
        </div>
      </form>

      {/* Galerie Photo */}
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-medium">{t("profile.gallery")}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((p) => (
            <div key={p.path} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
              <img src={mediaUrl(p.path)} alt="" className="h-full w-full object-cover" />
