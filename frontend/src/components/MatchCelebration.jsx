import React, { useMemo, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const CONFETTI_COLORS = ["#FFF099", "#D4AF37", "#AA7C11", "#E23B4E", "#10B981"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.8 + Math.random() * 1.6,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rounded: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-12vh",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: p.rounded ? "50%" : "2px",
            animation: `dlc-confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

function Avatar({ src, side }) {
  return (
    <div
      className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-[hsl(var(--gold))] shadow-[0_0_30px_rgba(212,175,55,0.4)] sm:h-28 sm:w-28"
      style={{ animation: `dlc-avatar-in-${side} 0.6s ease-out both` }}
    >
      {src ? (
        <img src={mediaUrl(src)} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-secondary text-2xl text-[hsl(var(--gold))]">♥</div>
      )}
    </div>
  );
}

export function MatchCelebration({ open, onOpenChange, me, them, onMessage }) {
  const { t } = useI18n();
  const myPhoto = me?.photo_url || me?.picture;
  const theirPhoto = them?.photo_url;

  useEffect(() => {
    if (open && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([25, 35, 25]); // vibration discrète au moment du match
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden border-[hsl(var(--gold))]/40 bg-card p-0 text-center" data-testid="match-dialog">
        {open && <Confetti />}
        {/* Bandeau Kente */}
        <div className="kente-bar h-1.5 w-full" />
        <div className="relative px-6 pb-7 pt-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--gold))]">Félicitations</p>
          <h2 className="gold-gradient-text font-serif text-4xl font-bold" data-testid="match-title">{t("match.itsMatch")}</h2>

          <div className="relative mt-6 flex items-center justify-center gap-4">
            <Avatar src={myPhoto} side="left" />
            <div
              className="relative z-10 -mx-5"
              style={{ animation: "dlc-heart-pop 0.7s ease-out 0.3s both" }}
            >
              <svg width="56" height="56" viewBox="0 0 64 64" style={{ animation: "dlc-heart-beat 1.3s ease-in-out 1s infinite" }}>
                <defs>
                  <radialGradient id="mcRuby" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#E23B4E" />
                    <stop offset="60%" stopColor="#A50E2A" />
                    <stop offset="100%" stopColor="#6B0018" />
                  </radialGradient>
                  <linearGradient id="mcGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFF3B0" />
                    <stop offset="100%" stopColor="#AA7C11" />
                  </linearGradient>
                </defs>
                <path d="M32 56C14 44 6 34 6 22 6 13 13 7 21 7c5 0 9 2.5 11 6.5C34 9.5 38 7 43 7c8 0 15 6 15 15 0 12-8 22-26 34z"
                  fill="url(#mcRuby)" stroke="url(#mcGold)" strokeWidth="2.5" />
              </svg>
            </div>
            <Avatar src={theirPhoto} side="right" />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {t("match.matchDesc")} <span className="font-semibold text-foreground">{them?.display_name}</span>
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button className="rounded-full bg-gradient-to-r from-[#FFF099] via-[#D4AF37] to-[#AA7C11] font-semibold text-[#0A0908] hover:opacity-90" onClick={onMessage} data-testid="match-message-btn">
              <MessageCircle className="mr-2 h-4 w-4" /> {t("match.message")}
            </Button>
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)} data-testid="match-continue-btn">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
