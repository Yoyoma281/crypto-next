'use client';

import { useI18n } from '@/lib/i18n';
import AuthRequired from '@/components/auth-required';

export default function HistoryAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthRequired
      title={t.history.signIn}
      description={t.history.signInSubtitle}
    />
  );
}
