import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Compass, Heart, MessageCircle, User, LogOut, Shield, CreditCard, LifeBuoy, Gem, Coins, Star } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PlanBadge, KycBadge } from "@/components/StatusBadges";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { AgeGate } from "@/components/AgeGate";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { mediaUrl, api } from "@/lib/api";

function useTheme() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("dlc_theme", "dark");
  }, []);
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const { data } = await api.get("/messages/unread-count"); if (active) setMsgUnread(data.count || 0); }
      catch { /* */ }
    };
    load();
    const id = setInterval(load, 45000);
    return () => { active = false; clearInterval(id); };
  }, [location.pathname]);

  const isVip = user?.has_purchased || user?.role === "admin" || ["vip", "gold", "platinum"].includes(user?.access_level);
  const isSubscriber = user?.role === "admin" || ["standard", "premium", "vip", "gold", "platinum"].includes(user?.access_level);
  const navItems = [
    { to: "/app", icon: Compass, label: t("nav.discover"), end: true, id: "discover" },
    { to: "/app/matches", icon: Heart, label: t("nav.matches"), id: "matches" },
    { to: "/app/favorites", icon: Star, label: t("nav.favorites"), id: "favorites" },
    { to: "/app/messages", icon: MessageCircle, label: t("nav.messages"), id: "messages", badge: msgUnread },
    ...(isVip ? [{ to: "/app/vip-club", icon: Gem, label: t("nav.vipClub"), id: "vip-club", gold: true }] : []),
    { to: "/app/profile", icon: User, label: t("nav.profile"), id: "profile" },
    { to: "/app/support", icon: LifeBuoy, label: t("nav.support"), id: "support" },
  ];

  const photo = user?.photo_url ? mediaUrl(user.photo_url) : user?.picture;

  // Mandatory 18+ age gate for accounts without an age (e.g. Google signups)
  if (user && (user.age === null || user.age === undefined) && user.role !== "admin") {
    return <AgeGate />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => navigate("/app")} className="shrink-0" data-testid="header-logo-btn">
            <Logo size={38} withText variant="dark" />
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => (
              <NavLink key={it.id} to={it.to} end={it.end} data-testid={`nav-${it.id}`}
                className={({ isActive }) => `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-secondary text-foreground" : it.gold ? "text-[hsl(var(--gold))] hover:text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <span className="relative inline-flex">
                  <it.icon className={`h-4 w-4 ${it.gold ? "text-[hsl(var(--gold))]" : ""}`} />
                  {it.badge > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground" data-testid={`nav-badge-${it.id}`}>{it.badge > 9 ? "9+" : it.badge}</span>}
                </span>
                {it.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/app/plans")} className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/10 px-3 py-1.5 text-sm font-semibold text-[hsl(var(--gold))] transition-transform hover:scale-[1.04]" data-testid="header-credits-pill" title={isSubscriber ? t("plans.unlimitedActive") : "Crédits"}>
              {isSubscriber ? <><Gem className="h-4 w-4" /> ∞</> : <><Coins className="h-4 w-4" /> {user?.credits ?? 0}</>}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              {user && <PlanBadge level={user.access_level} daysLeft={user.trial_days_left} />}
              {user && <KycBadge verified={user.kyc_status === "verified"} />}
            </div>
            <LanguageToggle className="hidden sm:inline-flex" />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="user-menu-trigger" className="outline-none">
                <Avatar className="h-9 w-9 ring-1 ring-border">
                  {photo ? <AvatarImage src={photo} alt="" /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary">{(user?.display_name || "?").slice(0, 1)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-sm font-medium">{user?.display_name}</div>
                <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user?.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/profile")} data-testid="menu-profile"><User className="mr-2 h-4 w-4" />{t("nav.profile")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/plans")} data-testid="menu-plans"><CreditCard className="mr-2 h-4 w-4" />{t("nav.plans")}</DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin"><Shield className="mr-2 h-4 w-4" />{t("nav.admin")}</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 sm:hidden"><LanguageToggle /></div>
                <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="menu-logout"><LogOut className="mr-2 h-4 w-4" />{t("nav.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-2 sm:hidden">
          {user && <PlanBadge level={user.access_level} daysLeft={user.trial_days_left} />}
          {user && <KycBadge verified={user.kyc_status === "verified"} />}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {navItems.map((it) => (
            <NavLink key={it.id} to={it.to} end={it.end} data-testid={`bottomnav-${it.id}`}
              className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${isActive ? "text-primary" : it.gold ? "text-[hsl(var(--gold))]" : "text-muted-foreground"}`}>
              <span className="relative inline-flex">
                <it.icon className="h-5 w-5" />
                {it.badge > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground" data-testid={`bottomnav-badge-${it.id}`}>{it.badge > 9 ? "9+" : it.badge}</span>}
              </span>
              {it.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
