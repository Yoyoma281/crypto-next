import { use } from 'react';
import TradingClient from './TradingClient';

type Props = { params: Promise<{ symbol: string }> };

export default function TradePage({ params }: Props) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();

  return (
    <div className="flex flex-col h-full -mx-4 -my-4 md:-mx-8 md:-my-8">
      <TradingClient symbol={upperSymbol} />
    </div>
  );
}
