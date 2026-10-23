import React, { useEffect, useState, useCallback } from "react";
import { api, apiError, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileDialog } from "@/components/ProfileDialog";
import { Button } from "@/components/ui/button";
import { Star, Eye, Heart, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function LockedTeaser({ icon: Icon, title, desc, preview, cta, onCta }) {
  const avatars = (preview || []).slice(0, 5);
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[hsl(var(--gold))]/40 bg-gradient-to-br from-[hsl(var(--gold))]/10 to-transparent p-8 text-center" data-testid="locked-teaser">
      {avatars.length > 0 ? (
        <div className="mb-5 flex justify-center -space-x-3">
          {avatars.map((a, i) => (
            <div key={i} className="h-14 w-14 overflow-hidden rounded-full border-2 border-[hsl(var(--gold))]/40 bg-secondary">
              {a.photo_url
                ? <img src={mediaUrl(a.photo_url)} alt="" className="h-full w-full object-cover blur-photo" style={{ filter: "blur(8px)" }} />
                : <div className="flex h-full w-full items-center justify-center text-muted-foreground">?</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><Icon className="h-7 w-7" /></div>
      )}
      <h2 className="flex items-center justify-center gap-2 font-serif text-2xl font-semibold"><Lock className="h-5 w-5 text-[hsl(var(--gold))]" />{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Button className="mt-5 rounded-full" onClick={onCta} data-testid="teaser-subscribe-btn">{cta}</Button>
    </div>
  );
}

export default function Favorites() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [admirers, setAdmirers] = useState({ locked: false, count: 0, preview: [], admirers: [] });
  const [visitors, setVisitors] = useState({ locked: false, count: 0, count_week: 0, preview: [], visitors: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadFavorites = useCallback(async () => {
    try { const { data } = await api.get("/favorites"); setFavorites(data.favorites); setFavIds(new Set(data.ids)); }
    catch (e) { toast.error(apiError(e)); }
  }, []);
  const loadAdmirers = useCallback(async () => {
    try { const { data } = await api.get("/favorites/received"); setAdmirers(data); }
    catch (e) { toast.error(apiError(e)); }
  }, []);
  const loadVisitors = useCallback(async () => {
    try { const { data } = await api.get("/visitors"); setVisitors(data); }
    catch (e) { toast.error(apiError(e)); }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await Promise.all([loadFavorites(), loadAdmirers(), loadVisitors()]); setLoading(false); })();
  }, [loadFavorites, loadAdmirers, loadVisitors]);

  const toggleFavorite = async (p) => {
    const isFav = favIds.has(p.user_id);
    setFavIds((prev) => { const n = new Set(prev); isFav ? n.delete(p.user_id) : n.add(p.user_id); return n; });
    try {
      if (isFav) {
        await api.delete(`/favorites/${p.user_id}`);
        setFavorites((prev) => prev.filter((x) => x.user_id !== p.user_id));
        toast.success(t("fav.removed"));
      } else { const { data } = await api.post(`/favorites/${p.user_id}`); toast.success(data?.mutual ? t("fav.mutualToast") : t("fav.added")); }
    } catch (e) {
      setFavIds((prev) => { const n = new Set(prev); isFav ? n.add(p.user_id) : n.delete(p.user_id); return n; });
      toast.error(apiError(e));
    }
  };

  const openProfile = (p) => { setSelected(p); api.post(`/profile/${p.user_id}/view`).catch(() => {}); };

  const Stat = ({ icon: Icon, value, label, testid }) => (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3" data-testid={testid}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="font-serif text-2xl font-bold text-[hsl(var(--gold))] leading-none">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  const TabBtn = ({ id, icon: Icon, label, count }) => (
    <button onClick={() => setTab(id)} data-testid={`fav-tab-${id}`}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${tab === id ? "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] ring-1 ring-[hsl(var(--gold))]/40" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="h-4 w-4" /> {label}
      {count > 0 && <span className="rounded-full bg-[hsl(var(--gold))]/20 px-2 py-0.5 text-xs">{count}</span>}
    </button>
  );

  return (
    <div data-testid="favorites-page">
      <h1 className="mb-5 font-serif text-3xl font-semibold">{t("fav.pageTitle")}</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={Star} value={favorites.length} label={t("fav.statFavorites")} testid="stat-favorites" />
        <Stat icon={Heart} value={admirers.count} label={t("fav.statAdmirers")} testid="stat-admirers" />
        <Stat icon={Eye} value={visitors.count} label={t("fav.statVisitors")} testid="stat-visitors" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabBtn id="favorites" icon={Star} label={t("fav.tabFavorites")} count={favorites.length} />
        <TabBtn id="admirers" icon={Heart} label={t("fav.tabAdmirers")} count={admirers.count} />
        <TabBtn id="visitors" icon={Eye} label={t("fav.tabVisitors")} count={visitors.count} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : tab === "favorites" ? (
        favorites.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="favorites-empty">{t("fav.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="favorites-grid">
            {favorites.map((p) => (
              <ProfileCard key={p.user_id} profile={p} onOpen={openProfile} favorited={favIds.has(p.user_id)} onFavorite={toggleFavorite} />
            ))}
          </div>
        )
      ) : tab === "admirers" ? (
        admirers.locked ? (
          <LockedTeaser icon={Heart} preview={admirers.preview} onCta={() => navigate("/app/plans")}
            title={t("fav.admirersLockedTitle")}
            desc={admirers.count > 0 ? t("fav.admirersLockedCount", { n: admirers.count }) : t("fav.admirersLockedDesc")}
            cta={t("fav.unlockCta")} />
        ) : admirers.admirers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="admirers-empty">{t("fav.admirersEmpty")}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="admirers-grid">
            {admirers.admirers.map((p) => (
              <ProfileCard key={p.user_id} profile={p} onOpen={openProfile} meta={timeAgo(p.favorited_at, lang)} favorited={favIds.has(p.user_id)} onFavorite={toggleFavorite} />
            ))}
          </div>
        )
      ) : visitors.locked ? (
        <LockedTeaser icon={Eye} preview={visitors.preview} onCta={() => navigate("/app/plans")}
          title={t("fav.visitorsLockedTitle")}
          desc={(visitors.count_week || visitors.count) > 0 ? t("fav.visitorsLockedWeek", { n: visitors.count_week || visitors.count }) : t("fav.visitorsLockedDesc")}
          cta={t("fav.unlockCta")} />
      ) : visitors.visitors.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="visitors-empty">{t("fav.visitorsEmpty")}</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="visitors-grid">
          {visitors.visitors.map((p) => (
            <ProfileCard key={p.user_id} profile={p} onOpen={openProfile} meta={timeAgo(p.visited_at, lang)} favorited={favIds.has(p.user_id)} onFavorite={toggleFavorite} />
          ))}
        </div>
      )}

      <ProfileDialog profile={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)}
        favorited={selected ? favIds.has(selected.user_id) : false} onFavorite={toggleFavorite} />
    </div>
  );
}
