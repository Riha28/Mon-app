import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { KycDialog } from "@/components/KycDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [unread, setUnread] = useState({});
  const [loading, setLoading] = useState(true);
  const [kycOpen, setKycOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, uRes] = await Promise.all([api.get("/matches"), api.get("/messages/unread-count")]);
        setMatches(mRes.data.matches);
        setUnread(uRes.data.per_match || {});
      } catch (e) { toast.error(apiError(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const open = (m) => {
    navigate(`/app/chat/${m.match_id}`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-5 font-serif text-3xl font-semibold">{t("nav.messages")}</h1>
      {user?.kyc_status !== "verified" && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-200" data-testid="messages-kyc-banner">
          <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> {t("chat.kycGate")}</span>
          <Button size="sm" className="rounded-full" onClick={() => setKycOpen(true)} data-testid="messages-verify-btn">{t("chat.verifyNow")}</Button>
        </div>
      )}
      {matches.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="messages-empty">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-primary" />{t("match.empty")}
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {matches.map((m) => {
            const o = m.other; const photo = mediaUrl(o.photo_url);
            const n = unread[m.match_id] || 0;
            return (
              <button key={m.match_id} onClick={() => open(m)} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50" data-testid={`conversation-${m.match_id}`}>
                <Avatar className="h-12 w-12 ring-1 ring-border">
                  {photo ? <AvatarImage src={photo} alt="" className={o.photos_locked ? "blur-photo" : ""} /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary">{(o.display_name || "?").slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${n > 0 ? "font-semibold text-foreground" : "font-medium"}`}>{o.display_name}</p>
                  <p className={`truncate text-sm ${n > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{m.last_message || t("chat.empty")}</p>
                </div>
                {n > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground" data-testid={`conversation-unread-${m.match_id}`}>
                    {n > 9 ? "9+" : n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <KycDialog open={kycOpen} onOpenChange={setKycOpen} />
    </div>
  );
}
