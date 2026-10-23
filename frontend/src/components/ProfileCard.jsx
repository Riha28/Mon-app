import React from "react";
import { Heart, X, MapPin, Lock, Star } from "lucide-react";
import { KycBadge, OnlineDot } from "@/components/StatusBadges";
import { mediaUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export function ProfileCard({ profile, onLike, onPass, onOpen, favorited, onFavorite, meta }) {
  const { t } = useI18n();
  const locked = profile.photos_locked;
  const photo = mediaUrl(profile.photo_url);

  return (
    <div data-testid={`profile-card-${profile.user_id}`}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary" onClick={() => onOpen && onOpen(profile)} role="button">
        {photo ? (
          <img src={photo} alt={profile.display_name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${locked ? "blur-photo" : ""}`} />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">{(profile.display_name || "?").slice(0, 1)}</div>
        )}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 p-4 text-center backdrop-blur-[2px]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-primary"><Lock className="h-5 w-5" /></div>
            <p className="max-w-[85%] text-xs font-medium text-white drop-shadow">Photos floutées — vérifiez votre identité (KYC) pour les afficher nettes</p>
          </div>
        )}
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(profile); }}
            data-testid={`fav-btn-${profile.user_id}`}
            title={favorited ? t("fav.remove") : t("fav.add")}
            className={`absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors ${favorited ? "bg-[hsl(var(--gold))] text-[#0A0908]" : "bg-black/45 text-white hover:bg-black/65"}`}>
            <Star className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
          </button>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          {profile.online && <OnlineDot online />}
          {profile.kyc_verified && <KycBadge verified />}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
          <h3 className="font-serif text-xl font-semibold text-white">{profile.display_name}<span className="ml-1 font-sans text-base font-normal opacity-90">{profile.age}</span></h3>
          <p className="flex items-center gap-1 text-xs text-white/85"><MapPin className="h-3 w-3" />{profile.city}, {profile.country}</p>
          {meta && <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold))]/90 px-2 py-0.5 text-[11px] font-medium text-[#0A0908]" data-testid={`card-meta-${profile.user_id}`}>{meta}</p>}
        </div>
      </div>

      {profile.bio && <p className="line-clamp-2 px-4 pt-3 text-sm text-muted-foreground">{profile.bio}</p>}

      {(onLike || onPass) && (
        <div className="flex items-center gap-2 p-3">
          <button data-testid={`pass-btn-${profile.user_id}`} onClick={() => onPass && onPass(profile)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
            <X className="h-4 w-4" /> {t("discover.pass")}
          </button>
          <button data-testid={`like-btn-${profile.user_id}`} onClick={() => onLike && onLike(profile)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
            <Heart className="h-4 w-4" /> {t("discover.like")}
          </button>
        </div>
      )}
    </div>
  );
}
