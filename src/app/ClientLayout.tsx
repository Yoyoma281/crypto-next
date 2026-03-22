'use client';

import { usePathname } from "next/navigation";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import TickerBar from "./components/TickerBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <>
          <TopBarStats />
          <TickerBar />
        </>
      )}
      <main className="p-10 max-w-screen-xl mx-auto px-4">
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}
