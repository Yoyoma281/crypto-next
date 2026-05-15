"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";
import { I18nProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/components/favorites-context";
import FloatingFavorites from "@/components/floating-favorites";
import OnboardingModal from "@/components/onboarding-modal";
import MobileBottomNav from "@/components/MobileBottomNav";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams   = useSearchParams();
  const isLoginPage    = pathname === "/login";
  const isSignupPage   = pathname === "/signup";
  const isTradePage    = pathname.startsWith("/coin/") && searchParams.get("tab") === "trade";
  const hideChrome = isLoginPage || isSignupPage;

  return (
    <>
      {!hideChrome && (
        <>
          <TopBarStats />
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
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <FavoritesProvider>
        <Suspense>
          <LayoutInner>{children}</LayoutInner>
        </Suspense>
      </FavoritesProvider>
    </I18nProvider>
  );
}
