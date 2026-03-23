"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";
import { I18nProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/components/favorites-context";
import FloatingFavorites from "@/components/floating-favorites";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage  = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <I18nProvider>
      <FavoritesProvider>
        {!isLoginPage && !isSignupPage && (
          <>
            <TopBarStats />
            <TickerBar />
          </>
        )}
        <main
          key={pathname}
          className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-3 md:py-4 min-h-screen animate-page-enter"
        >
          {children}
        </main>
        {!isLoginPage && !isSignupPage && (
          <>
            <Footer />
            <FloatingFavorites />
          </>
        )}
      </FavoritesProvider>
    </I18nProvider>
  );
}
