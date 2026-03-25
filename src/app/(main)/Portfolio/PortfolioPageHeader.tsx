"use client";

import { useI18n } from "@/lib/i18n";

export default function PortfolioPageHeader({
  errorOnly,
}: {
  errorOnly?: boolean;
}) {
  const { t } = useI18n();

  if (errorOnly) {
    return (
      <div
        className="rounded-xl px-6 py-10 text-center text-muted-foreground text-sm"
        style={{
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
        }}
      >
        {t.portfolio.couldNotLoad}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">
        Wallet & Assets
      </p>
      <h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Total Portfolio Value
      </h1>
      <p className="text-sm text-muted-foreground">{t.portfolio.subtitle}</p>
    </div>
  );
}
