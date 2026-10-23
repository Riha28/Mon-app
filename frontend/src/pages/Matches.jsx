import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { KycDialog } from "@/components/KycDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { KycBadge, OnlineDot } from "@/components/StatusBadges";
import { MessageCircle, MapPin, Heart, Loader2, ShieldAlert } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { toast } from "sonner";

export default function Matches() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycOpen, setKycOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/matches"); setMatches(data.matches); }
      catch (e) { toast.error(apiError(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const openChat = (m) => {
    navigate(`/app/chat/${m.match_id}`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-5 font-serif text-3xl font-semibold">{t("match.title")}</h1>

      {user?.kyc_status !== "verified" && matches.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-200" data-testid="matches-kyc-banner">
          <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> {t("chat.kycGateDesc")}</span>
          <Button size="sm" className="rounded-full" onClick={() => setKycOpen(true)} data-testid="matches-verify-btn">{t("chat.verifyNow")}</Button>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center" data-testid="matches-empty">
          <Heart className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p className="text-muted-foreground">{t("match.empty")}</p>
          <Button className="mt-4 rounded-full" onClick={() => navigate("/app")} data-testid="matches-go-discover-btn">{t("nav.discover")}</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m) => {
            const o = m.other;
            const photo = mediaUrl(o.photo_url);
            return (
              <div key={m.match_id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md" data-testid={`match-item-${m.match_id}`}>
                <div className="relative shrink-0">
                  <Avatar className="h-16 w-16 ring-1 ring-border">
                    {photo ? <AvatarImage src={photo} alt="" className={o.photos_locked ? "blur-photo" : ""} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary">{(o.display_name || "?").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  {o.online && <OnlineDot online className="absolute bottom-0 right-0" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-serif text-lg font-semibold">{o.display_name}, {o.age}</h3>
                    {o.kyc_verified && <KycBadge verified />}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{o.city}, {o.country}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.last_message || t("chat.empty")}</p>
                </div>
                <Button size="sm" className="shrink-0 rounded-full" onClick={() => openChat(m)} data-testid={`match-message-btn-${m.match_id}`}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <KycDialog open={kycOpen} onOpenChange={setKycOpen} />
    </div>
  );
}
