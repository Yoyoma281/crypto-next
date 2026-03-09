"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bitcoin, TrendingUp, BarChart2, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface GlobalData {
  coins: number;
  markets: number;
  marketCap: number;
  volume24h: number;
  btcDominance: number;
  change24h: number;
}

function fmtBig(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

const NAV_LINKS = [
  { label: "Markets", href: "/" },
  { label: "Exchange", href: "/Exchange/BTCUSDT" },
  { label: "Portfolio", href: "/Portfolio" },
];

export default function TopBarStats() {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<GlobalData | null>(null);

  useEffect(() => {
    const fetchGlobal = () => {
      fetch("https://api.coingecko.com/api/v3/global")
        .then((r) => r.json())
        .then((json) => {
          const d = json.data;
          setData({
            coins: d.active_cryptocurrencies,
            markets: d.markets,
            marketCap: d.total_market_cap.usd,
            volume24h: d.total_volume.usd,
            btcDominance: d.market_cap_percentage.btc,
            change24h: d.market_cap_change_percentage_24h_usd,
          });
        })
        .catch(() => {});
    };

    fetchGlobal();
    const id = setInterval(fetchGlobal, 60_000);
    return () => clearInterval(id);
  }, []);

  const isUp = (data?.change24h ?? 0) >= 0;

  const stats = data
    ? [
        {
          icon: Globe,
          label: "Coins",
          value: data.coins.toLocaleString(),
        },
        {
          icon: BarChart2,
          label: "Market Cap",
          value: fmtBig(data.marketCap),
          colored: true,
          up: isUp,
          sub: `${isUp ? "+" : ""}${data.change24h.toFixed(1)}%`,
        },
        {
          icon: TrendingUp,
          label: "24h Vol",
          value: fmtBig(data.volume24h),
        },
        {
          icon: Bitcoin,
          label: "BTC Dom",
          value: `${data.btcDominance.toFixed(1)}%`,
        },
      ]
    : [];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-4 px-4 py-2 max-w-screen-xl mx-auto">

        {/* ── Brand ─────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <Bitcoin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:block">CrySer</span>
        </Link>

        {/* ── Live Stats ────────────────────────── */}
        <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground">
          {data ? stats.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <s.icon className="h-3 w-3 shrink-0" />
              <span>{s.label}:</span>
              <span className="font-medium text-foreground">{s.value}</span>
              {s.sub && (
                <span
                  className="flex items-center gap-0.5 font-semibold"
                  style={{ color: s.up ? "#16c784" : "#ea3943" }}
                >
                  {s.up
                    ? <ArrowUpRight className="h-3 w-3" />
                    : <ArrowDownRight className="h-3 w-3" />}
                  {s.sub}
                </span>
              )}
            </div>
          )) : (
            <span className="animate-pulse">Loading market data…</span>
          )}
        </div>

        {/* ── Nav Links ─────────────────────────── */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Avatar / Login ─────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/signup")}
            className="text-xs px-3 py-1.5 rounded-md font-medium border border-border hover:bg-muted transition-colors"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push("/login")}
            className="text-xs px-3 py-1.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
          <Avatar className="h-7 w-7 cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="text-[10px]">U</AvatarFallback>
          </Avatar>
        </div>

      </div>
    </div>
  );
}
