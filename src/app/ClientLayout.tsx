"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";
import { I18nProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/components/favorites-context";
import { ArenaModeProvider } from "@/contexts/ArenaModeContext";
import ArenaModeBanner from "@/components/ArenaModeBanner";
import FloatingFavorites from "@/components/floating-favorites";
import OnboardingModal from "@/components/onboarding-modal";
import MobileBottomNav from "@/components/MobileBottomNav";
import CommandPalette, { CommandPaletteProvider, useCommandPaletteContext } from "@/components/CommandPalette";
import ArenaSettlementModal from "@/components/ArenaSettlementModal";
import { useEffect } from "react";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams   = useSearchParams();
  const isLoginPage    = pathname === "/login";
  const isSignupPage   = pathname === "/signup";
  const isTradePage    = pathname.startsWith("/coin/") && searchParams.get("tab") === "trade";
  const hideChrome = isLoginPage || isSignupPage;

  // Listen for the global open event dispatched by the Ctrl+K handler
  const { open } = useCommandPaletteContext();
  useEffect(() => {
    const handler = () => open();
    window.addEventListener("crySer:openCommandPalette", handler);
    return () => window.removeEventListener("crySer:openCommandPalette", handler);
  }, [open]);

  return (
    <>
      {!hideChrome && (
        <>
          <TopBarStats />
          <ArenaModeBanner />
          <TickerBar />
        </>
      )}
      <main
        key={pathname}
        className={
          isTradePage
            ? "w-full min-h-screen pb-16 md:pb-0"
            : "w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-3 md:py-4 min-h-screen animate-page-enter pb-16 md:pb-0"
        }
      >
        {children}
      </main>
      {!hideChrome && (
        <>
          <Footer />
          <FloatingFavorites />
          <OnboardingModal />
          <MobileBottomNav />
        </>
      )}
      {/* Command palette renders outside hideChrome so it works on all pages */}
      <CommandPalette />
      <ArenaSettlementModal />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ArenaModeProvider>
      <FavoritesProvider>
        <CommandPaletteProvider>
          <Suspense>
            <LayoutInner>{children}</LayoutInner>
          </Suspense>
        </CommandPaletteProvider>
      </FavoritesProvider>
      </ArenaModeProvider>
    </I18nProvider>
  );
}
