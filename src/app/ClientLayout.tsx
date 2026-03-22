'use client';

import { usePathname } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";
import { I18nProvider } from "@/lib/i18n";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <I18nProvider>
      {!isLoginPage && (
        <>
          <TopBarStats />
          <TickerBar />
        </>
      )}
      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </I18nProvider>
  );
}
