'use client';

import { useI18n } from '@/lib/i18n';
import AuthRequired from '@/components/auth-required';

export default function LeaderboardAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthRequired
      title={t.leaderboard.signIn}
      description={t.leaderboard.signInSubtitle}
    />
  );
}
