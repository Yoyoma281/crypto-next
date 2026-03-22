import { fetchPortfolio, fetchPortfolioAnalytics, fetchUserSafe } from "@/app/data/services";
import PortfolioLiveClient from "./PortfolioLiveClient";
import PortfolioAuthRequired from "./PortfolioAuthRequired";
import PortfolioPageHeader from "./PortfolioPageHeader";

export default async function Page() {
  const user = await fetchUserSafe();
  if (!user) {
    return <PortfolioAuthRequired />;
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
      <PortfolioPageHeader />

      {res ? (
        <PortfolioLiveClient
          initialCoins={initialCoins}
          initialBalance={initialBalance}
          costBasis={costBasis}
        />
      ) : (
        <PortfolioPageHeader errorOnly />
      )}
    </div>
  );
}
