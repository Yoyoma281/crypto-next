"use client";

import { useState, useEffect } from "react";
import { Shield, RotateCcw, Lock } from "lucide-react";
import AuthRequired from "@/components/auth-required";

function Section({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl px-6 py-6 flex flex-col gap-5"
      style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold text-sm">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

  // Auth check — must be first so hooks are unconditional
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Reset portfolio state
  const [resetStatus, setResetStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/GetUserInfo`, { credentials: "include" })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, [BASE]);

  if (authed === null) return null; // still checking
  if (authed === false) {
    return (
      <AuthRequired
        title="Sign in to access settings"
        description="Manage your password and account preferences."
      />
    );
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwStatus({ ok: false, msg: "Passwords do not match" });
      return;
    }
    setPwLoading(true);
    setPwStatus(null);
    try {
      const res = await fetch(`${BASE}/user/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ ok: true, msg: data.message ?? "Password updated!" });
        setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwStatus({ ok: false, msg: data.error ?? "Something went wrong" });
      }
    } catch {
      setPwStatus({ ok: false, msg: "Network error — is the server running?" });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await fetch(`${BASE}/portfolio/reset`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setResetStatus({ ok: true, msg: data.message ?? "Portfolio reset!" });
      } else {
        setResetStatus({ ok: false, msg: data.error ?? "Something went wrong" });
      }
    } catch {
      setResetStatus({ ok: false, msg: "Network error — is the server running?" });
    } finally {
      setResetLoading(false);
      setConfirmReset(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      {/* Change Password */}
      <Section icon={Lock} title="Change Password" description="Update your login password">
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          {(["currentPassword", "newPassword", "confirm"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground capitalize">
                {field === "confirm" ? "Confirm New Password" : field === "currentPassword" ? "Current Password" : "New Password"}
              </label>
              <input
                type="password"
                value={pwForm[field]}
                onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                required
                minLength={field !== "currentPassword" ? 6 : undefined}
                className="rounded-md px-3 py-2 text-sm bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50 transition"
                placeholder={field === "confirm" ? "Re-enter new password" : "••••••••"}
              />
            </div>
          ))}

          {pwStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: pwStatus.ok ? "#16c784" : "#ea3943",
                background: pwStatus.ok ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)",
              }}
            >
              {pwStatus.msg}
            </p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="mt-1 px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
          >
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </Section>

      {/* Reset Portfolio */}
      <Section
        icon={RotateCcw}
        title="Reset Portfolio"
        description="Wipe all holdings and start fresh with $1,000 USDT"
      >
        <div className="flex flex-col gap-3">
          <div
            className="text-xs px-3 py-2.5 rounded-md text-muted-foreground"
            style={{ background: "rgba(234,57,67,0.07)", border: "1px solid rgba(234,57,67,0.2)" }}
          >
            ⚠️ This will permanently delete all your holdings and trade data. You will start over with $1,000 virtual USDT. This cannot be undone.
          </div>

          {resetStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: resetStatus.ok ? "#16c784" : "#ea3943",
                background: resetStatus.ok ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)",
              }}
            >
              {resetStatus.msg}
            </p>
          )}

          <button
            onClick={handleReset}
            disabled={resetLoading}
            className="px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
            style={{
              background: confirmReset ? "#ea3943" : "rgba(234,57,67,0.1)",
              color: confirmReset ? "#fff" : "#ea3943",
            }}
          >
            {resetLoading ? "Resetting…" : confirmReset ? "Click again to confirm reset" : "Reset Portfolio"}
          </button>

          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      </Section>

      {/* Account Info */}
      <Section icon={Shield} title="Account" description="Your account details">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Starting balance: <span className="text-foreground font-semibold">$1,000 USDT</span></p>
          <p>Trading: <span className="text-foreground font-semibold">Paper trading only — no real money</span></p>
          <p>Data source: <span className="text-foreground font-semibold">Live Binance prices</span></p>
        </div>
      </Section>
    </div>
  );
}
