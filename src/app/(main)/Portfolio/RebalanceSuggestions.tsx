"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Suggestion {
  symbol: string;
  currentPct: number;
  action: "reduce" | "consolidate" | "ok";
  message: string;
}

interface RebalanceData {
  suggestions: Suggestion[];
  topHeavy: boolean;
}

export default function RebalanceSuggestions() {
  const [data, setData] = useState<RebalanceData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio/rebalance", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: RebalanceData | null) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  // Only show if there are non-ok suggestions or the portfolio is top-heavy
  const actionable =
    data &&
    (data.topHeavy || data.suggestions.some((s) => s.action !== "ok"));

  if (!data || !actionable || dismissed) return null;

  const nonOk = data.suggestions.filter((s) => s.action !== "ok");

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-amber-300">
            Rebalancing Suggestion
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-400 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="flex flex-col gap-1.5">
        {nonOk.map((s) => (
          <li key={s.symbol} className="flex items-start gap-2 text-sm">
            <span
              className="font-semibold text-amber-200 flex-shrink-0 w-20 truncate"
              title={s.symbol}
            >
              {s.symbol}
            </span>
            <span className="text-amber-100/70">{s.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
