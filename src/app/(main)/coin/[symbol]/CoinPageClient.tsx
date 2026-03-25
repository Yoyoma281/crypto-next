"use client";

import { useSearchParams } from "next/navigation";
import CoinInfoTab from "./CoinInfoTab";
import dynamic from "next/dynamic";

const TradingClient = dynamic(
  () => import("@/app/(main)/Exchange/[symbol]/TradingClient"),
  { ssr: false },
);

export default function CoinPageClient({ symbol }: { symbol: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";

  if (tab === "trade") {
    return <TradingClient symbol={symbol} hiddenHeader />;
  }

  return <CoinInfoTab symbol={symbol} />;
}
