import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Star, Eye, Heart, Lock, Loader2, MessageCircle, Sparkles, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api, mediaUrl } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const ICONS = { favorite: Star, visit: Eye, match: Heart, message: MessageCircle, mutual: Sparkles, payment_approved: CheckCircle2, like: Heart, new_member: UserPlus, payment_rejected: XCircle };

export function NotificationBell() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, 45000);
    return () => clearInterval(timer.current);
  }, [load]);

  const onOpenChange = async (o) => {
    setOpen(o);
    if (o) {
      await load();
      if (unread > 0) {
        try { await api.post("/notifications/read"); } catch { /* */ }
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, is_new: false })));
      }
    }
  };

  const label = (n) => {
    if (n.type === "payment_approved") return `Paiement confirmé : ${n.name} est actif`;
    if (n.type === "payment_rejected") return `Paiement non confirmé : ${n.name}`;
    const who = n.name || t("notif.someone");
    if (n.type === "match") return t("notif.match", { name: who });
    if (n.type === "mutual") return t("notif.mutual", { name: who });
    if (n.type === "message") return t("notif.message", { name: who });
    if (n.type === "like") return n.locked ? t("notif.likeLocked") : t("notif.like", { name: who });
    if (n.type === "new_member") return t("notif.newMember", { name: who });
    if (n.type === "favorite") return n.locked ? t("notif.favoriteLocked") : t("notif.favorite", { name: who });
    return n.locked ? t("notif.visitLocked") : t("notif.visit", { name: who });
  };

  const onItemClick = (n) => {
    setOpen(false);
    if (n.type.startsWith("payment_")) { navigate("/app/plans"); return; }
    if ((n.type === "match" || n.type === "message") && n.match_id) navigate(`/app/chat/${n.match_id}`);
    else if (n.type === "match" || n.type === "message") navigate("/app/matches");
    else if (n.locked) navigate("/app/plans");
    else if (n.type === "new_member" || n.type === "like") navigate("/app");
    else navigate("/app/favorites");
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground" data-testid="notif-bell-btn" title={t("notif.title")}>
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground" data-testid="notif-unread-badge">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" data-testid="notif-panel">
        <div className="border-b border-border px-4 py-3">
          <p className="font-serif text-base font-semibold">{t("notif.title")}</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground" data-testid="notif-empty">{t("notif.empty")}</p>
          ) : (
            items.map((n, i) => {
              const Icon = ICONS[n.type] || Bell;
              const photo = n.photo_url ? mediaUrl(n.photo_url) : null;
              return (
                <button key={i} onClick={() => onItemClick(n)} data-testid={`notif-item-${i}`}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${n.is_new ? "bg-[hsl(var(--gold))]/5" : ""}`}>
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      {photo ? <AvatarImage src={photo} alt="" className={n.locked ? "blur-sm" : ""} /> : null}
                      <AvatarFallback className="bg-secondary"><Icon className="h-4 w-4 text-[hsl(var(--gold))]" /></AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background">
                      {n.locked ? <Lock className="h-3 w-3 text-[hsl(var(--gold))]" /> : <Icon className="h-3 w-3 text-[hsl(var(--gold))]" />}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{label(n)}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(n.at, lang)}</p>
                  </div>
                  {n.is_new && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
