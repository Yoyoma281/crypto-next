import { Geist, Geist_Mono, Roboto, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ClientLayout from "./ClientLayout";
import PwaInit from "@/components/PwaInit";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

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
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4edea3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CrySer" />
      </head>
      <body
        className={`bg-background ${geistSans.variable} ${geistMono.variable} ${robotto.variable} ${manrope.variable} font-geist antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <PwaInit />
          <ClientLayout>{children}</ClientLayout>
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
