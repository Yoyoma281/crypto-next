"use client";

import { useState, useRef, useEffect } from "react";
import { Bitcoin, TrendingUp, ShieldCheck, Zap, Wallet } from "lucide-react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import Link from "next/link";

const COINS = [
  { symbol: "BTC", color: "#f7931a", bg: "rgba(247,147,26,0.15)", delay: "0s" },
  {
    symbol: "ETH",
    color: "#627eea",
    bg: "rgba(98,126,234,0.15)",
    delay: "0.4s",
  },
  {
    symbol: "SOL",
    color: "#9945ff",
    bg: "rgba(153,69,255,0.15)",
    delay: "0.8s",
  },
  {
    symbol: "BNB",
    color: "#f3ba2f",
    bg: "rgba(243,186,47,0.15)",
    delay: "0.2s",
  },
  {
    symbol: "XRP",
    color: "#00aae4",
    bg: "rgba(0,170,228,0.15)",
    delay: "0.6s",
  },
  {
    symbol: "DOGE",
    color: "#c2a633",
    bg: "rgba(194,166,51,0.15)",
    delay: "0.3s",
  },
  { symbol: "ADA", color: "#0033ad", bg: "rgba(0,51,173,0.2)", delay: "1.0s" },
  {
    symbol: "AVAX",
    color: "#e84142",
    bg: "rgba(232,65,66,0.15)",
    delay: "0.7s",
  },
  {
    symbol: "LINK",
    color: "#2a5ada",
    bg: "rgba(42,90,218,0.15)",
    delay: "0.5s",
  },
];

const PERKS = [
  { icon: Wallet, color: "#4edea3", text: "$1,000 virtual USDT on signup" },
  {
    icon: TrendingUp,
    color: "#4edea3",
    text: "Live Binance prices, 400+ pairs",
  },
  { icon: Zap, color: "#b9c7e0", text: "Professional charts & order book" },
  {
    icon: ShieldCheck,
    color: "#4edea3",
    text: "No real money — 100% risk free",
  },
];

type Mode = "login" | "signup";

export default function AuthPage({ initial }: { initial: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [animating, setAnimating] = useState(false);
  // direction: 1 = slide left (login→signup), -1 = slide right (signup→login)
  const [dir, setDir] = useState<1 | -1>(1);
  const [visible, setVisible] = useState(true);
  const pendingMode = useRef<Mode>(initial);

  function switchTo(next: Mode) {
    if (next === mode || animating) return;
    pendingMode.current = next;
    const newDir = next === "signup" ? 1 : -1;
    setDir(newDir);
    setAnimating(true);
    setVisible(false); // slide out
  }

  // After slide-out, swap content, then slide in
  useEffect(() => {
    if (!animating) return;
    if (visible) return; // still fading out — wait
    const t = setTimeout(() => {
      setMode(pendingMode.current);
      setVisible(true); // slide in
      setTimeout(() => setAnimating(false), 350);
    }, 280);
    return () => clearTimeout(t);
  }, [animating, visible]);

  const slideOutStyle: React.CSSProperties = {
    transition: "opacity 280ms ease, transform 280ms ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : `translateX(${dir * -28}px)`,
  };

  const slideInStyle: React.CSSProperties = {
    transition: visible ? "opacity 350ms ease, transform 350ms ease" : "none",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : `translateX(${dir * 28}px)`,
  };

  const panelStyle = animating && !visible ? slideOutStyle : slideInStyle;

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* ── Branded panel (left for login, right for signup) ── */}
      <div
        className={`hidden lg:flex flex-col justify-between shrink-0 p-10 relative overflow-hidden
          ${isLogin ? "w-[480px] order-first" : "w-[440px] order-last rounded-2xl my-6 mr-4"}`}
        style={{
          background:
            "linear-gradient(160deg, #070d1a 0%, #0d1a2e 60%, #091420 100%)",
          transition: "width 400ms ease",
        }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-[-80px] left-[-80px] h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, #4edea3, transparent)`,
          }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] h-52 w-52 rounded-full opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle, #4edea3, transparent)`,
          }}
        />

        {/* Brand */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            CrySer
          </span>
        </div>

        {/* Coin grid */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="grid grid-cols-3 gap-4">
            {COINS.slice(0, isLogin ? 9 : 6).map((c) => (
              <div
                key={c.symbol}
                className="float-coin flex flex-col items-center gap-1.5"
                style={{ animationDelay: c.delay }}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-xs font-bold border"
                  style={{
                    background: c.bg,
                    borderColor: c.color + "40",
                    color: c.color,
                    boxShadow: `0 4px 20px ${c.color}20`,
                  }}
                >
                  {c.symbol}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold leading-snug">
              {isLogin ? (
                <>
                  Practice trading with
                  <br />
                  real market data
                </>
              ) : (
                "Start trading in seconds"
              )}
            </p>
            <p className="text-white/50 text-sm mt-1.5">
              {isLogin
                ? "Paper trading — 100% risk free"
                : "No deposit. No credit card. No risk."}
            </p>
          </div>
        </div>

        {/* Perks */}
        <div className="relative z-10 flex flex-col gap-3">
          {PERKS.map(({ icon: Icon, color, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: color + "18" }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="text-white/70 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm" style={panelStyle}>
          {/* Mobile brand */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bitcoin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base">CrySer</span>
          </div>

          {/* Toggle tabs */}
          <div
            className="flex rounded-lg p-0.5 mb-6"
            style={{ background: "hsl(var(--muted))" }}
          >
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchTo(m)}
                className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                style={
                  mode === m
                    ? {
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }
                    : { color: "hsl(var(--muted-foreground))" }
                }
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Animated form */}
          {mode === "login" ? (
            <LoginForm onSwitchToSignup={() => switchTo("signup")} focusFirst />
          ) : (
            <SignupForm onSwitchToLogin={() => switchTo("login")} focusFirst />
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing you agree to our{" "}
            <Link
              href="/legal/terms"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
