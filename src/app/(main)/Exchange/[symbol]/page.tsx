import { Suspense } from "react";
import { use } from "react";
import TradingClient from "./TradingClient";

type Props = { params: Promise<{ symbol: string }> };

export default function TradePage({ params }: Props) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();

  return (
    <div className="flex flex-col h-screen">
      <Suspense fallback={<div className="flex-1 bg-background" />}>
        <TradingClient symbol={upperSymbol} hiddenHeader={false} />
      </Suspense>
    </div>
  );
}
