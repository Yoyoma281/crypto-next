"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bitcoin, TrendingUp, BarChart2, Globe,
  ArrowUpRight, ArrowDownRight, ChevronDown, User,
} from "lucide-react";
import UserSidebar from "@/components/user-sidebar";
import CoinSearch from "@/components/coin-search";
import ThemeToggle from "@/components/theme-toggle";

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
}

function fmtBig(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

// Primary nav always visible; secondary collapses into "More"
const PRIMARY_NAV = [
  { label: "Markets",    href: "/" },
  { label: "Exchange",   href: "/coin/BTCUSDT?tab=trade" },
  { label: "Portfolio",  href: "/Portfolio" },
  { label: "Watchlist",  href: "/watchlist" },
];

const MORE_NAV = [
  { label: "History",     href: "/history" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "News",        href: "/news" },
  { label: "Settings",    href: "/settings" },
];

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export default function TopBarStats() {
  const pathname = usePathname();
  const [data, setData]           = useState<GlobalData | null>(null);
  const [moreOpen, setMoreOpen]   = useState(false);
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
            coins:        d.active_cryptocurrencies,
            marketCap:    d.total_market_cap.usd,
            volume24h:    d.total_volume.usd,
            btcDominance: d.market_cap_percentage.btc,
            change24h:    d.market_cap_change_percentage_24h_usd,
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
        { icon: Globe,    label: "Coins",      value: data.coins.toLocaleString() },
        {
          icon: BarChart2, label: "Mkt Cap",   value: fmtBig(data.marketCap),
          sub: `${isUp ? "+" : ""}${data.change24h.toFixed(1)}%`, up: isUp,
        },
        { icon: TrendingUp, label: "24h Vol",  value: fmtBig(data.volume24h) },
        { icon: Bitcoin,    label: "BTC Dom",  value: `${data.btcDominance.toFixed(1)}%` },
      ]
    : [];

  function navClass(href: string) {
    const hrefPath = href.split("?")[0];
    const active = pathname === hrefPath || (hrefPath !== "/" && pathname.startsWith(hrefPath));
    return `px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;
  }

  const moreActive = MORE_NAV.some(
    (l) => pathname === l.href || pathname.startsWith(l.href)
  );

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "";

  return (
    <>
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-6 px-5 py-2.5">

          {/* ── Left: logo + market stats ── */}
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <Bitcoin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm tracking-tight hidden sm:block">CrySer</span>
            </Link>

            <div className="hidden xl:flex items-center gap-4 text-[11px] text-muted-foreground pl-4 border-l border-border/60">
              {data ? stats.map((s) => (
                <div key={s.label} className="flex items-center gap-1 whitespace-nowrap">
                  <s.icon className="h-3 w-3 shrink-0 opacity-50" />
                  <span className="opacity-70">{s.label}:</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                  {"sub" in s && s.sub && (
                    <span
                      className="flex items-center gap-0.5 font-semibold"
                      style={{ color: s.up ? "#16c784" : "#ea3943" }}
                    >
                      {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {s.sub}
                    </span>
                  )}
                </div>
              )) : (
                <span className="animate-pulse opacity-40">Loading…</span>
              )}
            </div>
          </div>

          {/* ── Center: search + nav (truly centered) ── */}
          <div className="flex items-center gap-2">
            <CoinSearch />

            <nav className="flex items-center gap-1">
              {PRIMARY_NAV.map((link) => (
                <Link key={link.href} href={link.href} className={navClass(link.href)}>
                  {link.label}
                </Link>
              ))}

              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    moreActive || moreOpen
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  More <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>

                {moreOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-40 rounded-lg shadow-lg py-1 z-50"
                    style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  >
                    {MORE_NAV.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2 text-xs font-medium transition-colors ${
                          pathname === link.href || pathname.startsWith(link.href)
                            ? "text-foreground bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* ── Right: auth + avatar ── */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <ThemeToggle />

            {!currentUser && (
              <>
                <Link
                  href="/signup"
                  className="text-xs px-3 py-1.5 rounded-md font-medium border border-border hover:bg-muted transition-colors hidden sm:block"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Login
                </Link>
              </>
            )}

            <Avatar
              className="h-7 w-7 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              {initials ? (
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
