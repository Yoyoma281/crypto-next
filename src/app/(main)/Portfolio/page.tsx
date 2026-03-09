import { Button } from "@/components/ui/button";
import { fetchPortfolio } from "@/app/data/services";
import PortfolioLiveClient from "./PortfolioLiveClient";

export default async function Page() {
  const res = await fetchPortfolio();

  const initialCoins = res?.portfolio?.Coins ?? [];
  const initialBalance = res?.portfolio?.AvailableBalance ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">My Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Track your crypto holdings and performance
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm px-4">
          + Add Coin
        </Button>
      </div>

      {res ? (
        <PortfolioLiveClient
          initialCoins={initialCoins}
          initialBalance={initialBalance}
        />
      ) : (
        <div
          className="rounded-xl px-6 py-10 text-center text-muted-foreground text-sm"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          Could not load portfolio. Please log in.
        </div>
      )}
    </div>
  );
}
