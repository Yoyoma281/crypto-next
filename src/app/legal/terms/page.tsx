import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = { title: "Terms of Service — CrySer" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-8">
      <div>
        <Link href="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Legal
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(78,222,163,0.1)" }}>
            <FileText className="h-4 w-4" style={{ color: "#4edea3" }} />
          </div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="p-4 rounded-xl border text-sm" style={{ background: "rgba(255,179,173,0.06)", borderColor: "rgba(255,179,173,0.3)", color: "#ffb3ad" }}>
        <strong>Important:</strong> CrySer is a paper trading simulator for educational purposes only. No real money,
        assets, or financial instruments are involved. Nothing on this platform constitutes financial advice.
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By creating an account or using CrySer in any way, you agree to these Terms of Service. If you do not
            agree, please do not use the platform.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground">
            CrySer is a free, demo cryptocurrency trading platform that uses live market data from Binance and CoinGecko.
            All funds and trades on CrySer are virtual — no actual cryptocurrency is bought, sold, or held on your behalf.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">3. Eligibility</h2>
          <p className="text-muted-foreground">
            You must be at least 13 years old to use CrySer. By using the platform, you confirm that you meet this
            requirement.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">4. Account Responsibilities</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree not to share your account or use another user&apos;s account.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">5. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Attempt to exploit, hack, or abuse the platform or its APIs.</li>
            <li>Use automated bots or scripts to simulate trades at scale.</li>
            <li>Misrepresent virtual gains as real financial returns.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">6. No Financial Advice</h2>
          <p className="text-muted-foreground">
            CrySer does not provide financial, investment, or trading advice. All content and data on the platform is
            for educational and entertainment purposes only. Past simulated performance is not indicative of future
            real-world results.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground">
            CrySer is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the platform will be
            available, error-free, or that market data will be perfectly accurate or uninterrupted.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, CrySer shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the platform.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">9. Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate any account that violates these terms, at our sole discretion,
            without prior notice.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">10. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may revise these Terms at any time. Continued use of CrySer after updates constitutes acceptance of
            the new Terms.
          </p>
        </section>

      </div>
    </div>
  );
}
