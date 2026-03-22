'use client';

import { useI18n } from '@/lib/i18n';
import AuthRequired from '@/components/auth-required';

export default function PortfolioAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthRequired
      title={t.portfolio.signIn}
      description={t.portfolio.signInSubtitle}
    />
  );
}
