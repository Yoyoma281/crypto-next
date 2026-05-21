"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// price comes from TradingClient's WebSocket via prop — no REST polling needed
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import ConfettiEffect from "@/components/ConfettiEffect";
import { playSound } from "@/lib/sounds";
import { useArenaMode } from "@/contexts/ArenaModeContext";

interface Coin {
  symbol: string;
  amount: string;
}

type OrderMode = "MARKET" | "LIMIT";
type LimitOrderType = "LIMIT" | "STOP_LOSS" | "TAKE_PROFIT";

const LIMIT_ORDER_LABELS: Record<LimitOrderType, string> = {
  LIMIT: "Limit Order",
  STOP_LOSS: "Stop Loss",
  TAKE_PROFIT: "Take Profit",
};

export default function TradeForm({
  symbol,
  livePrice,
  forcedSide,
}: {
  symbol: string;
  livePrice?: string | null;
  forcedSide?: "BUY" | "SELL" | null;
}) {
  const { t } = useI18n();
  const { activeMode } = useArenaMode();
  const ticker = symbol.replace("USDT", "");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");

  useEffect(() => {
    if (forcedSide) setSide(forcedSide);
  }, [forcedSide]);
  const [amount, setAmount] = useState("");
  const price = livePrice ? parseFloat(livePrice) : null;
  const [usdtBal, setUsdtBal] = useState(0);
  const [coinBal, setCoinBal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text?: string; filledAmount?: string; filledTotal?: string; triggerPrice?: string } | null>(null);
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = unknown
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  // Track average buy price for confetti-on-profit detection
  const avgBuyPriceRef = useRef<number | null>(null);

  // Limit order state
  const [orderMode, setOrderMode] = useState<OrderMode>("MARKET");
  const [limitOrderType, setLimitOrderType] = useState<LimitOrderType>("LIMIT");
  const [triggerPrice, setTriggerPrice] = useState("");

  useEffect(() => {
    if (!msg?.ok) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  useEffect(() => {
    if (activeMode === 'arena' && orderMode === 'LIMIT') {
      setOrderMode('MARKET');
      setTriggerPrice('');
    }
  }, [activeMode, orderMode]);

  const refreshBalance = useCallback(() => {
    const endpoint = activeMode === 'arena' ? '/api/arena/portfolio' : '/api/portfolio';
    fetch(endpoint, { credentials: 'include' })
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
        if (activeMode === 'arena') {
          const coins: Coin[] = data?.coins ?? [];
          const usdt = coins.find((c) => c.symbol === 'USD/USDT');
          const coin = coins.find((c) => c.symbol === symbol) as (Coin & { avgBuyPrice?: number }) | undefined;
          setUsdtBal(parseFloat(usdt?.amount ?? '0'));
          setCoinBal(parseFloat(coin?.amount ?? '0'));
          if (coin?.avgBuyPrice) avgBuyPriceRef.current = coin.avgBuyPrice;
        } else {
          const coins: Coin[] = data?.portfolio?.Coins ?? [];
          const usdt = coins.find((c) => c.symbol === 'USD/USDT');
          const coin = coins.find((c) => c.symbol === symbol) as (Coin & { avgBuyPrice?: number }) | undefined;
          setUsdtBal(parseFloat(usdt?.amount ?? '0'));
          setCoinBal(parseFloat(coin?.amount ?? '0'));
          if (coin?.avgBuyPrice) avgBuyPriceRef.current = coin.avgBuyPrice;
        }
      })
      .catch(() => {
        // Only hide the trade form on confirmed auth failures (401/403 above).
        // Other errors (e.g. transient 500 on arena init) should not lock the UI.
        if (activeMode !== 'arena') setIsAuth(false);
      });
  }, [symbol, activeMode]);

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

    if (orderMode === "LIMIT") {
      const tp = parseFloat(triggerPrice);
      if (!tp || tp <= 0) {
        setMsg({ ok: false, text: "Please enter a valid trigger price." });
        return;
      }
    }

    setLoading(true);
    setMsg(null);

    const usdtAmount = (coinAmount * price).toString();

    try {
      if (orderMode === "MARKET") {
        const tradeEndpoint = activeMode === 'arena' ? '/api/arena/trades' : '/api/trades';
        const res = await fetch(tradeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
          playSound("fill");
          // Show confetti if SELL trade is profitable
          if (side === "SELL" && price !== null) {
            const avgBuy = avgBuyPriceRef.current;
            if (avgBuy !== null && price > avgBuy) {
              setConfettiTrigger(true);
              setTimeout(() => setConfettiTrigger(false), 100);
            }
          }
          refreshBalance();
        } else {
          setMsg({ ok: false, text: data.error ?? "Trade failed" });
        }
      } else {
        // Limit mode
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol,
            type: side,
            orderType: limitOrderType,
            triggerPrice: triggerPrice,
            paymentAmount: usdtAmount,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMsg({
            ok: true,
            filledAmount: coinAmount.toFixed(6),
            filledTotal: parseFloat(usdtAmount).toFixed(2),
            triggerPrice: parseFloat(triggerPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
          });
          setAmount("");
          setTriggerPrice("");
        } else {
          setMsg({ ok: false, text: data.error ?? "Order placement failed" });
        }
      }
    } catch {
      setMsg({ ok: false, text: t.trading.networkError });
    }

    setLoading(false);
  };

  const submitLabel = () => {
    if (loading) return t.trading.processing;
    if (orderMode === "MARKET") {
      return side === "BUY" ? `${t.trading.buy} ${ticker}` : `${t.trading.sell} ${ticker}`;
    }
    const typeLabel = LIMIT_ORDER_LABELS[limitOrderType];
    return `Place ${typeLabel}`;
  };

  // Guest view — locked
  if (isAuth === false) {
    return (
      <div className="p-6 flex flex-col gap-4">
        {/* Tab preview (disabled) */}
        <div className="flex rounded-md overflow-hidden border opacity-40 pointer-events-none select-none" style={{ borderColor: "#2e3545" }}>
          <div
            className="flex-1 py-2.5 text-sm font-semibold text-center"
            style={{ background: "#42e09a", color: "#003824" }}
          >
            {t.trading.buy} {ticker}
          </div>
          <div className="flex-1 py-2.5 text-sm font-semibold text-center" style={{ background: "#2e3545", color: "#bec8d2" }}>
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
            <p className="font-semibold text-sm text-[#dce2f7]">
              {t.trading.signUpToTrade}
            </p>
            <p className="text-xs text-[#bec8d2] mt-1">
              {t.trading.getVirtualFunds}
            </p>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <Link
              href="/signup"
              className="flex-1 py-2 rounded-md text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
              style={{ background: "#42e09a", color: "#003824" }}
            >
              {t.trading.signUpFree}
            </Link>
            <Link
              href="/login"
              className="flex-1 py-2 rounded-md text-sm font-semibold border transition-colors text-center"
              style={{ borderColor: "#2e3545", color: "#dce2f7" }}
            >
              {t.trading.logIn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-col gap-1.5">
      <ConfettiEffect trigger={confettiTrigger} />
      {/* BUY / SELL tabs */}
      <div className="flex rounded-xl overflow-hidden p-1" style={{ background: "#0c1322", border: "1px solid rgba(62,72,80,0.4)" }}>
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSide(s);
              setAmount("");
              setTriggerPrice("");
              setMsg(null);
            }}
            className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            style={
              side === s
                ? s === "BUY"
                  ? { background: "linear-gradient(135deg,#42e09a,#00c07e)", color: "#003822", boxShadow: "0 4px 20px rgba(0,192,126,0.2)" }
                  : { background: "linear-gradient(135deg,#ffb4ab,#ea3943)", color: "#410004", boxShadow: "0 4px 20px rgba(255,57,67,0.2)" }
                : { background: "transparent", color: "#bec8d2" }
            }
          >
            {s === "BUY" ? `${t.trading.buy} ${ticker}` : `${t.trading.sell} ${ticker}`}
          </button>
        ))}
      </div>

      {/* Arena mode badge */}
      {activeMode === 'arena' && (
        <div
          className="flex items-center justify-center gap-1.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest"
          style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', color: '#f5c842' }}
        >
          Arena Mode · AUSDT Wallet
        </div>
      )}

      {/* Market / Limit mode toggle — hidden in arena (limit orders not supported v1) */}
      {activeMode === 'arena' ? (
        <div
          className="flex rounded-lg overflow-hidden relative"
          style={{ background: '#0c1322', border: '1px solid rgba(62,72,80,0.4)' }}
          title="Limit orders coming soon in Arena"
        >
          <div
            className="flex-1 py-1 text-[9px] font-black uppercase tracking-widest text-center"
            style={{ background: '#2e3545', color: '#dce2f7' }}
          >
            MARKET
          </div>
          <div
            className="flex-1 py-1 text-[9px] font-black uppercase tracking-widest text-center opacity-30 cursor-not-allowed"
            style={{ color: '#bec8d2' }}
            title="Limit orders coming soon in Arena"
          >
            LIMIT
          </div>
        </div>
      ) : (
      <div className="flex rounded-lg overflow-hidden" style={{ background: "#0c1322", border: "1px solid rgba(62,72,80,0.4)" }}>
        {(["MARKET", "LIMIT"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setOrderMode(mode);
              setAmount("");
              setTriggerPrice("");
              setMsg(null);
            }}
            className="flex-1 py-1 text-[9px] font-black uppercase tracking-widest transition-all"
            style={
              orderMode === mode
                ? { background: "#2e3545", color: "#dce2f7" }
                : { background: "transparent", color: "#bec8d2" }
            }
          >
            {mode}
          </button>
        ))}
      </div>
      )}

      {/* Limit order type selector */}
      {orderMode === "LIMIT" && (
        <div>
          <label className="block text-[10px] text-[#bec8d2] mb-1 font-bold uppercase tracking-[0.15em] ml-0.5">
            Order Type
          </label>
          <div className="flex rounded-lg overflow-hidden" style={{ background: "#0c1322", border: "1px solid rgba(62,72,80,0.4)" }}>
            {(["LIMIT", "STOP_LOSS", "TAKE_PROFIT"] as const).map((ot) => (
              <button
                key={ot}
                onClick={() => setLimitOrderType(ot)}
                className="flex-1 py-1 text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap px-1"
                style={
                  limitOrderType === ot
                    ? { background: "#2e3545", color: "#dce2f7" }
                    : { background: "transparent", color: "#bec8d2" }
                }
              >
                {LIMIT_ORDER_LABELS[ot]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Balance & price info row */}
      <div className="flex justify-between text-[10px]">
        <span style={{ color: "#bec8d2" }}>
          {t.trading.available + ":"}{" "}
          <span className="text-[#dce2f7] font-medium">
            {side === "BUY"
              ? `$${usdtBal.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`
              : `${coinBal.toFixed(6)} ${ticker}`}
          </span>
        </span>
        <span style={{ color: "#bec8d2" }}>
          {t.trading.price + ":"}{" "}
          <span className="text-[#dce2f7] font-medium">
            {price
              ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "…"}
          </span>
        </span>
      </div>

      {/* Trigger Price input (Limit mode only) */}
      {orderMode === "LIMIT" && (
        <div>
          <label className="block text-[10px] text-[#bec8d2] mb-1 font-bold uppercase tracking-[0.15em] ml-0.5">
            Trigger Price (USD)
          </label>
          <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: "rgba(62,72,80,0.4)", background: "#0c1322" }}>
            <span className="px-4 text-[10px] font-black text-[#bec8d2] border-r py-1.5" style={{ borderColor: "rgba(62,72,80,0.4)" }}>
              $
            </span>
            <input
              type="number"
              min="0"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              placeholder={price ? price.toFixed(2) : "0.00"}
              className="flex-1 bg-transparent px-4 py-1.5 text-[11px] outline-none font-mono text-[#dce2f7] placeholder:text-[#3e4850]"
            />
            <span className="px-4 text-[10px] font-black text-[#bec8d2] border-l py-1.5" style={{ borderColor: "rgba(62,72,80,0.4)" }}>
              USDT
            </span>
          </div>
        </div>
      )}

      {/* Amount input */}
      <div>
        <label className="block text-[10px] text-[#bec8d2] mb-1 font-bold uppercase tracking-[0.15em] ml-0.5">
          Amount ({ticker})
        </label>
        <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: "rgba(62,72,80,0.4)", background: "#0c1322" }}>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent px-4 py-1.5 text-[11px] outline-none font-mono text-[#dce2f7] placeholder:text-[#3e4850]"
          />
          <span className="px-4 text-[10px] font-black text-[#bec8d2] border-l py-1.5" style={{ borderColor: "rgba(62,72,80,0.4)" }}>
            {ticker}
          </span>
        </div>
      </div>

      {/* Quick % */}
      <div className="flex gap-1">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => setPercent(pct)}
            className="flex-1 py-1 text-[9px] font-black rounded-lg transition-all hover:text-[#8ccdff]"
            style={{
              border: "1px solid rgba(62,72,80,0.3)",
              color: "#bec8d2",
              background: "#141b2b",
            }}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between text-xs border-t pt-2" style={{ borderColor: "#2e3545", color: "#bec8d2" }}>
        <span>{t.trading.estTotal}</span>
        <span className="text-[#dce2f7] font-semibold">${total} USDT</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={loading || !coinAmount || !price || (orderMode === "LIMIT" && !triggerPrice)}
        className="w-full py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.98] disabled:opacity-40"
        style={
          side === "BUY"
            ? { background: "linear-gradient(135deg,#42e09a,#00c07e)", color: "#003822", boxShadow: "0 10px 30px -5px rgba(0,192,126,0.3)" }
            : { background: "linear-gradient(135deg,#ffb4ab,#ea3943)", color: "#410004", boxShadow: "0 10px 30px -5px rgba(255,57,67,0.25)" }
        }
      >
        {submitLabel()}
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
            <div className="flex flex-col items-center gap-2 py-2.5 px-4 text-center">
              <span className="text-xl leading-none">✅</span>
              <span className="font-bold text-xs" style={{ color: "#42e09a" }}>
                {orderMode === "LIMIT" ? "Order placed!" : `${side === "BUY" ? "Buy" : "Sell"} order filled!`}
              </span>
              {msg.filledAmount && orderMode === "MARKET" && (
                <span className="text-xs" style={{ color: "#bec8d2" }}>
                  {msg.filledAmount} {ticker} · ${msg.filledTotal} USDT
                </span>
              )}
              {orderMode === "LIMIT" && msg.triggerPrice && (
                <span className="text-xs" style={{ color: "#bec8d2" }}>
                  {LIMIT_ORDER_LABELS[limitOrderType]} · trigger at ${msg.triggerPrice} · {msg.filledAmount} {ticker}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-center py-3 px-4 font-medium" style={{ color: "#ffb4ab" }}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
