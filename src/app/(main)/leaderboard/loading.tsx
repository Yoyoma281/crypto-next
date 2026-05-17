export default function LeaderboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded skeleton flex-shrink-0" />
        <div>
          <div className="h-7 w-36 rounded skeleton mb-1.5" />
          <div className="h-3 w-56 rounded skeleton" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Podium skeleton */}
        <div className="flex justify-center gap-6 px-6 py-8 border-b border-border">
          {[1, 0, 2].map((height, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="h-3 w-16 rounded skeleton" />
              <div className="h-3 w-20 rounded skeleton" />
              <div
                className="w-2 rounded-full skeleton mt-1"
                style={{ height: height === 0 ? 40 : height === 1 ? 28 : 18 }}
              />
            </div>
          ))}
        </div>

        {/* Table header */}
        <div
          className="flex items-center gap-4 px-5 py-3 border-b border-border"
          style={{ background: "hsl(var(--muted)/0.2)" }}
        >
          {[32, 120, 120, 80, 60].map((w, i) => (
            <div key={i} className="h-2.5 rounded skeleton" style={{ width: w, flexShrink: 0 }} />
          ))}
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 8 }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 px-5 border-b border-border/50"
            style={{ height: 56 }}
          >
            <div className="h-5 w-7 rounded skeleton flex-shrink-0 text-center" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-28 rounded skeleton" />
              <div className="h-1.5 w-full max-w-[120px] rounded-full skeleton" />
            </div>
            <div className="h-3 w-24 rounded skeleton ml-auto font-mono" />
            <div className="h-3 w-16 rounded skeleton font-mono" />
            <div className="h-7 w-20 rounded-lg skeleton hidden md:block" />
          </div>
        ))}
      </div>

      <div className="h-3 w-64 rounded skeleton mx-auto" />
    </div>
  );
}
