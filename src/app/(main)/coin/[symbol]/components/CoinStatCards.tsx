export interface StatCard {
  label: string;
  value: string;
  sub?: string | null;
  /** true = green  |  false = red  |  null/undefined = muted */
  up?: boolean | null;
}

interface CoinStatCardsProps {
  stats: StatCard[];
}

export default function CoinStatCards({ stats }: CoinStatCardsProps) {
  return (
    <div
      className="rounded-xl mb-8 overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
      }}
    >
      {/* Header bar */}
      <div
        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        style={{
          borderBottom: "1px solid hsl(var(--border))",
          background: "hsl(var(--muted)/0.3)",
        }}
      >
        Key Statistics
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y divide-border">
        {stats.map((s) => {
          const subColor =
            s.up === true
              ? "#4edea3"
              : s.up === false
                ? "#ffb3ad"
                : "hsl(var(--muted-foreground))";
          const subBg =
            s.up === true
              ? "rgba(22,199,132,0.1)"
              : s.up === false
                ? "rgba(234,57,67,0.1)"
                : "transparent";

          return (
            <div key={s.label} className="flex flex-col gap-1 px-5 py-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {s.label}
              </span>
              <span className="text-[18px] font-bold tracking-tight">
                {s.value}
              </span>
              {s.sub && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md self-start flex items-center gap-1"
                  style={{ color: subColor, background: subBg }}
                >
                  {s.up != null && (s.up ? "▲" : "▼")} {s.sub}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
