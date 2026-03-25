"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";
import { I18nProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/components/favorites-context";
import FloatingFavorites from "@/components/floating-favorites";
import OnboardingModal from "@/components/onboarding-modal";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams   = useSearchParams();
  const isLoginPage    = pathname === "/login";
  const isSignupPage   = pathname === "/signup";
  const isTradePage    = pathname.startsWith("/coin/") && searchParams.get("tab") === "trade";
  const hideChrome = isLoginPage || isSignupPage;

  return (
    <I18nProvider>
      <FavoritesProvider>
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
              ? "w-full min-h-screen"
              : "w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-3 md:py-4 min-h-screen animate-page-enter"
          }
        >
          {children}
        </main>
        {!hideChrome && (
          <>
            <Footer />
            <FloatingFavorites />
            <OnboardingModal />
          </>
        )}
      </FavoritesProvider>
    </I18nProvider>
  );
}
