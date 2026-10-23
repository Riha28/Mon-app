import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Lock, Flag, Play, Star } from "lucide-react";
import { KycBadge, PlanBadge } from "@/components/StatusBadges";
import { ReportDialog } from "@/components/ReportDialog";
import { mediaUrl, isVideo } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export function ProfileDialog({ profile, open, onOpenChange, onLike, onPass, favorited, onFavorite }) {
  const { t } = useI18n();
  const [reportOpen, setReportOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [profile?.user_id]);
  if (!profile) return null;
  const locked = profile.photos_locked;
  const photos = (profile.photos && profile.photos.length
    ? profile.photos.map(mediaUrl)
    : (profile.photo_url ? [mediaUrl(profile.photo_url)] : []));
  const photo = photos[idx] || photos[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md overflow-hidden p-0" data-testid="profile-dialog">
          <DialogTitle className="sr-only">{profile.display_name}</DialogTitle>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
            {photo
              ? (isVideo(photo)
                  ? <video src={photo} className={`h-full w-full object-cover ${locked ? "blur-photo" : ""}`} controls={!locked} muted={locked} playsInline preload="metadata" />
                  : <img src={photo} alt={profile.display_name} className={`h-full w-full object-cover ${locked ? "blur-photo" : ""}`} />)
              : <div className="flex h-full items-center justify-center text-5xl text-muted-foreground">{(profile.display_name || "?").slice(0, 1)}</div>}
            {locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 p-4 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-primary"><Lock className="h-5 w-5" /></div>
                <p className="max-w-[80%] text-xs font-medium text-white drop-shadow">Vérifiez votre identité (KYC) pour afficher les photos nettes</p>
              </div>
            )}
            {photos.length > 1 && (
              <div className="absolute inset-x-0 top-2 flex justify-center gap-1.5" data-testid="gallery-dots">
                {photos.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12">
              <h2 className="font-serif text-2xl font-semibold text-white">{profile.display_name}<span className="ml-1 font-sans text-lg font-normal opacity-90">{profile.age}</span></h2>
              <p className="flex items-center gap-1 text-sm text-white/85"><MapPin className="h-3.5 w-3.5" />{profile.city}, {profile.country}</p>
            </div>
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 pt-3" data-testid="gallery-thumbs">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${i === idx ? "border-primary" : "border-transparent"}`}>
                  {isVideo(src)
                    ? <><video src={src} className={`h-full w-full object-cover ${locked ? "blur-photo" : ""}`} muted playsInline preload="metadata" /><span className="pointer-events-none absolute inset-0 flex items-center justify-center"><Play className="h-4 w-4 text-white drop-shadow" /></span></>
                    : <img src={src} alt="" className={`h-full w-full object-cover ${locked ? "blur-photo" : ""}`} />}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 p-5">
            <div className="flex flex-wrap gap-2">
              {profile.kyc_verified && <KycBadge verified />}
              <PlanBadge level={profile.access_level} />
            </div>
            {profile.bio && <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

            {(onLike || onPass) && (
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => onPass(profile)} data-testid="dialog-pass-btn"><X className="mr-1 h-4 w-4" />{t("discover.pass")}</Button>
                <Button className="flex-1 rounded-full" onClick={() => onLike(profile)} data-testid="dialog-like-btn"><Heart className="mr-1 h-4 w-4" />{t("discover.like")}</Button>
              </div>
            )}
            {onFavorite && (
              <Button variant="outline" data-testid="dialog-fav-btn"
                onClick={() => onFavorite(profile)}
                className={`w-full rounded-full ${favorited ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]" : ""}`}>
                <Star className={`mr-1.5 h-4 w-4 ${favorited ? "fill-current text-[hsl(var(--gold))]" : ""}`} />
                {favorited ? t("fav.inFavorites") : t("fav.add")}
              </Button>
            )}
            <button className="flex w-full items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => setReportOpen(true)} data-testid="dialog-report-btn">
              <Flag className="h-3.5 w-3.5" /> {t("chat.report")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} targetId={profile.user_id} onBlocked={() => onOpenChange(false)} />
    </>
  );
}
