"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LogOut,
  TrendingUp,
  BarChart2,
  Wallet,
  History,
  Trophy,
  Newspaper,
  Settings,
  Star,
  Bitcoin,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface UserInfo {
  username: string;
  _id: string;
  avatar?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo | null;
}

export default function UserSidebar({ isOpen, onClose, user }: Props) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const NAV_SECTIONS = [
    {
      label: t.sidebar.market,
      items: [
        { icon: BarChart2, label: t.nav.markets, href: "/" },
        {
          icon: TrendingUp,
          label: t.nav.exchange,
          href: "/coin/BTCUSDT?tab=trade",
        },
        { icon: Star, label: t.nav.watchlist, href: "/watchlist" },
        { icon: Newspaper, label: t.nav.news, href: "/news" },
        { icon: Trophy, label: t.nav.leaderboard, href: "/leaderboard" },
      ],
    },
    {
      label: t.sidebar.account,
      items: [
        { icon: Wallet, label: t.nav.portfolio, href: "/Portfolio" },
        { icon: History, label: t.nav.history, href: "/history" },
        { icon: Settings, label: t.nav.settings, href: "/settings" },
      ],
    },
  ];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    onClose();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={ref}
        className="fixed top-0 right-0 z-50 h-full w-72 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          background: "hsl(var(--card))",
          borderLeft: "1px solid hsl(var(--border))",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">CrySer</span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User card */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {initials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">
                  {user.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.sidebar.paperTrader}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {t.sidebar.notSignedIn}
              </p>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex-1 text-center py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t.sidebar.signIn}
                </Link>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="flex-1 text-center py-1.5 rounded-md text-xs font-semibold border border-border hover:bg-muted transition-colors"
                >
                  {t.sidebar.register}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
                {section.label}
              </span>
              {section.items.map(({ icon: Icon, label, href }) => {
                const hrefPath = href.split("?")[0];
                const active =
                  pathname === hrefPath ||
                  (hrefPath !== "/" && pathname.startsWith(hrefPath));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={
                      active
                        ? {
                            background: "hsl(var(--muted))",
                            color: "hsl(var(--foreground))",
                          }
                        : { color: "hsl(var(--muted-foreground))" }
                    }
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.background =
                          "hsl(var(--muted)/0.6)";
                      if (!active)
                        e.currentTarget.style.color = "hsl(var(--foreground))";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "";
                      if (!active)
                        e.currentTarget.style.color =
                          "hsl(var(--muted-foreground))";
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: logout */}
        {user && (
          <div
            className="px-3 py-4"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "#ffb3ad" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,179,173,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {t.sidebar.signOut}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
