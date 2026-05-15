"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowLeftRight, Loader2, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvertModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

async function fetchTickerPrice(pair: string): Promise<number | null> {
  // pair should be like BTC_USDT
  try {
    const url = `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${encodeURIComponent(pair)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data: { last?: string }[] = await res.json();
    const price = parseFloat(data?.[0]?.last ?? "");
    return isFinite(price) ? price : null;
  } catch {
    return null;
  }
}

function toGatePair(symbol: string): string {
  // Accept BTCUSDT or BTC or BTC_USDT → normalize to BTC_USDT
  const s = symbol.trim().toUpperCase();
  if (s.endsWith("_USDT")) return s;
  if (s.endsWith("USDT")) return s.replace("USDT", "_USDT");
  return `${s}_USDT`;
}

function toBackendSymbol(symbol: string): string {
  // Convert BTC_USDT → BTCUSDT for backend
  return symbol.replace("_USDT", "USDT").replace("_", "");
}

function formatAmount(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";
  if (n < 0.0001) return n.toExponential(4);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConvertModal({ open, onClose }: ConvertModalProps) {
  const [fromSymbol, setFromSymbol] = useState("BTC");
  const [toSymbol, setToSymbol] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [fromPrice, setFromPrice] = useState<number | null>(null);
  const [toPrice, setToPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Fetch prices with debounce
  useEffect(() => {
    if (!open) return;
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);

    priceTimerRef.current = setTimeout(async () => {
      if (!fromSymbol.trim() || !toSymbol.trim()) return;
      setPriceLoading(true);
      const [fp, tp] = await Promise.all([
        fetchTickerPrice(toGatePair(fromSymbol)),
        fetchTickerPrice(toGatePair(toSymbol)),
      ]);
      setFromPrice(fp);
      setToPrice(tp);
      setPriceLoading(false);
    }, 600);

    return () => {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    };
  }, [fromSymbol, toSymbol, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const amountNum = parseFloat(amount);
  const usdValue = fromPrice && isFinite(amountNum) ? amountNum * fromPrice : null;
  const receiveAmount =
    usdValue !== null && toPrice && toPrice > 0 ? usdValue / toPrice : null;
  const rate =
    fromPrice && toPrice && toPrice > 0 ? fromPrice / toPrice : null;

  const fromTicker = fromSymbol.trim().toUpperCase();
  const toTicker = toSymbol.trim().toUpperCase();

  async function handleConvert() {
    if (!amountNum || amountNum <= 0 || !fromPrice) return;
    setStatus("loading");
    setErrorMsg("");

    const usdAmt = usdValue ?? 0;
    const fromBackend = toBackendSymbol(toGatePair(fromSymbol));
    const toBackend = toBackendSymbol(toGatePair(toSymbol));

    try {
      // Step 1: SELL fromSymbol for USDT
      const sellRes = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSymbol: fromBackend,
          paymentSymbol: "USD/USDT",
          paymentAmount: usdAmt,
          type: "SELL",
        }),
      });
      if (!sellRes.ok) {
        const d = await sellRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Sell failed (${sellRes.status})`);
      }

      // Step 2: BUY toSymbol with USDT
      const buyRes = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSymbol: toBackend,
          paymentSymbol: "USD/USDT",
          paymentAmount: usdAmt,
          type: "BUY",
        }),
      });
      if (!buyRes.ok) {
        const d = await buyRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Buy failed (${buyRes.status})`);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
    }
  }

  function swapCoins() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col"
        style={{
          background: "#0b1222",
          border: "1px solid #2e3447",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #1e2a3a" }}
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" style={{ color: "#4edea3" }} />
            <span className="font-bold text-sm" style={{ color: "#dce1fb" }}>
              Instant Convert
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(78,222,163,0.1)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.25)" }}
            >
              No Fee
            </span>
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
              style={{ color: "#909097" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#dce1fb"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#909097"; }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 className="h-12 w-12" style={{ color: "#4edea3" }} />
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#4edea3" }}>
                  Conversion Complete
                </p>
                <p className="text-sm mt-1" style={{ color: "#909097" }}>
                  {formatAmount(amountNum)} {fromTicker} converted to{" "}
                  {receiveAmount ? `~${formatAmount(receiveAmount)} ` : ""}{toTicker}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-semibold text-sm"
                style={{ background: "#4edea3", color: "#0c1322" }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* From field */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "#909097" }}
                >
                  From
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl overflow-hidden border"
                  style={{ borderColor: "#2e3447", background: "#0c1322" }}
                >
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent px-4 py-3 text-sm outline-none font-mono"
                    style={{ color: "#dce1fb" }}
                  />
                  <input
                    type="text"
                    value={fromSymbol}
                    onChange={(e) => setFromSymbol(e.target.value.toUpperCase())}
                    placeholder="BTC"
                    className="w-24 bg-transparent border-l px-3 py-3 text-sm font-bold outline-none text-center"
                    style={{
                      borderColor: "#2e3447",
                      color: "#4edea3",
                    }}
                  />
                </div>
                {fromPrice && (
                  <p className="text-xs mt-1 pl-1" style={{ color: "#909097" }}>
                    1 {fromTicker} = ${fromPrice.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                  </p>
                )}
              </div>

              {/* Swap button */}
              <div className="flex justify-center -my-1">
                <button
                  onClick={swapCoins}
                  className="h-9 w-9 flex items-center justify-center rounded-full transition-all"
                  style={{
                    background: "#1a2235",
                    border: "1px solid #2e3447",
                    color: "#909097",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#4edea3";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#4edea3";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#909097";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#2e3447";
                  }}
                  title="Swap coins"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* To field */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "#909097" }}
                >
                  To
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl overflow-hidden border"
                  style={{ borderColor: "#2e3447", background: "#0c1322" }}
                >
                  <div
                    className="flex-1 px-4 py-3 text-sm font-mono"
                    style={{ color: receiveAmount ? "#dce1fb" : "#3e4a5e" }}
                  >
                    {priceLoading ? (
                      <span className="animate-pulse">calculating…</span>
                    ) : receiveAmount ? (
                      `~${formatAmount(receiveAmount)}`
                    ) : (
                      "0.00"
                    )}
                  </div>
                  <input
                    type="text"
                    value={toSymbol}
                    onChange={(e) => setToSymbol(e.target.value.toUpperCase())}
                    placeholder="ETH"
                    className="w-24 bg-transparent border-l px-3 py-3 text-sm font-bold outline-none text-center"
                    style={{
                      borderColor: "#2e3447",
                      color: "#a78bfa",
                    }}
                  />
                </div>
                {toPrice && (
                  <p className="text-xs mt-1 pl-1" style={{ color: "#909097" }}>
                    1 {toTicker} = ${toPrice.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                  </p>
                )}
              </div>

              {/* Rate info */}
              {rate !== null && !priceLoading && (
                <div
                  className="rounded-lg px-4 py-2.5 text-xs flex items-center justify-between"
                  style={{ background: "#0f1a2c", border: "1px solid #1e2a3a" }}
                >
                  <span style={{ color: "#909097" }}>Current rate</span>
                  <span style={{ color: "#dce1fb", fontWeight: 600 }}>
                    1 {fromTicker} = {formatAmount(rate)} {toTicker}
                  </span>
                </div>
              )}

              {/* USD value */}
              {usdValue !== null && usdValue > 0 && (
                <div
                  className="rounded-lg px-4 py-2.5 text-xs flex items-center justify-between"
                  style={{ background: "#0f1a2c", border: "1px solid #1e2a3a" }}
                >
                  <span style={{ color: "#909097" }}>USD equivalent</span>
                  <span style={{ color: "#dce1fb", fontWeight: 600 }}>
                    ~${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div
                  className="rounded-lg px-4 py-2.5 text-xs"
                  style={{
                    background: "rgba(255,179,173,0.08)",
                    border: "1px solid rgba(255,179,173,0.25)",
                    color: "#ffb3ad",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleConvert}
                disabled={
                  status === "loading" ||
                  !amountNum ||
                  amountNum <= 0 ||
                  !fromPrice ||
                  !toPrice ||
                  priceLoading
                }
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #42e09a, #00c07e)",
                  color: "#003822",
                }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting…
                  </span>
                ) : (
                  `Convert ${fromTicker} → ${toTicker}`
                )}
              </button>

              <p className="text-center text-xs" style={{ color: "#3e4a5e" }}>
                This executes as two market orders (Sell {fromTicker} + Buy {toTicker}) at mid-price
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
