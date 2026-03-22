import Link from "next/link";
import { Bitcoin, Lock } from "lucide-react";

/**
 * Server component — drop this in any page that needs a session.
 * Shows an inline login prompt with a register button instead of
 * a broken page or a raw redirect.
 */
export default function AuthRequired({
  title = "Sign in to continue",
  description = "This page requires an account.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-10 flex flex-col items-center gap-6 text-center"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        {/* Icon */}
        <div className="relative">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--muted))" }}
          >
            <Bitcoin className="h-8 w-8 text-primary" />
          </div>
          <div
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))" }}
          >
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <Link
            href="/login"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-opacity hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-center border border-border hover:bg-muted transition-colors"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          New accounts start with{" "}
          <span className="font-semibold text-foreground">$1,000 virtual USDT</span>
          {" "}— no deposit needed.
        </p>
      </div>
    </div>
  );
}
