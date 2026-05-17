export default function HistoryLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-7 w-40 rounded skeleton mb-2" />
          <div className="h-3 w-64 rounded skeleton" />
        </div>
        <div className="h-8 w-28 rounded-lg skeleton shrink-0" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-36 rounded-lg skeleton" />
        <div className="h-9 w-48 rounded-lg skeleton" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/20">
          {[90, 80, 60, 90, 90, 80, 40].map((w, i) => (
            <div key={i} className="h-2.5 rounded skeleton" style={{ width: w, flexShrink: 0 }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 10 }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 px-5 border-b border-border/50"
            style={{ height: 56 }}
          >
            <div className="h-3 rounded skeleton" style={{ width: 90, flexShrink: 0 }} />
            <div className="h-3 rounded skeleton font-mono" style={{ width: 80, flexShrink: 0 }} />
            <div className="h-5 w-14 rounded-full skeleton flex-shrink-0" />
            <div className="h-3 rounded skeleton ml-auto" style={{ width: 80 }} />
            <div className="h-3 rounded skeleton" style={{ width: 80 }} />
            <div className="h-3 rounded skeleton" style={{ width: 70 }} />
            <div className="h-3 w-8 rounded skeleton flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
