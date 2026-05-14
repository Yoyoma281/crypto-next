'use client';

import { useI18n } from '@/lib/i18n';
import AuthGate from '@/components/auth-gate';
import PreviewTable, { PreviewColumn } from '@/components/preview-table';

const GREEN = '#42e09a';
const RED = '#ffb4ab';

type Row = { type: 'BUY' | 'SELL'; symbol: string; amount: string; price: string; total: string; time: string };

const COLUMNS: PreviewColumn<Row>[] = [
  {
    key: 'type', label: 'Type',
    render: (v, row) => {
      const pos = row.type === 'BUY';
      return (
        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold" style={{ background: `${pos ? GREEN : RED}18`, color: pos ? GREEN : RED }}>
          {String(v)}
        </span>
      );
    },
  },
  { key: 'symbol', label: 'Pair',   className: 'font-bold' },
  { key: 'amount', label: 'Amount', align: 'right', className: 'font-mono' },
  { key: 'price',  label: 'Price',  align: 'right', className: 'font-mono' },
  { key: 'total',  label: 'Total',  align: 'right', className: 'font-bold font-mono' },
  { key: 'time',   label: 'Time',   align: 'right', className: 'text-muted-foreground text-xs' },
];

const ROWS: Row[] = [
  { type: 'BUY',  symbol: 'BTCUSDT', amount: '0.009 BTC', price: '$51,240', total: '$461.16', time: '2h ago'  },
  { type: 'SELL', symbol: 'ETHUSDT', amount: '0.15 ETH',  price: '$1,980',  total: '$297.00', time: '5h ago'  },
  { type: 'BUY',  symbol: 'SOLUSDT', amount: '1.2 SOL',   price: '$148',    total: '$177.60', time: '1d ago'  },
  { type: 'BUY',  symbol: 'BNBUSDT', amount: '0.45 BNB',  price: '$554',    total: '$249.30', time: '2d ago'  },
  { type: 'SELL', symbol: 'BTCUSDT', amount: '0.005 BTC', price: '$52,100', total: '$260.50', time: '3d ago'  },
];

export default function HistoryAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthGate title={t.history.signIn} description={t.history.signInSubtitle}>
      <PreviewTable columns={COLUMNS} rows={ROWS} />
    </AuthGate>
  );
}
