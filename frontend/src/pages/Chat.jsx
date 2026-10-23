import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { KycDialog } from "@/components/KycDialog";
import { ReportDialog } from "@/components/ReportDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Send, MoreVertical, ShieldAlert, ShieldCheck, Flag, Ban, Loader2, Lock, Smile } from "lucide-react";
import { KycBadge, OnlineDot } from "@/components/StatusBadges";
import { toast } from "sonner";

const STICKERS = ["❤️", "😍", "😘", "🥰", "😊", "😂", "🔥", "👍", "🙏", "🌹", "💐", "✨", "🥂", "💍", "👀", "😅", "🤗", "💃", "🕺", "🎉", "😎", "🤝", "💜", "😉"];

export default function Chat() {
  const { matchId } = useParams();
  const { user, refresh } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    try { const { data } = await api.get(`/messages/${matchId}`); setData(data); }
    catch (e) { toast.error(apiError(e)); navigate("/app/matches"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [matchId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data?.messages?.length]);

  const postMessage = async (payload) => {
    setSending(true);
    try {
      const { data: res } = await api.post(`/messages/${matchId}`, payload);
      setData((d) => ({ ...d, messages: [...d.messages, res.message] }));
      if (res.filtered) toast.warning(t("chat.blocked"));
    } catch (err) {
      const code = err?.response?.data?.detail;
      if (code === "KYC_REQUIRED") setKycOpen(true);
      else if (code === "CREDITS_REQUIRED") { setData((d) => ({ ...d, unlocked: false, can_message: false })); }
      else toast.error(apiError(err));
    } finally { setSending(false); }
  };

  const unlock = async () => {
    try {
      const { data: res } = await api.post(`/messages/${matchId}/unlock`);
      setData((d) => ({ ...d, unlocked: true, can_message: true, credits: res.credits }));
      refresh();
      toast.success(t("chat.unlocked"));
    } catch (err) {
      const code = err?.response?.data?.detail;
      if (code === "KYC_REQUIRED") setKycOpen(true);
      else if (code === "CREDITS_REQUIRED") { toast.error(t("chat.noCredits")); navigate("/app/plans"); }
      else toast.error(apiError(err));
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    await postMessage({ text: value });
  };

  const sendSticker = async (sticker) => {
    setStickerOpen(false);
    await postMessage({ sticker });
  };

  const block = async () => {
    try { await api.post("/block", { target_id: data.other.user_id }); toast.success(t("common.blocked")); navigate("/app/matches"); }
    catch (e) { toast.error(apiError(e)); }
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const o = data.other;

  return (
    <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card" data-testid="chat-container">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-3">
        <button onClick={() => navigate("/app/messages")} className="rounded-full p-1.5 hover:bg-secondary" data-testid="chat-back-btn"><ArrowLeft className="h-5 w-5" /></button>
        <div className="relative">
          <Avatar className="h-10 w-10 ring-1 ring-border">
            {o?.photo_url ? <AvatarImage src={mediaUrl(o.photo_url)} alt="" className={o.photos_locked ? "blur-photo" : ""} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary">{(o?.display_name || "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          {o?.online && <OnlineDot online className="absolute bottom-0 right-0 !h-2.5 !w-2.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-medium">{o?.display_name} {o?.online && <span className="text-[11px] font-normal text-emerald-brand">en ligne</span>} {o?.kyc_verified && <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />}</p>
          <p className="truncate text-xs text-muted-foreground">{o?.city}, {o?.country}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-1.5 hover:bg-secondary outline-none" data-testid="chat-menu-trigger"><MoreVertical className="h-5 w-5" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReportOpen(true)} data-testid="chat-report-item"><Flag className="mr-2 h-4 w-4" />{t("chat.report")}</DropdownMenuItem>
            <DropdownMenuItem onClick={block} className="text-destructive" data-testid="chat-block-item"><Ban className="mr-2 h-4 w-4" />{t("chat.block")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Anti-doxxing notice */}
      <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 text-[11px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> {t("chat.blocked")}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4" data-testid="chat-messages">
        {data.messages.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("chat.empty")}</p>}
        {data.messages.map((m) => {
          const mine = m.sender_id === user.user_id;
          if (m.sticker) {
            return (
              <div key={m.message_id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-testid="chat-sticker-msg">
                <span className="select-none text-5xl leading-none drop-shadow-sm">{m.sticker}</span>
              </div>
            );
          }
          return (
            <div key={m.message_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                {m.text}
                {m.filtered && <span className="mt-1 block text-[10px] italic opacity-80">⚠ {t("chat.blocked")}</span>}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input / gate */}
      {data.unlocked ? (
        <div className="border-t border-border p-3" data-testid="chat-input-form">
          <form onSubmit={send} className="flex items-center gap-2">
            <Popover open={stickerOpen} onOpenChange={setStickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-full text-muted-foreground hover:text-primary" data-testid="chat-sticker-btn"><Smile className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-64 p-2" data-testid="chat-sticker-panel">
                <div className="grid grid-cols-6 gap-1">
                  {STICKERS.map((s) => (
                    <button key={s} type="button" onClick={() => sendSticker(s)} disabled={sending}
                      className="rounded-lg p-1.5 text-2xl transition-transform hover:scale-125 hover:bg-secondary disabled:opacity-50"
                      data-testid={`chat-sticker-${s}`}>{s}</button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("chat.placeholder")} className="rounded-full" data-testid="chat-input" />
            <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={sending} data-testid="chat-send-btn"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      ) : !data.verified ? (
        <div className="border-t border-border p-4" data-testid="chat-kyc-gate">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
            <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[hsl(var(--gold))]" /> {t("chat.kycGate")}</span>
            <Button size="sm" className="rounded-full" onClick={() => setKycOpen(true)} data-testid="chat-verify-btn">{t("chat.verifyNow")}</Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-4" data-testid="chat-unlock-gate">
          <div className="rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5 p-4 text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-[hsl(var(--gold))]" />
            <p className="text-sm font-medium">{t("chat.unlockTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("chat.unlockDesc")} · {t("chat.balance")}: <span className="font-semibold text-[hsl(var(--gold))]">{data.credits}</span></p>
            {data.credits >= 1 ? (
              <Button size="sm" className="mt-3 rounded-full" onClick={unlock} data-testid="chat-unlock-btn"><Lock className="mr-2 h-4 w-4" />{t("chat.unlockBtn")}</Button>
            ) : (
              <Button size="sm" className="mt-3 rounded-full" onClick={() => navigate("/app/plans")} data-testid="chat-recharge-btn">{t("chat.recharge")}</Button>
            )}
          </div>
        </div>
      )}

      <KycDialog open={kycOpen} onOpenChange={(o2) => { setKycOpen(o2); if (!o2) load(); }} />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} targetId={o?.user_id} onBlocked={() => navigate("/app/matches")} />
    </div>
  );
}
