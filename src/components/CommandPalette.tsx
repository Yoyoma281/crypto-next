"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  Gift,
  Globe,
  LayoutDashboard,
  Newspaper,
  Search,
  Settings,
  Star,
  Trophy,
  User,
  Zap,
} from "lucide-react";

// ─── Context ──────────────────────────────────────────────────────────────────

interface CPContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CPContext = createContext<CPContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return (
    <CPContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CPContext.Provider>
  );
}

export function useCommandPaletteContext(): CPContextValue {
  return useContext(CPContext);
}

// ─── Command definitions ───────────────────────────────────────────────────────

type CommandCategory = "Navigation" | "Trading" | "Settings" | "Actions";

interface Command {
  id: string;
  label: string;
  category: CommandCategory;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

// ─── Fuzzy match helper ────────────────────────────────────────────────────────

/**
 * Returns a score 0–1 for how well `needle` matches `haystack`.
 * 0 = no match, 1 = exact match.
 */
function fuzzyScore(needle: string, haystack: string): number {
  if (!needle) return 1;
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h === n) return 1;
  if (h.startsWith(n)) return 0.9;
  if (h.includes(n)) return 0.7;

  // character-by-character subsequence
  let ni = 0;
  let consecutive = 0;
  let score = 0;
  for (let hi = 0; hi < h.length && ni < n.length; hi++) {
    if (h[hi] === n[ni]) {
      ni++;
      consecutive++;
      score += consecutive;
    } else {
      consecutive = 0;
    }
  }
  if (ni < n.length) return 0;
  return Math.min(0.6, score / (n.length * n.length));
}

function matchCommand(cmd: Command, query: string): number {
  if (!query.trim()) return 1;
  const sources = [
    cmd.label,
    cmd.category,
    ...(cmd.keywords ?? []),
  ];
  return Math.max(...sources.map((s) => fuzzyScore(query, s)));
}

// ─── Category badge colors ─────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<CommandCategory, string> = {
  Navigation: "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)]",
  Trading:    "text-[#4edea3] bg-[rgba(78,222,163,0.12)]",
  Settings:   "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]",
  Actions:    "text-[#f5c842] bg-[rgba(245,200,66,0.12)]",
};

// ─── Main Palette Component ────────────────────────────────────────────────────

export default function CommandPalette() {
  const { isOpen, close } = useCommandPaletteContext();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Build commands inside the component so router is available
  const ALL_COMMANDS = useMemo<Command[]>(
    () => [
      // ── Navigation ──
      {
        id: "nav-markets",
        label: "Markets",
        category: "Navigation",
        icon: LayoutDashboard,
        keywords: ["home", "coins", "prices", "list"],
        action: () => { router.push("/"); close(); },
      },
      {
        id: "nav-exchange",
        label: "Exchange — BTC/USDT",
        category: "Navigation",
        icon: BarChart2,
        keywords: ["trade", "exchange", "buy", "sell", "bitcoin", "btc"],
        action: () => { router.push("/coin/BTCUSDT?tab=trade"); close(); },
      },
      {
        id: "nav-portfolio",
        label: "Portfolio",
        category: "Navigation",
        icon: Briefcase,
        keywords: ["holdings", "positions", "balance", "pnl", "profit"],
        action: () => { router.push("/Portfolio"); close(); },
      },
      {
        id: "nav-history",
        label: "Trade History",
        category: "Navigation",
        icon: Clock,
        keywords: ["orders", "past trades", "transactions"],
        action: () => { router.push("/history"); close(); },
      },
      {
        id: "nav-leaderboard",
        label: "Leaderboard",
        category: "Navigation",
        icon: Trophy,
        keywords: ["ranking", "top traders", "competition", "scores"],
        action: () => { router.push("/leaderboard"); close(); },
      },
      {
        id: "nav-watchlist",
        label: "Watchlist",
        category: "Navigation",
        icon: Star,
        keywords: ["favorites", "watch", "saved coins"],
        action: () => { router.push("/watchlist"); close(); },
      },
      {
        id: "nav-alerts",
        label: "Price Alerts",
        category: "Navigation",
        icon: Bell,
        keywords: ["notifications", "price alerts", "triggers"],
        action: () => { router.push("/alerts"); close(); },
      },
      {
        id: "nav-news",
        label: "News",
        category: "Navigation",
        icon: Newspaper,
        keywords: ["crypto news", "articles", "blog"],
        action: () => { router.push("/news"); close(); },
      },
      {
        id: "nav-learn",
        label: "Learn — How to Trade",
        category: "Navigation",
        icon: BookOpen,
        keywords: ["tutorial", "education", "guide", "learn", "how to"],
        action: () => { router.push("/learn/how-to-trade"); close(); },
      },
      {
        id: "nav-quests",
        label: "Quests",
        category: "Navigation",
        icon: Zap,
        keywords: ["missions", "challenges", "xp", "quests"],
        action: () => { router.push("/quests"); close(); },
      },
      {
        id: "nav-referral",
        label: "Referral Program",
        category: "Navigation",
        icon: Gift,
        keywords: ["refer", "invite", "friends", "bonus"],
        action: () => { router.push("/referral"); close(); },
      },
      // ── Settings ──
      {
        id: "settings-main",
        label: "Settings",
        category: "Settings",
        icon: Settings,
        keywords: ["preferences", "account", "profile", "config"],
        action: () => { router.push("/settings"); close(); },
      },
      {
        id: "settings-profile",
        label: "Profile Settings",
        category: "Settings",
        icon: User,
        keywords: ["avatar", "username", "account", "profile"],
        action: () => { router.push("/settings?tab=profile"); close(); },
      },
      {
        id: "settings-language",
        label: "Language & Region",
        category: "Settings",
        icon: Globe,
        keywords: ["language", "locale", "region", "i18n"],
        action: () => { router.push("/settings?tab=preferences"); close(); },
      },
      // ── Actions ──
      {
        id: "action-spin",
        label: "Open Spin Wheel",
        category: "Actions",
        icon: Zap,
        keywords: ["spin", "wheel", "bonus", "reward", "vusdt"],
        action: () => {
          close();
          // Dispatch a custom event that SpinModal or layout can listen to
          window.dispatchEvent(new CustomEvent("crySer:openSpin"));
        },
      },
      {
        id: "action-profile",
        label: "Go to My Profile",
        category: "Actions",
        icon: User,
        keywords: ["profile", "me", "account", "user"],
        action: () => { router.push("/settings"); close(); },
      },
    ],
    [router, close]
  );

  // ─── Filtered + sorted results ──────────────────────────────────────────────

  const results = useMemo(() => {
    return ALL_COMMANDS
      .map((cmd) => ({ cmd, score: matchCommand(cmd, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ cmd }) => cmd);
  }, [ALL_COMMANDS, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // ─── Global Ctrl+K / ⌘K listener ──────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === "k") {
        e.preventDefault();
        // Toggle open
        if (isOpen) {
          close();
        } else {
          // Dispatch open through context isn't directly accessible here,
          // so we fire a custom event that the provider wrapper catches.
          window.dispatchEvent(new CustomEvent("crySer:openCommandPalette"));
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // ─── Arrow / Enter key nav inside palette ─────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        results[selectedIndex]?.action();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, results, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Focus input when opened; reset state when closed
  useEffect(() => {
    if (isOpen) {
      // Small delay so the animation has started before focus
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // ─── Group results by category ────────────────────────────────────────────

  const grouped = useMemo(() => {
    const map = new Map<CommandCategory, Command[]>();
    for (const cmd of results) {
      const arr = map.get(cmd.category) ?? [];
      arr.push(cmd);
      map.set(cmd.category, arr);
    }
    return map;
  }, [results]);

  // Flat ordered list for index tracking
  const flatResults = results;

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => {
        // Close when clicking the backdrop (not the palette itself)
        if (e.target === e.currentTarget) close();
      }}
      aria-label="Command palette backdrop"
    >
      {/* Palette container */}
      <div
        className="w-full max-w-[580px] rounded-xl border shadow-2xl overflow-hidden animate-scaleIn"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--border))",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input row */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <Search
            size={18}
            className="flex-shrink-0"
            style={{ color: "hsl(var(--muted-foreground))" }}
          />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 outline-none ring-0 text-sm placeholder:text-muted-foreground"
            style={{
              color: "hsl(var(--foreground))",
              fontSize: "0.9375rem",
              minHeight: "unset",
            }}
            placeholder="Search commands, pages, coins..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Command search"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{
              background: "hsl(var(--muted))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        {flatResults.length === 0 ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <ul
            ref={listRef}
            className="max-h-[380px] overflow-y-auto py-2"
            role="listbox"
            aria-label="Command results"
          >
            {Array.from(grouped.entries()).map(([category, cmds]) => (
              <li key={category} role="presentation">
                {/* Category header — only shown when not filtering */}
                {!query.trim() && (
                  <div
                    className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest select-none"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {category}
                  </div>
                )}
                <ul role="group" aria-label={category}>
                  {cmds.map((cmd) => {
                    const globalIdx = flatResults.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <li
                        key={cmd.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        onClick={() => cmd.action()}
                        className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors duration-100 select-none"
                        style={{
                          background: isSelected
                            ? "hsl(var(--muted))"
                            : "transparent",
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: isSelected
                              ? "hsl(var(--primary)/0.15)"
                              : "hsl(var(--muted))",
                          }}
                        >
                          <Icon
                            size={15}
                            style={{
                              color: isSelected
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted-foreground))",
                            }}
                          />
                        </div>

                        {/* Label */}
                        <span
                          className="flex-1 text-sm font-medium truncate"
                          style={{
                            color: isSelected
                              ? "hsl(var(--foreground))"
                              : "hsl(var(--foreground))",
                          }}
                        >
                          {cmd.label}
                        </span>

                        {/* Category badge — shown while filtering */}
                        {query.trim() && (
                          <span
                            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${CATEGORY_COLOR[cmd.category]}`}
                          >
                            {cmd.category}
                          </span>
                        )}

                        {/* Arrow indicator on selected */}
                        {isSelected && (
                          <ChevronRight
                            size={14}
                            style={{ color: "hsl(var(--primary))" }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}

        {/* Footer hint */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-t text-[11px] select-none"
          style={{
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--muted-foreground))",
            background: "hsl(var(--muted)/0.3)",
          }}
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>↑</kbd>
            <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>ESC</kbd>
            close
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>Ctrl K</kbd>
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}
