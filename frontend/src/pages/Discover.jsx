import React, { useEffect, useState, useCallback } from "react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileDialog } from "@/components/ProfileDialog";
import { KycDialog } from "@/components/KycDialog";
import { MatchCelebration } from "@/components/MatchCelebration";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { COUNTRIES } from "@/lib/countries";

export default function Discover() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limited, setLimited] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ min_age: "", max_age: "", country: "", city: "", gender: "" });
  const [selected, setSelected] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [kycOpen, setKycOpen] = useState(false);
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/favorites/ids"); setFavIds(new Set(data.ids)); }
      catch { /* */ }
    })();
  }, []);

  const toggleFavorite = async (p) => {
    const isFav = favIds.has(p.user_id);
    setFavIds((prev) => { const n = new Set(prev); isFav ? n.delete(p.user_id) : n.add(p.user_id); return n; });
    try {
      if (isFav) { await api.delete(`/favorites/${p.user_id}`); toast.success(t("fav.removed")); }
      else { const { data } = await api.post(`/favorites/${p.user_id}`); toast.success(data?.mutual ? t("fav.mutualToast") : t("fav.added")); }
    } catch (e) {
      setFavIds((prev) => { const n = new Set(prev); isFav ? n.add(p.user_id) : n.delete(p.user_id); return n; });
      toast.error(apiError(e));
    }
  };

  const openProfile = (p) => {
    setSelected(p);
    api.post(`/profile/${p.user_id}/view`).catch(() => {});
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== "") params[k] = v; });
      const { data } = await api.get("/discover", { params });
      setProfiles(data.profiles);
      setLimited(data.limited);
    } catch (e) { toast.error(apiError(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const doLike = async (p) => {
    try {
      const { data } = await api.post("/like", { target_id: p.user_id });
      setProfiles((prev) => prev.filter((x) => x.user_id !== p.user_id));
      setSelected(null);
      if (data.matched) setMatchInfo({ profile: p, match_id: data.match_id });
      else toast.success(`${t("discover.liked")} · ${p.display_name}`);
    } catch (e) {
      if (e?.response?.status === 402) { toast.error(apiError(e)); navigate("/app/plans"); }
      else toast.error(apiError(e));
    }
  };

  const doPass = async (p) => {
    try { await api.post("/pass", { target_id: p.user_id }); } catch { /* */ }
    setProfiles((prev) => prev.filter((x) => x.user_id !== p.user_id));
    setSelected(null);
  };

  if (!user?.profile_complete && user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center" data-testid="discover-complete-first">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-muted-foreground">{t("discover.completeFirst")}</p>
        <Button className="mt-4 rounded-full" onClick={() => navigate("/app/profile")} data-testid="discover-go-profile-btn">{t("profile.edit")}</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">{t("discover.title")}</h1>
        <Button variant="outline" className="rounded-full" onClick={() => setShowFilters((s) => !s)} data-testid="toggle-filters-btn">
          <SlidersHorizontal className="mr-2 h-4 w-4" /> {t("discover.filters")}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-5" data-testid="filters-panel">
          <input type="number" placeholder={`${t("profile.age")} min`} value={filters.min_age} onChange={(e) => setFilters((f) => ({ ...f, min_age: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="filter-min-age" />
          <input type="number" placeholder={`${t("profile.age")} max`} value={filters.max_age} onChange={(e) => setFilters((f) => ({ ...f, max_age: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="filter-max-age" />
          <input list="dlc-filter-country" value={filters.country} onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))} placeholder={t("profile.country")} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="filter-country" />
          <datalist id="dlc-filter-country">
            {COUNTRIES.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input placeholder={t("profile.city")} value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="filter-city" />
          <select value={filters.gender} onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" data-testid="filter-gender">
            <option value="">{t("profile.gender")}</option>
            <option value="femme">{t("profile.woman")}</option>
            <option value="homme">{t("profile.man")}</option>
          </select>
          <div className="sm:col-span-5 flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setFilters({ min_age: "", max_age: "", country: "", city: "", gender: "" })} data-testid="filter-reset-btn">{t("discover.reset")}</Button>
          </div>
        </div>
      )}

      {limited && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200" data-testid="limited-banner">
          <span>{t("discover.limited")}</span>
          <Button size="sm" className="rounded-full" onClick={() => navigate("/app/plans")} data-testid="limited-subscribe-btn">{t("nav.plans")}</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="discover-empty">{t("discover.empty")}</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="discover-grid">
          {profiles.map((p) => (
            <ProfileCard key={p.user_id} profile={p} onLike={doLike} onPass={doPass} onOpen={openProfile}
              favorited={favIds.has(p.user_id)} onFavorite={toggleFavorite} />
          ))}
        </div>
      )}

      <ProfileDialog profile={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} onLike={doLike} onPass={doPass}
        favorited={selected ? favIds.has(selected.user_id) : false} onFavorite={toggleFavorite} />

      {/* Match celebration */}
      <MatchCelebration
        open={!!matchInfo}
        onOpenChange={(o) => !o && setMatchInfo(null)}
        me={user}
        them={matchInfo?.profile}
        onMessage={() => {
          const mid = matchInfo.match_id; setMatchInfo(null);
          if (user?.kyc_status === "verified") navigate(`/app/chat/${mid}`); else setKycOpen(true);
        }}
      />

      <KycDialog open={kycOpen} onOpenChange={setKycOpen} />
    </div>
  );
}
