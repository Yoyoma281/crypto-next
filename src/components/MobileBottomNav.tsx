'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart2, Briefcase, Users, Settings } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Market', icon: TrendingUp, matchPrefix: false },
  { href: '/Exchange/BTC_USDT', label: 'Trade', icon: BarChart2, matchPrefix: true, prefixMatch: '/Exchange/' },
  { href: '/Portfolio', label: 'Portfolio', icon: Briefcase, matchPrefix: true },
  { href: '/feed', label: 'Social', icon: Users, matchPrefix: true },
  { href: '/settings', label: 'Profile', icon: Settings, matchPrefix: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(tab: typeof TABS[number]): boolean {
    if (tab.prefixMatch) {
      return pathname.startsWith(tab.prefixMatch);
    }
    if (tab.matchPrefix) {
      return pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
    }
    return pathname === tab.href;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex"
      style={{
        background: '#0f0f18',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors"
            style={{ color: active ? '#4edea3' : '#45464d' }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
