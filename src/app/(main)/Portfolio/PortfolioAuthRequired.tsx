'use client';

import { useI18n } from '@/lib/i18n';
import AuthGate from '@/components/auth-gate';
import StatCards from '@/components/stat-cards';
import PreviewTable, { PreviewColumn } from '@/components/preview-table';

const GREEN = '#42e09a';
const RED = '#ffb4ab';

type Row = { symbol: string; name: string; amount: string; value: string; change: string; pnl: string; pos: boolean };

const STATS = [
  { label: 'Total Value',    value: '$2,428.00' },
  { label: 'Total P&L',     value: '+$164.70', color: GREEN },
  { label: 'Available USDT', value: '$571.00' },
];

const COLUMNS: PreviewColumn<Row>[] = [
  {
    key: 'symbol', label: 'Asset',
    render: (_, row) => (
      <div>
        <div className="font-bold text-sm">{row.symbol}</div>
        <div className="text-xs text-muted-foreground">{row.name}</div>
      </div>
    ),
  },
  { key: 'amount', label: 'Amount',  align: 'right', className: 'font-mono' },
  { key: 'value',  label: 'Value',   align: 'right', className: 'font-bold font-mono' },
  { key: 'change', label: '24h',     align: 'right', render: (v, row) => <span className="font-bold text-xs" style={{ color: row.pos ? GREEN : RED }}>{String(v)}</span> },
  { key: 'pnl',    label: 'P&L',     align: 'right', render: (v, row) => <span className="font-bold text-xs" style={{ color: row.pos ? GREEN : RED }}>{String(v)}</span> },
];

const ROWS: Row[] = [
  { symbol: 'BTC', name: 'Bitcoin',  amount: '0.018 BTC', value: '$924.00', change: '+12.4%', pnl: '+$101.50', pos: true  },
  { symbol: 'ETH', name: 'Ethereum', amount: '0.31 ETH',  value: '$621.80', change: '+8.1%',  pnl: '+$46.30',  pos: true  },
  { symbol: 'SOL', name: 'Solana',   amount: '2.4 SOL',   value: '$355.20', change: '-3.2%',  pnl: '-$11.70',  pos: false },
  { symbol: 'BNB', name: 'BNB',      amount: '0.95 BNB',  value: '$527.00', change: '+5.8%',  pnl: '+$28.90',  pos: true  },
];

export default function PortfolioAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthGate title={t.portfolio.signIn} description={t.portfolio.signInSubtitle}>
      <div className="flex flex-col gap-5">
        <StatCards stats={STATS} columns={3} />
        <PreviewTable columns={COLUMNS} rows={ROWS} />
      </div>
    </AuthGate>
  );
}
