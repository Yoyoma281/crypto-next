'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface Coin {
  symbol: string;
  amount: string;
}

export default function TradeForm({ symbol }: { symbol: string }) {
  const ticker = symbol.replace('USDT', '');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [usdtBal, setUsdtBal] = useState(0);
  const [coinBal, setCoinBal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = unknown

  // Live price ticker
  useEffect(() => {
    const fetchPrice = () =>
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        .then((r) => r.json())
        .then((d) => setPrice(parseFloat(d.price)))
        .catch(() => {});

    fetchPrice();
    const id = setInterval(fetchPrice, 3000);
    return () => clearInterval(id);
  }, [symbol]);

  const refreshBalance = useCallback(() => {
    fetch('http://localhost:3001/Portfolio', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401 || r.status === 403) { setIsAuth(false); return null; }
        setIsAuth(true);
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const coins: Coin[] = data?.portfolio?.Coins ?? [];
        const usdt = coins.find((c) => c.symbol === 'USD/USDT');
        const coin = coins.find((c) => c.symbol === symbol);
        setUsdtBal(parseFloat(usdt?.amount ?? '0'));
        setCoinBal(parseFloat(coin?.amount ?? '0'));
      })
      .catch(() => setIsAuth(false));
  }, [symbol]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const coinAmount = parseFloat(amount) || 0;
  const total = price ? (coinAmount * price).toFixed(2) : '—';

  const setPercent = (pct: number) => {
    if (!price) return;
    const base = side === 'BUY' ? usdtBal / price : coinBal;
    setAmount(((base * pct) / 100).toFixed(6));
  };

  const handleTrade = async () => {
    if (!coinAmount || !price) return;
    setLoading(true);
    setMsg(null);

    const usdtAmount = (coinAmount * price).toString();

    try {
      const res = await fetch('http://localhost:3001/Trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetSymbol: symbol,
          paymentSymbol: 'USD/USDT',
          paymentAmount: parseFloat(usdtAmount),
          type: side,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `${side} order filled!`, ok: true });
        setAmount('');
        refreshBalance();
      } else {
        setMsg({ text: data.error ?? 'Trade failed', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error', ok: false });
    }

    setLoading(false);
  };

  const activeColor = side === 'BUY' ? '#16c784' : '#ea3943';

  // Guest view — locked
  if (isAuth === false) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {/* Tab preview (disabled) */}
        <div className="flex rounded-lg overflow-hidden border border-border opacity-40 pointer-events-none select-none">
          <div className="flex-1 py-2 text-sm font-semibold text-center" style={{ background: '#16c784', color: '#fff' }}>
            Buy {ticker}
          </div>
          <div className="flex-1 py-2 text-sm font-semibold text-center text-muted-foreground">
            Sell {ticker}
          </div>
        </div>

        {/* Lock card */}
        <div
          className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border text-center"
          style={{ background: 'rgba(16,161,231,0.05)', borderColor: 'rgba(16,161,231,0.2)' }}
        >
          <div className="text-3xl">🔒</div>
          <div>
            <p className="font-semibold text-sm text-foreground">Sign up to start trading</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get <span className="text-foreground font-semibold">$1,000 USDT</span> in virtual funds instantly.
            </p>
          </div>
          <div className="flex gap-2 w-full mt-1">
            <Link
              href="/signup"
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
              style={{ background: '#10a1e7' }}
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="flex-1 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-border">
        {(['BUY', 'SELL'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setSide(s); setAmount(''); setMsg(null); }}
            className="flex-1 py-2 text-sm font-semibold transition-colors"
            style={
              side === s
                ? { background: s === 'BUY' ? '#16c784' : '#ea3943', color: '#fff' }
                : { color: 'hsl(var(--muted-foreground))' }
            }
          >
            {s === 'BUY' ? `Buy ${ticker}` : `Sell ${ticker}`}
          </button>
        ))}
      </div>

      {/* Balance & price info row */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Available:{' '}
          <span className="text-foreground font-medium">
            {side === 'BUY'
              ? `$${usdtBal.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
              : `${coinBal.toFixed(6)} ${ticker}`}
          </span>
        </span>
        <span>
          Price:{' '}
          <span className="text-foreground font-medium">
            {price
              ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '…'}
          </span>
        </span>
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Amount ({ticker})
        </label>
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/20 focus-within:border-primary transition-colors">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <span className="px-3 text-xs text-muted-foreground border-l border-border py-2">
            {ticker}
          </span>
        </div>
      </div>

      {/* Quick % */}
      <div className="flex gap-1.5">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => setPercent(pct)}
            className="flex-1 py-1 text-[11px] border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2">
        <span>Est. Total</span>
        <span className="text-foreground font-medium">${total} USDT</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={loading || !coinAmount || !price}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: activeColor }}
      >
        {loading
          ? 'Processing…'
          : side === 'BUY'
          ? `Buy ${ticker}`
          : `Sell ${ticker}`}
      </button>

      {/* Feedback */}
      {msg && (
        <div
          className="text-xs text-center py-2 rounded-lg font-medium"
          style={{
            color: msg.ok ? '#16c784' : '#ea3943',
            background: msg.ok ? 'rgba(22,199,132,0.1)' : 'rgba(234,57,67,0.1)',
          }}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
