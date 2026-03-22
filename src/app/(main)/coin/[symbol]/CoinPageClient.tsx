'use client';

import { useSearchParams } from 'next/navigation';
import CoinTabHeader from './CoinTabHeader';
import CoinInfoTab from './CoinInfoTab';
import dynamic from 'next/dynamic';

const TradingClient = dynamic(
  () => import('@/app/(main)/Exchange/[symbol]/TradingClient'),
  { ssr: false }
);

export default function CoinPageClient({ symbol }: { symbol: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';

  return (
    <div className="flex flex-col">
      <CoinTabHeader symbol={symbol} />
      {tab === 'trade' ? (
        <TradingClient symbol={symbol} hiddenHeader />
      ) : (
        <CoinInfoTab symbol={symbol} />
      )}
    </div>
  );
}
