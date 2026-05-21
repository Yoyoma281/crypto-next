"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  User,
  Zap,
} from "lucide-react";
import UserSidebar from "@/components/user-sidebar";
import CoinSearch from "@/components/coin-search";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import NotificationBell from "@/components/NotificationBell";
import { useI18n } from "@/lib/i18n";
import { useArenaMode } from "@/contexts/ArenaModeContext";

const SpinModal = dynamic(() => import("@/components/SpinModal"), { ssr: false });

interface UserInfo {
  username: string;
  _id: string;
  avatar?: string;
}


const PRIMARY_NAV_KEYS = [
  { key: "markets" as const, href: "/" },
  { key: "exchange" as const, href: "/coin/BTCUSDT?tab=trade" },
  { key: "portfolio" as const, href: "/Portfolio" },
  { key: "watchlist" as const, href: "/watchlist" },
];

const MORE_NAV_KEYS = [
  { key: "history" as const, href: "/history" },
  { key: "leaderboard" as const, href: "/leaderboard" },
  { key: "alerts" as const, href: "/alerts" },
  { key: "news" as const, href: "/news" },
  { key: "settings" as const, href: "/settings" },
  { key: "learn" as const, href: "/learn/how-to-trade" },
];

const ARENA_NAV = { label: "Arena", href: "/arena" };

const FRIENDS_NAV = { label: "Friends", href: "/friends" };

const SQUADS_NAV = { label: "Squads", href: "/squads" };

export default function TopBarStats() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { activeMode, setActiveMode, weekInfo, countdown } = useArenaMode();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [spinOpen, setSpinOpen] = useState(false);
  const [spinAvailable, setSpinAvailable] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Fetch current user session
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // Check spin availability
  useEffect(() => {
    fetch("/api/spin/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSpinAvailable(!!data?.canSpin))
      .catch(() => setSpinAvailable(false));
  }, []);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navClass(href: string) {
    const hrefPath = href.split("?")[0];
    const active =
      pathname === hrefPath ||
      (hrefPath !== "/" && pathname.startsWith(hrefPath));
    return `px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;
  }

  const moreActive = MORE_NAV_KEYS.some(
    (l) => pathname === l.href || pathname.startsWith(l.href),
  );

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "";

  return (
    <>
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2 md:gap-6 px-2 md:px-5 py-2 md:py-2.5 flex-wrap md:flex-nowrap">
          {/* ── Left: logo + market stats ── */}
          <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
<span className="font-bold text-xs md:text-sm tracking-tight hidden sm:block">
                CrySer
              </span>
            </Link>
            {/* <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 shrink-0"
              style={{
                background: "rgba(255,215,0,0.08)",
                color: "#ffd700",
                border: "1px solid rgba(255,215,0,0.25)",
              }}
            >
              DEMO
            </span> */}

            <div className="hidden">
            </div>
          </div>

          {/* ── Center: search + nav ── */}
          <div className="flex items-center gap-1 md:gap-2 order-3 md:order-2 w-full md:w-auto md:flex-1 md:justify-center">
            <div className="hidden sm:block shrink-0">
              <CoinSearch />
            </div>

            <nav className="flex items-center gap-0.5 md:gap-1 flex-wrap">
              {PRIMARY_NAV_KEYS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navClass(link.href)}
                >
                  {t.nav[link.key]}
                </Link>
              ))}
              <Link href={SQUADS_NAV.href} className={navClass(SQUADS_NAV.href)}>
                {SQUADS_NAV.label}
              </Link>
              <Link href={FRIENDS_NAV.href} className={navClass(FRIENDS_NAV.href)}>
                {FRIENDS_NAV.label}
              </Link>

              {/* Arena mode toggle */}
              <div
                className="hidden sm:flex items-center gap-0.5 ml-1 p-0.5 rounded-lg border transition-all"
                style={
                  activeMode === 'arena'
                    ? {
                        borderColor: 'rgba(245,200,66,0.55)',
                        background: 'rgba(245,200,66,0.08)',
                        boxShadow: '0 0 0 1px rgba(245,200,66,0.2), 0 0 12px rgba(245,200,66,0.18)',
                      }
                    : { borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted) / 0.3)' }
                }
              >
                <button
                  onClick={() => setActiveMode('portfolio')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeMode === 'portfolio'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveMode('arena')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeMode === 'arena' ? '' : 'text-muted-foreground hover:text-amber-400'
                  }`}
                  style={
                    activeMode === 'arena'
                      ? { background: '#f5c842', color: '#1a1408', boxShadow: '0 0 12px rgba(245,200,66,0.55)' }
                      : {}
                  }
                >
                  {activeMode === 'arena' && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: '#1a1408', animation: 'arenaTogglePulse 1.8s ease-in-out infinite' }}
                    />
                  )}
                  <span>Arena</span>
                  {weekInfo && countdown && (
                    <span className="text-[8px] opacity-80 font-mono">{countdown}</span>
                  )}
                </button>
              </div>

              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-0.5 md:gap-1 px-2 md:px-3.5 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap ${
                    moreActive || moreOpen
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {t.nav.more}{" "}
                  <ChevronDown
                    className={`h-2.5 md:h-3 w-2.5 md:w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {moreOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 md:mt-1.5 w-36 md:w-44 rounded-lg shadow-lg py-1 z-50"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {MORE_NAV_KEYS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2 text-xs font-medium transition-colors ${
                          pathname === link.href ||
                          pathname.startsWith(link.href)
                            ? "text-foreground bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {t.nav[link.key]}
                      </Link>
                    ))}
                    <Link
                      href={ARENA_NAV.href}
                      onClick={() => setMoreOpen(false)}
                      className={`block px-3 py-2 text-xs font-medium transition-colors ${
                        pathname === ARENA_NAV.href || pathname.startsWith(ARENA_NAV.href)
                          ? 'text-amber-400 bg-muted'
                          : 'text-amber-400/70 hover:text-amber-400 hover:bg-muted/60'
                      }`}
                    >
                      {ARENA_NAV.label}
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* ── Right: auth + avatar ── */}
          <div className="flex items-center gap-1 md:gap-2 order-2 md:order-3 flex-shrink-0">
            {/* Spin button */}
            <button
              onClick={() => setSpinOpen(true)}
              title="Daily Spin"
              style={{
                position: "relative",
                background: "transparent",
                border: "1px solid rgba(245,200,66,0.3)",
                borderRadius: 8,
                cursor: "pointer",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#f5c842",
                fontSize: "0.7rem",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(245,200,66,0.08)";
                e.currentTarget.style.borderColor = "rgba(245,200,66,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(245,200,66,0.3)";
              }}
            >
              <Zap style={{ width: 13, height: 13 }} />
              <span className="hidden sm:inline">Spin</span>
              {spinAvailable && (
                <span
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4edea3",
                    boxShadow: "0 0 6px #4edea3",
                    animation: "spinPulse 1.5s ease-in-out infinite",
                  }}
                />
              )}
            </button>
            <NotificationBell />
            <LanguageSelector />
            <ThemeToggle />

            {!currentUser && (
              <>
                <Link
                  href="/signup"
                  className="text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-md font-medium border border-border hover:bg-muted transition-colors hidden sm:block"
                >
                  {t.nav.signup}
                </Link>
                <Link
                  href="/login"
                  className="text-[10px] md:text-xs px-2.5 md:px-3 py-1.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t.nav.login}
                </Link>
              </>
            )}

            <Avatar
              className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              {currentUser?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : initials ? (
                <AvatarFallback
                  className="text-[10px] font-bold text-white"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {initials}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="text-[10px]">
                  <User className="h-3.5 w-3.5" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
      </div>

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={currentUser}
      />

      <SpinModal
        isOpen={spinOpen}
        onClose={() => {
          setSpinOpen(false);
          setSpinAvailable(false);
        }}
      />

      <style>{`
        @keyframes spinPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes arenaTogglePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </>
  );
}
