import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy — CrySer" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-8">
      <div>
        <Link href="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Legal
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,161,231,0.1)" }}>
            <Shield className="h-4 w-4" style={{ color: "#4edea3" }} />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="prose prose-sm max-w-none flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">1. Overview</h2>
          <p className="text-muted-foreground">
            CrySer (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a paper trading demo platform. We are committed to being transparent about
            the data we collect and how it is used. This policy explains what information we gather when you use CrySer
            and your rights regarding that information.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">2. Information We Collect</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li><strong className="text-foreground">Account data</strong> — username and email address provided at registration.</li>
            <li><strong className="text-foreground">Usage data</strong> — pages visited, trades placed (virtual), and session duration, collected to improve the platform.</li>
            <li><strong className="text-foreground">Cookies</strong> — an authentication token stored in an HTTP-only cookie to keep you logged in. See our Cookie Policy for details.</li>
          </ul>
          <p className="text-muted-foreground">We do <strong className="text-foreground">not</strong> collect payment information, real financial data, or government-issued IDs. CrySer involves no real money.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>To authenticate you and maintain your session.</li>
            <li>To save your virtual portfolio and trade history.</li>
            <li>To improve platform performance and fix bugs.</li>
          </ul>
          <p className="text-muted-foreground">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">4. Third-Party Services</h2>
          <p className="text-muted-foreground">
            Live market data is streamed from <strong className="text-foreground">Binance</strong> and <strong className="text-foreground">CoinGecko</strong>.
            These services may collect anonymised analytics on their end. CrySer does not control their data practices.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">5. Data Retention</h2>
          <p className="text-muted-foreground">
            Your account data is retained as long as your account is active. You may request deletion at any time by
            contacting us, after which your data will be removed within 30 days.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">6. Security</h2>
          <p className="text-muted-foreground">
            Passwords are hashed and never stored in plain text. Authentication tokens are stored in HTTP-only cookies,
            inaccessible to client-side scripts. Despite these measures, no system is 100% secure and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">7. Your Rights</h2>
          <p className="text-muted-foreground">
            Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data.
            To exercise any of these rights, contact us through the platform.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">8. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. Continued use of CrySer after changes are posted constitutes
            your acceptance of the revised policy.
          </p>
        </section>

      </div>
    </div>
  );
}
