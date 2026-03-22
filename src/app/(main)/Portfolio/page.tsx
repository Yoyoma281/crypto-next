import { fetchPortfolio, fetchPortfolioAnalytics, fetchUserSafe } from "@/app/data/services";
import PortfolioLiveClient from "./PortfolioLiveClient";
import AuthRequired from "@/components/auth-required";

export default async function Page() {
  const user = await fetchUserSafe();
  if (!user) {
    return (
      <AuthRequired
        title="Sign in to view your portfolio"
        description="Your holdings, live valuations, and P&L are all waiting for you."
      />
    );
  }

  const [res, analyticsRes] = await Promise.all([
    fetchPortfolio(),
    fetchPortfolioAnalytics(),
  ]);

  const initialCoins = res?.portfolio?.Coins ?? [];
  const initialBalance = res?.portfolio?.AvailableBalance ?? 0;
  const costBasis = analyticsRes?.costBasis ?? {};

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">My Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Track your crypto holdings and performance
        </p>
      </div>

      {res ? (
        <PortfolioLiveClient
          initialCoins={initialCoins}
          initialBalance={initialBalance}
          costBasis={costBasis}
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
