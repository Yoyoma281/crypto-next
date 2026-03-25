"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  User,
} from "lucide-react";
import UserSidebar from "@/components/user-sidebar";
import CoinSearch from "@/components/coin-search";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useI18n } from "@/lib/i18n";

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
  { key: "news" as const, href: "/news" },
  { key: "settings" as const, href: "/settings" },
  { key: "learn" as const, href: "/learn/how-to-trade" },
];

export default function TopBarStats() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Fetch current user session
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
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
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* ── Right: auth + avatar ── */}
          <div className="flex items-center gap-1 md:gap-2 order-2 md:order-3 flex-shrink-0">
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
    </>
  );
}
