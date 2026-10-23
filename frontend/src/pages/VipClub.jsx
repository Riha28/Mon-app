import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gem, Send, Loader2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

function timeLabel(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function VipClub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [denied, setDenied] = useState(false);
  const endRef = useRef(null);
  const roomRef = useRef(null);
  roomRef.current = activeRoom;

  const load = async (roomId) => {
    try {
      const rid = roomId !== undefined ? roomId : roomRef.current;
      const { data } = await api.get("/vip-club/messages", { params: rid ? { room_id: rid } : {} });
      setRooms(data.rooms || []);
      setActiveRoom(data.room_id);
      setMessages(data.messages);
    } catch (e) {
      if (e?.response?.status === 403) setDenied(true);
      else toast.error(apiError(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const id = setInterval(() => load(), 8000); return () => clearInterval(id); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const switchRoom = (rid) => { setActiveRoom(rid); setLoading(true); setMessages([]); load(rid); };

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    setSending(true);
    try {
      const { data } = await api.post("/vip-club/messages", { text: content, room_id: activeRoom });
      setMessages((m) => [...m, data.message]);
      if (data.filtered) toast.warning("Par sécurité, les coordonnées ont été masquées.");
    } catch (err) { toast.error(apiError(err)); }
    finally { setSending(false); }
  };

  if (denied) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[hsl(var(--gold))]/40 bg-card p-8 text-center" data-testid="vip-club-locked">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><Lock className="h-7 w-7" /></div>
        <h1 className="font-serif text-2xl font-semibold">Club VIP réservé</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cet espace d'échange est réservé aux membres VIP. Passez à l'offre VIP pour rejoindre la communauté privée.</p>
        <Button className="mt-5 rounded-full" onClick={() => navigate("/app/plans")} data-testid="vip-club-upgrade-btn"><Gem className="mr-2 h-4 w-4" />Devenir membre VIP</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col" data-testid="vip-club-page">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><Gem className="h-6 w-6" /></div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Club VIP</h1>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-3 w-3 text-[hsl(var(--gold))]" /> Espace privé entre membres VIP · coordonnées masquées automatiquement</p>
        </div>
      </div>

      {rooms.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" data-testid="vip-room-tabs">
          {rooms.map((r) => (
            <button key={r.room_id} onClick={() => switchRoom(r.room_id)} data-testid={`vip-room-${r.room_id}`}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${activeRoom === r.room_id ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {r.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[hsl(var(--gold))]/25 bg-card p-4" data-testid="vip-club-messages">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Bienvenue dans ce salon VIP ! Lancez la discussion et partagez vos idées avec les autres membres.</div>
        ) : messages.map((m) => {
          const mine = m.is_mine;
          const photo = m.photo_path ? mediaUrl(m.photo_path) : null;
          return (
            <div key={m.message_id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`} data-testid={`vip-msg-${m.message_id}`}>
              <Avatar className="h-8 w-8 shrink-0 ring-1 ring-[hsl(var(--gold))]/40">
                {photo ? <AvatarImage src={photo} alt="" /> : null}
                <AvatarFallback className="bg-[hsl(var(--gold))]/15 text-xs text-[hsl(var(--gold))]">{(m.display_name || "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold opacity-80">
                  {mine ? "Vous" : m.display_name}
                  <Gem className="h-2.5 w-2.5 text-[hsl(var(--gold))]" />
                </p>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-0.5 text-right text-[10px] opacity-50">{timeLabel(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex items-center gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Partagez une idée avec le salon…" className="rounded-full" data-testid="vip-club-input" maxLength={1000} />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={sending} data-testid="vip-club-send-btn"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
