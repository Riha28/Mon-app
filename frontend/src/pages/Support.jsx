import React, { useEffect, useRef, useState } from "react";
import { api, apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LifeBuoy, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SENDER_META = {
  user: { align: "justify-end", bubble: "bg-primary text-primary-foreground" },
  ai: { align: "justify-start", bubble: "bg-secondary text-foreground border border-[hsl(var(--gold))]/30" },
  admin: { align: "justify-start", bubble: "bg-[hsl(var(--gold))]/15 text-foreground border border-[hsl(var(--gold))]/50" },
};

export default function Support() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const load = async () => {
    try { const { data } = await api.get("/support/messages"); setMessages(data.messages); }
    catch (e) { toast.error(apiError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    setSending(true);
    try {
      const { data } = await api.post("/support/messages", { content });
      setMessages((m) => [...m, ...data.messages]);
    } catch (err) { toast.error(apiError(err)); }
    finally { setSending(false); }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col" data-testid="support-page">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]"><LifeBuoy className="h-6 w-6" /></div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Aide & Support</h1>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3 w-3 text-[hsl(var(--gold))]" /> Assistant disponible 24/7 · un conseiller peut aussi vous répondre</p>
          <a href="mailto:supportdiasporaloveconnect@gmail.com" className="text-xs font-medium text-[hsl(var(--gold))] hover:underline" data-testid="support-contact-email">supportdiasporaloveconnect@gmail.com</a>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-card p-4" data-testid="support-messages">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Posez votre question (profil, vérification, abonnement, sécurité…). Notre assistant vous répond tout de suite.
          </div>
        ) : messages.map((m) => {
          const meta = SENDER_META[m.sender] || SENDER_META.ai;
          return (
            <div key={m.message_id} className={`flex ${meta.align}`} data-testid={`support-msg-${m.sender}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${meta.bubble}`}>
                {m.sender !== "user" && <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{m.sender === "admin" ? "Équipe DLC" : "Assistant"}</p>}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          );
        })}
        {sending && <div className="flex justify-start"><div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex items-center gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrivez votre question…" className="rounded-full" data-testid="support-input" />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={sending} data-testid="support-send-btn"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
