"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bitcoin,
  TrendingUp,
  BarChart2,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  User,
} from "lucide-react";
import UserSidebar from "@/components/user-sidebar";
import CoinSearch from "@/components/coin-search";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useI18n } from "@/lib/i18n";

interface GlobalData {
  coins: number;
  marketCap: number;
  volume24h: number;
  btcDominance: number;
  change24h: number;
}

interface UserInfo {
  username: string;
  _id: string;
  avatar?: string;
}

function fmtBig(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
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
];

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export default function TopBarStats() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [data, setData] = useState<GlobalData | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Fetch global market stats
  useEffect(() => {
    const fetchGlobal = () =>
      fetch("https://api.coingecko.com/api/v3/global")
        .then((r) => r.json())
        .then((json) => {
          const d = json.data;
          setData({
            coins: d.active_cryptocurrencies,
            marketCap: d.total_market_cap.usd,
            volume24h: d.total_volume.usd,
            btcDominance: d.market_cap_percentage.btc,
            change24h: d.market_cap_change_percentage_24h_usd,
          });
        })
        .catch(() => {});

    fetchGlobal();
    const id = setInterval(fetchGlobal, 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch current user session
  useEffect(() => {
    fetch(`${BASE}/GetUserInfo`, { credentials: "include" })
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

  const isUp = (data?.change24h ?? 0) >= 0;

  const stats = data
    ? [
        {
          icon: Globe,
          label: t.stats.coins,
          value: data.coins.toLocaleString(),
        },
        {
          icon: BarChart2,
          label: t.stats.marketCap,
          value: fmtBig(data.marketCap),
          sub: `${isUp ? "+" : ""}${data.change24h.toFixed(1)}%`,
          up: isUp,
        },
        {
          icon: TrendingUp,
          label: t.stats.volume24h,
          value: fmtBig(data.volume24h),
        },
        {
          icon: Bitcoin,
          label: t.stats.btcDominance,
          value: `${data.btcDominance.toFixed(1)}%`,
        },
      ]
    : [];

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
              <div className="h-6 md:h-7 w-6 md:w-7 rounded-full bg-primary flex items-center justify-center">
                <Bitcoin className="h-3 md:h-4 w-3 md:w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xs md:text-sm tracking-tight hidden sm:block">
                CrySer
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-muted-foreground pl-2 md:pl-4 border-l border-border/60">
              {data ? (
                stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-0.5 md:gap-1 whitespace-nowrap"
                  >
                    <s.icon className="h-2.5 md:h-3 w-2.5 md:w-3 shrink-0 opacity-50" />
                    <span className="opacity-70 hidden xl:inline">
                      {s.label}:
                    </span>
                    <span className="font-medium text-foreground text-[8px] md:text-xs">
                      {s.value}
                    </span>
                    {"sub" in s && s.sub && (
                      <span
                        className="flex items-center gap-0.5 font-semibold"
                        style={{ color: s.up ? "#4edea3" : "#ffb3ad" }}
                      >
                        {s.up ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {s.sub}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span className="animate-pulse opacity-40 text-[8px]">
                  Loading…
                </span>
              )}
            </div>
          </div>

          {/* ── Center: search + nav (mobile-responsive) ── */}
          <div className="flex items-center gap-1 md:gap-2 order-3 md:order-2 w-full md:w-auto md:flex-1 md:justify-center">
            <div className="hidden sm:block flex-1 md:flex-none">
              <CoinSearch />
            </div>

            <nav className="flex items-center gap-0.5 md:gap-1 flex-wrap">
              {PRIMARY_NAV_KEYS.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navClass(link.href)}
                >
                  <span className="hidden md:inline">{t.nav[link.key]}</span>
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
                    className="absolute right-0 top-full mt-1 md:mt-1.5 w-32 md:w-40 rounded-lg shadow-lg py-1 z-50"
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
                        className={`block px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium transition-colors ${
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

          {/* ── Right: auth + avatar (mobile-optimized) ── */}
          <div className="flex items-center gap-1 md:gap-2 order-2 md:order-3 flex-shrink-0">
            <LanguageSelector />
            <ThemeToggle />

            {!currentUser && (
              <>
                <Link
                  href="/signup"
                  className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium border border-border hover:bg-muted transition-colors hidden md:block"
                >
                  {t.nav.signup}
                </Link>
                <Link
                  href="/login"
                  className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t.nav.login}
                </Link>
              </>
            )}

            <Avatar
              className="h-6 md:h-7 w-6 md:w-7 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : initials ? (
                <AvatarFallback
                  className="text-[7px] md:text-[10px] font-bold text-white"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {initials}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="text-[7px] md:text-[10px]">
                  <User className="h-3 md:h-3.5 w-3 md:w-3.5" />
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
