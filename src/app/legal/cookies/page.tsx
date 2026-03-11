import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";

export const metadata = { title: "Cookie Policy — CrySer" };

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-8">
      <div>
        <Link href="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Legal
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
            <Cookie className="h-4 w-4" style={{ color: "#a855f7" }} />
          </div>
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">1. What Are Cookies?</h2>
          <p className="text-muted-foreground">
            Cookies are small text files stored on your device by a web browser. They allow websites to remember
            information about your visit, making your next visit easier and the site more useful to you.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">2. Cookies We Use</h2>
          <p className="text-muted-foreground">CrySer uses a minimal set of cookies:</p>

          <div className="rounded-xl border border-border overflow-hidden mt-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">Purpose</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 font-mono">token</td>
                  <td className="px-4 py-2.5">Essential</td>
                  <td className="px-4 py-2.5">Keeps you authenticated (HTTP-only, not accessible to JavaScript)</td>
                  <td className="px-4 py-2.5">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-1">
            We do <strong className="text-foreground">not</strong> use advertising, tracking, or analytics cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">3. Essential Cookies</h2>
          <p className="text-muted-foreground">
            The <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">token</code> cookie is strictly
            necessary for the platform to function. Without it, you cannot remain logged in between page loads.
            Because it is essential, it does not require your consent under most cookie regulations.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">4. Third-Party Cookies</h2>
          <p className="text-muted-foreground">
            CrySer itself sets only the cookie listed above. However, live market data is fetched from{" "}
            <strong className="text-foreground">Binance</strong> and <strong className="text-foreground">CoinGecko</strong>.
            These external services may set their own cookies subject to their respective privacy policies. CrySer has
            no control over those cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">5. Managing Cookies</h2>
          <p className="text-muted-foreground">
            You can control and delete cookies through your browser settings. Note that disabling the{" "}
            <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">token</code> cookie will prevent you from
            staying logged in. Most browsers allow you to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>View all cookies stored for a site.</li>
            <li>Delete individual cookies or all cookies.</li>
            <li>Block cookies from specific or all sites.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">6. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Cookie Policy if we change how we use cookies. Any changes will be posted on this page
            with an updated date.
          </p>
        </section>

      </div>
    </div>
  );
}
