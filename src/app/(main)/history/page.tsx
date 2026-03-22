import { fetchTradeHistory, fetchUserSafe } from "@/app/data/services";
import AuthRequired from "@/components/auth-required";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtUSD(n: string | number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCoin(n: string) {
  const num = parseFloat(n);
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(4);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

export default async function HistoryPage() {
  const user = await fetchUserSafe();
  if (!user) {
    return (
      <AuthRequired
        title="Sign in to view your trade history"
        description="Every buy and sell you make is logged here."
      />
    );
  }

  const { trades } = await fetchTradeHistory();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">Trade History</h1>
        <p className="text-sm text-muted-foreground">
          All your executed trades — most recent first
        </p>
      </div>

      {trades.length === 0 ? (
        <div
          className="rounded-xl px-6 py-16 text-center text-muted-foreground text-sm"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          No trades yet. Head to the{" "}
          <a href="/coin/BTCUSDT?tab=trade" className="underline hover:text-foreground">
            Exchange
          </a>{" "}
          to place your first trade.
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Pair</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Amount (USDT)</th>
                <th className="text-right px-5 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr
                  key={t._id}
                  className="transition-colors hover:bg-muted/40"
                  style={i < trades.length - 1 ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
                >
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {fmtDate(t.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold">
                    <a
                      href={`/coin/${t.symbol}?tab=trade`}
                      className="hover:underline"
                    >
                      {t.symbol.replace("USDT", "/USDT")}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        color: t.type === "BUY" ? "#16c784" : "#ea3943",
                        background: t.type === "BUY" ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)",
                      }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">
                    {fmtUSD(t.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">
                    {fmtUSD(t.usdAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted-foreground">
                    {fmtCoin(t.coinAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Showing up to 200 most recent trades
      </p>
    </div>
  );
}
