interface Stat {
  label: string;
  value: string;
  color?: string;
}

interface StatCardsProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
}

const colClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export default function StatCards({ stats, columns = 3 }: StatCardsProps) {
  return (
    <div className={`grid ${colClass[columns]} gap-4`}>
      {stats.map((stat) => (
        <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
          <div
            className="text-xl font-bold font-mono"
            style={stat.color ? { color: stat.color } : undefined}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
