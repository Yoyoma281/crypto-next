import { Suspense } from "react";
import CoinPageClient from "./CoinPageClient";

type PageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function CoinPage({ params }: PageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return (
    <Suspense>
      <CoinPageClient symbol={upperSymbol} />
    </Suspense>
  );
}
