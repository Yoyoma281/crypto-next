'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { links } from "./data/links";
import { Footer } from "./components/footer";
import TopBarStats from "./components/top-section";
import { Roboto } from 'next/font/google';
import NewsTicker from "./components/fading-text";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const robotto = Roboto({
  variable: "--font-robotto-sans",
  subsets: ["latin"],
  weight: "400",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const headlines = [
    "Bitcoin hits $30,000",
    "Ethereum 2.0 upgrade completed",
    "Ripple wins court case against SEC",
    "Binance launches new trading platform",
    "Coinbase adds support for new altcoin",
  ];
  console.log(pathname)
  const isLoginPage = pathname === "/login";

  return (
    <html>
      <body>


        <div
          className={`${geistSans.variable} ${geistMono.variable} ${robotto.variable} font-geist antialiased max-w-screen-xl mx-auto px-4`}
        >
          {!isLoginPage && (
            <>
              <TopBarStats />
              <NewsTicker headlines={headlines} speed={30} />
              <Navbar links={links} />
            </>
          )}

          {children}

          {!isLoginPage && <Footer />}
        </div>
      </body>
    </html>
  );
}
