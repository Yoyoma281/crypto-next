'use client';

import { useI18n } from '@/lib/i18n';

export default function PortfolioPageHeader({ errorOnly }: { errorOnly?: boolean }) {
  const { t } = useI18n();

  if (errorOnly) {
    return (
      <div
        className="rounded-xl px-6 py-10 text-center text-muted-foreground text-sm"
        style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
      >
        {t.portfolio.couldNotLoad}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-0.5">{t.portfolio.title}</h1>
      <p className="text-sm text-muted-foreground">{t.portfolio.subtitle}</p>
    </div>
  );
}
