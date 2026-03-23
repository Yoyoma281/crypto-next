import Link from "next/link";
import { Shield, FileText, Cookie, ArrowRight } from "lucide-react";

export const metadata = { title: "Legal — CrySer" };

const DOCS = [
  {
    icon: Shield,
    title: "Privacy Policy",
    desc: "How we collect, use, and protect your personal information.",
    href: "/legal/privacy",
    color: "#b9c7e0",
    bg: "rgba(185,199,224,0.08)",
  },
  {
    icon: FileText,
    title: "Terms of Service",
    desc: "The rules and guidelines for using the CrySer platform.",
    href: "/legal/terms",
    color: "#4edea3",
    bg: "rgba(78,222,163,0.08)",
  },
  {
    icon: Cookie,
    title: "Cookie Policy",
    desc: "What cookies we use, why we use them, and how to manage them.",
    href: "/legal/cookies",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
  },
];

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Legal</h1>
        <p className="text-sm text-muted-foreground">
          CrySer is a demo paper-trading platform. The documents below explain
          your rights and our responsibilities.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {DOCS.map((doc) => {
          const Icon = doc.icon;
          return (
            <Link
              key={doc.href}
              href={doc.href}
              className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors group"
            >
              <div
                className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: doc.bg }}
              >
                <Icon className="h-5 w-5" style={{ color: doc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {doc.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {doc.desc}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-6">
        CrySer involves no real money, assets, or financial instruments. All
        funds and trades are virtual, for educational purposes only. Market data
        is provided by Binance and CoinGecko.
      </p>
    </div>
  );
}
