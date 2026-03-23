'use client';

import { useI18n } from '@/lib/i18n';

interface Trade {
  _id: string;
  createdAt: string;
  symbol: string;
  type: string;
  price: string | number;
  usdAmount: string | number;
  coinAmount: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtUSD(n: string | number) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCoin(n: string) {
  const num = parseFloat(n);
  if (num === 0) return '0';
  if (num < 0.0001) return num.toExponential(4);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

export default function HistoryContent({ trades }: { trades: Trade[] }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">{t.history.title}</h1>
        <p className="text-sm text-muted-foreground">{t.history.subtitle}</p>
      </div>

      {trades.length === 0 ? (
        <div
          className="rounded-xl px-6 py-16 text-center text-muted-foreground text-sm"
          style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          {t.history.noTrades}{' '}
          <a href="/coin/BTCUSDT?tab=trade" className="underline hover:text-foreground">
            {t.history.goToExchange}
          </a>{' '}
          {t.history.firstTrade}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ borderBottom: '1px solid hsl(var(--border))' }}
              >
                <th className="text-left px-5 py-3">{t.history.date}</th>
                <th className="text-left px-5 py-3">{t.history.pair}</th>
                <th className="text-left px-5 py-3">{t.history.type}</th>
                <th className="text-right px-5 py-3">{t.history.price}</th>
                <th className="text-right px-5 py-3">{t.history.amountUsdt}</th>
                <th className="text-right px-5 py-3">{t.history.quantity}</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr
                  key={trade._id}
                  className="transition-colors hover:bg-muted/40"
                  style={i < trades.length - 1 ? { borderBottom: '1px solid hsl(var(--border))' } : {}}
                >
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {fmtDate(trade.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold">
                    <a href={`/coin/${trade.symbol}?tab=trade`} className="hover:underline">
                      {trade.symbol.replace('USDT', '/USDT')}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        color: trade.type === 'BUY' ? '#4edea3' : '#ffb3ad',
                        background: trade.type === 'BUY' ? 'rgba(78,222,163,0.1)' : 'rgba(255,179,173,0.1)',
                      }}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">{fmtUSD(trade.price)}</td>
                  <td className="px-5 py-3.5 text-right font-mono">{fmtUSD(trade.usdAmount)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted-foreground">
                    {fmtCoin(trade.coinAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{t.history.showing}</p>
    </div>
  );
}
