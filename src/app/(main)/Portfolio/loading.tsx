export default function PortfolioLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header skeleton */}
      <div className="mb-2">
        <div className="h-2.5 w-28 rounded skeleton mb-4" />
        <div className="h-12 w-80 rounded skeleton mb-2" />
        <div className="h-3 w-48 rounded skeleton" />
      </div>

      {/* Hero value + buttons */}
      <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="h-2.5 w-36 rounded skeleton" />
          <div className="h-14 w-64 rounded skeleton" />
          <div className="flex items-center gap-3 pt-1">
            <div className="h-4 w-28 rounded skeleton" />
            <div className="h-3 w-36 rounded skeleton" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-32 rounded-md skeleton" />
          <div className="h-12 w-32 rounded-md skeleton" />
        </div>
      </div>

      {/* Equity curve placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-3 w-32 rounded skeleton mb-4" />
        <div className="h-48 w-full rounded-lg skeleton" />
      </div>

      {/* Risk analytics placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-3 w-40 rounded skeleton mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-2.5 w-20 rounded skeleton" />
              <div className="h-6 w-24 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* 12-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Holdings table — 8 cols */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="h-4 w-32 rounded skeleton" />
            <div className="h-8 w-36 rounded-full skeleton" />
          </div>
          {/* Header */}
          <div className="flex items-center gap-6 px-6 py-4 border-b border-border">
            {[120, 90, 90, 120, 60].map((w, i) => (
              <div key={i} className="h-2.5 rounded skeleton" style={{ width: w }} />
            ))}
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 4 }).map((_, r) => (
            <div key={r} className="flex items-center gap-6 px-6 border-b border-border/50" style={{ height: 72 }}>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-14 rounded skeleton" />
                  <div className="h-2 w-20 rounded skeleton" />
                </div>
              </div>
              <div className="h-3 w-20 rounded skeleton ml-auto" />
              <div className="flex flex-col gap-1 items-end">
                <div className="h-3 w-20 rounded skeleton" />
                <div className="h-2 w-12 rounded skeleton" />
              </div>
              <div className="w-28 flex flex-col gap-1">
                <div className="h-1.5 w-full rounded-full skeleton" />
                <div className="h-2 w-8 rounded skeleton ml-auto" />
              </div>
              <div className="h-3 w-10 rounded skeleton" />
            </div>
          ))}
        </div>

        {/* Right panel — 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Performance summary card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded skeleton" />
              <div className="h-3 w-12 rounded skeleton" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-28 rounded skeleton" />
              <div className="h-8 w-36 rounded skeleton" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 rounded skeleton" />
              <div className="h-6 w-24 rounded skeleton" />
            </div>
            <div
              className="grid grid-cols-2 gap-3 pt-1 border-t border-border"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-2.5 w-24 rounded skeleton" />
                  <div className="h-4 w-16 rounded skeleton" />
                </div>
              ))}
            </div>
          </div>

          {/* Allocation donut card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5 flex-1">
            <div className="h-4 w-24 rounded skeleton" />
            <div className="flex flex-row items-center gap-6">
              <div className="w-44 h-44 rounded-full skeleton flex-shrink-0" />
              <div className="space-y-3 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm skeleton flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      <div className="h-3 rounded skeleton" style={{ width: 60 + i * 10 }} />
                      <div className="h-2 w-10 rounded skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity ledger */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-36 rounded skeleton" />
          <div className="h-8 w-24 rounded-md skeleton" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-8 px-8 py-4 bg-muted/20 border-b border-border">
            {[110, 60, 120, 100, 80].map((w, i) => (
              <div key={i} className="h-2.5 rounded skeleton" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, r) => (
            <div key={r} className="flex items-center gap-8 px-8 border-b border-border/50" style={{ height: 80 }}>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full skeleton" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-10 rounded skeleton" />
                  <div className="h-2 w-14 rounded skeleton" />
                </div>
              </div>
              <div className="h-3 w-16 rounded skeleton" />
              <div className="h-3 w-28 rounded skeleton" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-2 w-16 rounded skeleton" />
              </div>
              <div className="ml-auto flex flex-col items-end gap-1.5">
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-2 w-16 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
