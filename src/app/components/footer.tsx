import Link from "next/link";
import { Bitcoin, Github, Twitter } from "lucide-react";

const LINKS = {
  Platform: [
    { text: "Markets", href: "/" },
    { text: "Exchange", href: "/Exchange/BTCUSDT" },
    { text: "Portfolio", href: "/Portfolio" },
  ],
  Learn: [
    { text: "What is Bitcoin?", href: "#" },
    { text: "What is Ethereum?", href: "#" },
    { text: "How to Trade", href: "#" },
  ],
  Legal: [
    { text: "Privacy Policy", href: "#" },
    { text: "Terms of Service", href: "#" },
    { text: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Bitcoin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base">CrySer</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time crypto market data, live trading, and portfolio tracking — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.text}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CrySer. All rights reserved.</p>
          <p>
            Market data provided by{" "}
            <span className="text-foreground font-medium">Binance</span> &amp;{" "}
            <span className="text-foreground font-medium">CoinGecko</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
