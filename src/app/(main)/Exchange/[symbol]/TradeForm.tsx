"use client";

import { useCallback, useEffect, useState } from "react";
// price comes from TradingClient's WebSocket via prop — no REST polling needed
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Coin {
  symbol: string;
  amount: string;
}

export default function TradeForm({
  symbol,
  livePrice,
}: {
  symbol: string;
  livePrice?: string | null;
}) {
  const { t } = useI18n();
  const ticker = symbol.replace("USDT", "");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const price = livePrice ? parseFloat(livePrice) : null;
  const [usdtBal, setUsdtBal] = useState(0);
  const [coinBal, setCoinBal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text?: string; filledAmount?: string; filledTotal?: string } | null>(null);
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = unknown

  useEffect(() => {
    if (!msg?.ok) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  const refreshBalance = useCallback(() => {
    fetch("/api/portfolio")
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setIsAuth(false);
          return null;
        }
        setIsAuth(true);
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const coins: Coin[] = data?.portfolio?.Coins ?? [];
        const usdt = coins.find((c) => c.symbol === "USD/USDT");
        const coin = coins.find((c) => c.symbol === symbol);
        setUsdtBal(parseFloat(usdt?.amount ?? "0"));
        setCoinBal(parseFloat(coin?.amount ?? "0"));
      })
      .catch(() => setIsAuth(false));
  }, [symbol]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const coinAmount = parseFloat(amount) || 0;
  const total = price ? (coinAmount * price).toFixed(2) : "—";

  const setPercent = (pct: number) => {
    if (!price) return;
    const base = side === "BUY" ? usdtBal / price : coinBal;
    setAmount(((base * pct) / 100).toFixed(6));
  };

  const handleTrade = async () => {
    if (!coinAmount || !price) return;
    setLoading(true);
    setMsg(null);

    const usdtAmount = (coinAmount * price).toString();

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSymbol: symbol,
          paymentSymbol: "USD/USDT",
          paymentAmount: parseFloat(usdtAmount),
          type: side,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ ok: true, filledAmount: coinAmount.toFixed(6), filledTotal: parseFloat(usdtAmount).toFixed(2) });
        setAmount("");
        refreshBalance();
      } else {
        setMsg({ ok: false, text: data.error ?? "Trade failed" });
      }
    } catch {
      setMsg({ ok: false, text: t.trading.networkError });
    }

    setLoading(false);
  };

  const activeColor = side === "BUY" ? "#4edea3" : "#ffb3ad";

  // Guest view — locked
  if (isAuth === false) {
    return (
      <div className="p-6 flex flex-col gap-4">
        {/* Tab preview (disabled) */}
        <div className="flex rounded-md overflow-hidden border opacity-40 pointer-events-none select-none" style={{ borderColor: "#2e3447" }}>
          <div
            className="flex-1 py-2.5 text-sm font-semibold text-center"
            style={{ background: "#4edea3", color: "#003824" }}
          >
            {t.trading.buy} {ticker}
          </div>
          <div className="flex-1 py-2.5 text-sm font-semibold text-center" style={{ background: "#2e3447", color: "#909097" }}>
            {t.trading.sell} {ticker}
          </div>
        </div>

        {/* Lock card */}
        <div
          className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border text-center"
          style={{
            background: "rgba(78,222,163,0.08)",
            borderColor: "rgba(78,222,163,0.25)",
          }}
        >
          <div className="text-3xl">🔒</div>
          <div>
            <p className="font-semibold text-sm text-[#dce1fb]">
              {t.trading.signUpToTrade}
            </p>
            <p className="text-xs text-[#909097] mt-1">
              {t.trading.getVirtualFunds}
            </p>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <Link
              href="/signup"
              className="flex-1 py-2 rounded-md text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
              style={{ background: "#4edea3", color: "#003824" }}
            >
              {t.trading.signUpFree}
            </Link>
            <Link
              href="/login"
              className="flex-1 py-2 rounded-md text-sm font-semibold border transition-colors text-center"
              style={{ borderColor: "#2e3447", color: "#dce1fb" }}
            >
              {t.trading.logIn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "#2e3447" }}>
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSide(s);
              setAmount("");
              setMsg(null);
            }}
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={
              side === s
                ? {
                    background: s === "BUY" ? "#4edea3" : "#ffb3ad",
                    color: s === "BUY" ? "#003824" : "#410004",
                  }
                : { background: "#2e3447", color: "#909097" }
            }
          >
            {s === "BUY"
              ? `${t.trading.buy} ${ticker}`
              : `${t.trading.sell} ${ticker}`}
          </button>
        ))}
      </div>

      {/* Balance & price info row */}
      <div className="flex justify-between text-xs">
        <span style={{ color: "#909097" }}>
          {t.trading.available + ":"}{" "}
          <span className="text-[#dce1fb] font-medium">
            {side === "BUY"
              ? `$${usdtBal.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`
              : `${coinBal.toFixed(6)} ${ticker}`}
          </span>
        </span>
        <span style={{ color: "#909097" }}>
          {t.trading.price + ":"}{" "}
          <span className="text-[#dce1fb] font-medium">
            {price
              ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "…"}
          </span>
        </span>
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-xs text-[#909097] mb-2 font-semibold uppercase tracking-widest">
          Amount ({ticker})
        </label>
        <div className="flex items-center rounded-md overflow-hidden border" style={{ borderColor: "#2e3447", background: "#0c1324" }}>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-[#dce1fb] placeholder:text-[#45464d]"
          />
          <span className="px-4 text-xs text-[#909097] border-l py-2.5" style={{ borderColor: "#2e3447" }}>
            {ticker}
          </span>
        </div>
      </div>

      {/* Quick % */}
      <div className="flex gap-2">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => setPercent(pct)}
            className="flex-1 py-2 text-[11px] border rounded-md font-semibold transition-colors"
            style={{ 
              borderColor: "#2e3447", 
              color: "#c6c6cd",
              background: "#0c1324"
            }}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between text-xs border-t pt-3" style={{ borderColor: "#2e3447", color: "#909097" }}>
        <span>{t.trading.estTotal}</span>
        <span className="text-[#dce1fb] font-semibold">${total} USDT</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={loading || !coinAmount || !price}
        className="w-full py-3 rounded-md text-sm font-bold text-white transition-opacity disabled:opacity-40"
        style={{ background: activeColor, color: activeColor === "#4edea3" ? "#003824" : "#410004" }}
      >
        {loading
          ? t.trading.processing
          : side === "BUY"
            ? `${t.trading.buy} ${ticker}`
            : `${t.trading.sell} ${ticker}`}
      </button>

      {/* Feedback */}
      {msg && (
        <div
          className="rounded-md overflow-hidden animate-tradeFill"
          style={{
            background: msg.ok ? "rgba(78,222,163,0.12)" : "rgba(255,179,173,0.12)",
            border: `1px solid ${msg.ok ? "rgba(78,222,163,0.35)" : "rgba(255,179,173,0.35)"}`,
            boxShadow: msg.ok ? "0 0 24px rgba(78,222,163,0.15)" : "0 0 16px rgba(255,179,173,0.1)",
          }}
        >
          {msg.ok ? (
            <div className="flex flex-col items-center gap-2 py-4 px-4 text-center">
              <span className="text-2xl leading-none">✅</span>
              <span className="font-bold text-sm" style={{ color: "#4edea3" }}>
                {side === "BUY" ? "Buy" : "Sell"} order filled!
              </span>
              {msg.filledAmount && (
                <span className="text-xs" style={{ color: "#909097" }}>
                  {msg.filledAmount} {ticker} · ${msg.filledTotal} USDT
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-center py-3 px-4 font-medium" style={{ color: "#ffb3ad" }}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
