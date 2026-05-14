"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  RotateCcw,
  Lock,
  User as UserIcon,
  Upload,
  ShieldCheck,
  Monitor,
  Flame,
} from "lucide-react";
import AuthRequired from "@/components/auth-required";
import { useI18n } from "@/lib/i18n";
import { useXp } from "@/hooks/useXp";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

const GITHUB_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=8",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=10",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=11",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=12",
];

/** Return a display-ready src for any stored avatar value. */
function resolveAvatarSrc(avatar: string): string {
  // Uploaded file paths start with /uploads — prefix with backend origin
  if (avatar.startsWith("/uploads")) return `${BACKEND_URL}${avatar}`;
  return avatar;
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl px-6 py-6 flex flex-col gap-5"
      style={{
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
      }}
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

// ---------------------------------------------------------------------------
// Shared small primitives
// ---------------------------------------------------------------------------

function StatusMessage({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <p
      className="text-xs px-3 py-2 rounded-md"
      style={{
        color: ok ? "#4edea3" : "#ffb3ad",
        background: ok ? "rgba(78,222,163,0.1)" : "rgba(255,179,173,0.1)",
      }}
    >
      {msg}
    </p>
  );
}

function TotpInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder={placeholder ?? "6-digit code"}
      className="bg-[#1a2235] border border-[#2e3447] text-[#dce1fb] px-3 py-2 text-sm outline-none focus:border-[#4edea3] rounded-md w-full tracking-widest"
    />
  );
}

// ---------------------------------------------------------------------------
// Two-Factor Authentication card
// ---------------------------------------------------------------------------

type TwoFaState = "disabled" | "setup" | "enabled";

function TwoFactorCard({ initialEnabled }: { initialEnabled: boolean }) {
  const [state, setState] = useState<TwoFaState>(
    initialEnabled ? "enabled" : "disabled"
  );
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null
  );

  async function handleSetup() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setState("setup");
      } else {
        setStatus({ ok: false, msg: data.error ?? "Failed to start setup" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setStatus({ ok: false, msg: "Please enter a 6-digit code" });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "2FA enabled successfully" });
        setState("enabled");
        setCode("");
        setQrCodeUrl("");
        setSecret("");
      } else {
        setStatus({ ok: false, msg: data.error ?? "Verification failed" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setStatus({
        ok: false,
        msg: "Please enter your 6-digit authenticator code",
      });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "2FA disabled" });
        setState("disabled");
        setCode("");
      } else {
        setStatus({ ok: false, msg: data.error ?? "Failed to disable 2FA" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Enabled */}
      {state === "enabled" && (
        <>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(78,222,163,0.12)",
                color: "#4edea3",
                border: "1px solid rgba(78,222,163,0.3)",
              }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              2FA is active
            </span>
          </div>
          <p className="text-xs text-[#909097]">
            Your account is protected by a time-based one-time password. Enter
            your authenticator code below to disable it.
          </p>
          <form onSubmit={handleDisable} className="flex flex-col gap-3">
            <TotpInput
              value={code}
              onChange={setCode}
              placeholder="Authenticator code"
            />
            {status && <StatusMessage ok={status.ok} msg={status.msg} />}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 self-start"
              style={{
                background: "rgba(255,179,173,0.1)",
                color: "#ffb3ad",
              }}
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </form>
        </>
      )}

      {/* Disabled */}
      {state === "disabled" && (
        <>
          <p className="text-xs text-[#909097]">
            Add an extra layer of security to your account. Use an authenticator
            app such as Google Authenticator or Authy.
          </p>
          {status && <StatusMessage ok={status.ok} msg={status.msg} />}
          <button
            onClick={handleSetup}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 self-start"
          >
            {loading ? "Loading..." : "Enable 2FA"}
          </button>
        </>
      )}

      {/* Setup — pending verification */}
      {state === "setup" && (
        <>
          <p className="text-xs text-[#909097]">
            Scan the QR code with your authenticator app, then enter the 6-digit
            code it shows to confirm.
          </p>

          {qrCodeUrl && (
            <div className="flex flex-col items-start gap-3">
              <div
                className="p-2 rounded-md"
                style={{ background: "#fff", display: "inline-block" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="2FA QR code"
                  width={160}
                  height={160}
                  style={{ display: "block" }}
                />
              </div>
              {secret && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#909097]">
                    Or enter this key manually:
                  </span>
                  <code
                    className="text-xs px-2 py-1 rounded font-mono select-all"
                    style={{
                      background: "#1a2235",
                      color: "#4edea3",
                      border: "1px solid #2e3447",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {secret}
                  </code>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <TotpInput value={code} onChange={setCode} />
            {status && <StatusMessage ok={status.ok} msg={status.msg} />}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setState("disabled");
                  setStatus(null);
                  setCode("");
                }}
                className="text-xs text-[#909097] hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Sessions card
// ---------------------------------------------------------------------------

interface SessionEntry {
  id: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function SessionsCard() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } else {
        setSessionsError("Failed to load sessions");
      }
    } catch {
      setSessionsError("Network error");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleTerminate(id: string) {
    setTerminatingId(id);
    setActionStatus(null);
    try {
      const res = await fetch(`/api/auth/sessions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ ok: true, msg: "Session terminated" });
        await fetchSessions();
      } else {
        setActionStatus({
          ok: false,
          msg: data.error ?? "Failed to terminate session",
        });
      }
    } catch {
      setActionStatus({ ok: false, msg: "Network error" });
    } finally {
      setTerminatingId(null);
    }
  }

  async function handleLogoutAll() {
    setLogoutAllLoading(true);
    setActionStatus(null);
    try {
      const res = await fetch("/api/auth/sessions", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ ok: true, msg: "All other sessions terminated" });
        await fetchSessions();
      } else {
        setActionStatus({
          ok: false,
          msg: data.error ?? "Failed to terminate sessions",
        });
      }
    } catch {
      setActionStatus({ ok: false, msg: "Network error" });
    } finally {
      setLogoutAllLoading(false);
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="flex flex-col gap-4">
      {loadingSessions && (
        <p className="text-xs text-[#909097]">Loading sessions...</p>
      )}

      {sessionsError && <StatusMessage ok={false} msg={sessionsError} />}

      {!loadingSessions && !sessionsError && sessions.length === 0 && (
        <p className="text-xs text-[#909097]">No active sessions found.</p>
      )}

      {!loadingSessions && sessions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sessions.map((session, idx) => (
            <li
              key={session.id}
              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-md"
              style={{
                background: "#0b1222",
                border: "1px solid #2e3447",
              }}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#dce1fb]">
                    Session {idx + 1}
                  </span>
                  {session.isCurrent && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "rgba(78,222,163,0.12)",
                        color: "#4edea3",
                        border: "1px solid rgba(78,222,163,0.3)",
                      }}
                    >
                      Current session
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#909097]">
                  Started {formatDate(session.createdAt)}
                </span>
                <span className="text-xs text-[#909097]">
                  Expires {formatDate(session.expiresAt)}
                </span>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleTerminate(session.id)}
                  disabled={terminatingId === session.id}
                  className="shrink-0 px-3 py-1.5 rounded text-xs font-semibold transition disabled:opacity-50"
                  style={{
                    background: "rgba(255,179,173,0.08)",
                    color: "#ffb3ad",
                    border: "1px solid rgba(255,179,173,0.2)",
                  }}
                >
                  {terminatingId === session.id ? "Terminating..." : "Terminate"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {actionStatus && (
        <StatusMessage ok={actionStatus.ok} msg={actionStatus.msg} />
      )}

      {!loadingSessions && otherSessions.length > 0 && (
        <button
          onClick={handleLogoutAll}
          disabled={logoutAllLoading}
          className="px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 self-start"
          style={{
            background: "rgba(255,179,173,0.08)",
            color: "#ffb3ad",
            border: "1px solid rgba(255,179,173,0.2)",
          }}
        >
          {logoutAllLoading ? "Logging out..." : "Log out all other devices"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak Bonus card
// ---------------------------------------------------------------------------

function StreakBonusCard() {
  const xp = useXp();
  const [claimStatus, setClaimStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);

  async function handleClaim() {
    setClaimLoading(true);
    setClaimStatus(null);
    try {
      const res = await fetch("/api/user/claim-streak-bonus", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setClaimStatus({
          ok: true,
          msg: "Claimed! +50 VUSDT added to your balance.",
        });
      } else {
        setClaimStatus({
          ok: false,
          msg: data.error ?? "Failed to claim bonus",
        });
      }
    } catch {
      setClaimStatus({ ok: false, msg: "Network error" });
    } finally {
      setClaimLoading(false);
    }
  }

  const streak = xp?.loginStreak ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(255,179,173,0.12)",
            color: "#ffb3ad",
            border: "1px solid rgba(255,179,173,0.25)",
          }}
        >
          <Flame className="h-3.5 w-3.5" />
          {streak}d streak
        </span>
      </div>

      <p className="text-xs text-[#909097]">
        Log in every day to build your streak. Reach 7 consecutive days to
        claim a bonus of +50 VUSDT.
      </p>

      {claimStatus && <StatusMessage ok={claimStatus.ok} msg={claimStatus.msg} />}

      {streak >= 7 && !claimStatus?.ok && (
        <button
          onClick={handleClaim}
          disabled={claimLoading}
          className="px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 self-start"
          style={{
            background: "rgba(78,222,163,0.15)",
            color: "#4edea3",
            border: "1px solid rgba(78,222,163,0.30)",
          }}
        >
          {claimLoading ? "Claiming..." : "Claim Bonus (+50 VUSDT)"}
        </button>
      )}

      {streak < 7 && (
        <p className="text-xs font-medium" style={{ color: "#4edea3" }}>
          {7 - streak} more day{7 - streak !== 1 ? "s" : ""} until you can
          claim.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { t } = useI18n();

  // Auth check — must be first so hooks are unconditional
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string>("");
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pwLoading, setPwLoading] = useState(false);

  // Reset portfolio state
  const [resetStatus, setResetStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Avatar (DiceBear) state
  const [avatarStatus, setAvatarStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Upload avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
          return r.json();
        } else {
          setAuthed(false);
          return null;
        }
      })
      .then((data) => {
        if (data?.avatar) {
          setCurrentAvatar(data.avatar);
        }
        if (typeof data?.twoFactorEnabled === "boolean") {
          setTwoFactorEnabled(data.twoFactorEnabled);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null; // still checking
  if (authed === false) {
    return (
      <AuthRequired
        title={t.settings.signIn}
        description={t.settings.signInSubtitle}
      />
    );
  }

  async function handleAvatarChange(avatar: string) {
    setAvatarLoading(true);
    setAvatarStatus(null);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentAvatar(avatar);
        setAvatarStatus({ ok: true, msg: "Avatar updated successfully!" });
        setShowAvatarOptions(false);
      } else {
        setAvatarStatus({
          ok: false,
          msg: data.error ?? "Failed to update avatar",
        });
      }
    } catch {
      setAvatarStatus({ ok: false, msg: "Network error" });
    } finally {
      setAvatarLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(null);

    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus({ ok: false, msg: "File is too large. Maximum size is 2 MB." });
      e.target.value = "";
      return;
    }

    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  }

  function handleCancelUpload() {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUploadSave() {
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("avatar", uploadFile);

      const res = await fetch("/api/user/avatar", {
        method: "PUT",
        body: formData,
        // No Content-Type header — browser sets it with the correct boundary
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentAvatar(data.avatarUrl);
        setUploadStatus({ ok: true, msg: "Avatar uploaded successfully!" });
        setUploadFile(null);
        setUploadPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setUploadStatus({
          ok: false,
          msg: data.error ?? "Upload failed",
        });
      }
    } catch {
      setUploadStatus({ ok: false, msg: "Network error" });
    } finally {
      setUploadLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwStatus({ ok: false, msg: t.settings.noMatch });
      return;
    }
    setPwLoading(true);
    setPwStatus(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ ok: true, msg: data.message ?? t.settings.updated });
        setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwStatus({
          ok: false,
          msg: data.error ?? t.settings.somethingWrong,
        });
      }
    } catch {
      setPwStatus({ ok: false, msg: t.settings.networkError });
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
      const res = await fetch("/api/portfolio/reset", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setResetStatus({ ok: true, msg: data.message ?? t.settings.reset });
      } else {
        setResetStatus({
          ok: false,
          msg: data.error ?? t.settings.somethingWrong,
        });
      }
    } catch {
      setResetStatus({ ok: false, msg: t.settings.networkError });
    } finally {
      setResetLoading(false);
      setConfirmReset(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Avatar Settings */}
      <Section
        icon={UserIcon}
        title="Profile Avatar"
        description="Choose your profile avatar from our collection"
      >
        <div className="flex flex-col gap-4">
          {/* Current avatar preview */}
          <div className="flex items-center gap-4">
            {currentAvatar ? (
              <img
                src={resolveAvatarSrc(currentAvatar)}
                alt="Current avatar"
                className="w-16 h-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                <UserIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                {showAvatarOptions ? "Hide Avatars" : "Choose Avatar"}
              </button>
            </div>
          </div>

          {avatarStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: avatarStatus.ok ? "#4edea3" : "#ffb3ad",
                background: avatarStatus.ok
                  ? "rgba(78,222,163,0.1)"
                  : "rgba(255,179,173,0.1)",
              }}
            >
              {avatarStatus.msg}
            </p>
          )}

          {showAvatarOptions && (
            <div className="grid grid-cols-6 gap-3">
              {GITHUB_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAvatarChange(avatar)}
                  disabled={avatarLoading}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition hover:scale-110 ${
                    currentAvatar === avatar
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Upload custom avatar */}
      <Section
        icon={Upload}
        title="Upload Custom Avatar"
        description="Upload your own photo (JPEG, PNG, WebP or GIF, max 2 MB)"
      >
        <div className="flex flex-col gap-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex items-center gap-4">
            {/* Preview or placeholder */}
            {uploadPreview ? (
              <img
                src={uploadPreview}
                alt="Upload preview"
                className="w-16 h-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-border border-dashed flex items-center justify-center bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Upload photo
            </button>
          </div>

          {uploadStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: uploadStatus.ok ? "#4edea3" : "#ffb3ad",
                background: uploadStatus.ok
                  ? "rgba(78,222,163,0.1)"
                  : "rgba(255,179,173,0.1)",
              }}
            >
              {uploadStatus.msg}
            </p>
          )}

          {uploadFile && (
            <div className="flex gap-2">
              <button
                onClick={handleUploadSave}
                disabled={uploadLoading}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
              >
                {uploadLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelUpload}
                disabled={uploadLoading}
                className="px-4 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50"
                style={{
                  background: "rgba(255,179,173,0.1)",
                  color: "#ffb3ad",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Change Password */}
      <Section
        icon={Lock}
        title={t.settings.changePassword}
        description={t.settings.changePasswordDesc}
      >
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          {(["currentPassword", "newPassword", "confirm"] as const).map(
            (field) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground capitalize">
                  {field === "confirm"
                    ? t.settings.confirmNewPassword
                    : field === "currentPassword"
                      ? t.settings.currentPassword
                      : t.settings.newPassword}
                </label>
                <input
                  type="password"
                  value={pwForm[field]}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  required
                  minLength={field !== "currentPassword" ? 6 : undefined}
                  className="rounded-md px-3 py-2 text-sm bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50 transition"
                  placeholder={
                    field === "confirm" ? t.settings.reEnter : "••••••••"
                  }
                />
              </div>
            ),
          )}

          {pwStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: pwStatus.ok ? "#4edea3" : "#ffb3ad",
                background: pwStatus.ok
                  ? "rgba(78,222,163,0.1)"
                  : "rgba(255,179,173,0.1)",
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
            {pwLoading ? t.settings.updating : t.settings.updatePassword}
          </button>
        </form>
      </Section>

      {/* Reset Portfolio */}
      <Section
        icon={RotateCcw}
        title={t.settings.resetPortfolio}
        description={t.settings.resetDesc}
      >
        <div className="flex flex-col gap-3">
          <div
            className="text-xs px-3 py-2.5 rounded-md text-muted-foreground"
            style={{
              background: "rgba(255,179,173,0.07)",
              border: "1px solid rgba(255,179,173,0.2)",
            }}
          >
            {t.settings.resetWarning}
          </div>

          {resetStatus && (
            <p
              className="text-xs px-3 py-2 rounded-md"
              style={{
                color: resetStatus.ok ? "#4edea3" : "#ffb3ad",
                background: resetStatus.ok
                  ? "rgba(78,222,163,0.1)"
                  : "rgba(255,179,173,0.1)",
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
              background: confirmReset ? "#ffb3ad" : "rgba(255,179,173,0.1)",
              color: confirmReset ? "#fff" : "#ffb3ad",
            }}
          >
            {resetLoading
              ? t.settings.resetting
              : confirmReset
                ? t.settings.confirmReset
                : t.settings.reset}
          </button>

          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              {t.settings.cancel}
            </button>
          )}
        </div>
      </Section>

      {/* Account Info */}
      <Section
        icon={Shield}
        title={t.settings.account}
        description={t.settings.accountDetails}
      >
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            {t.settings.startingBalance}
            <span className="text-foreground font-semibold">$1,000 USDT</span>
          </p>
          <p>
            {t.settings.trading}
            <span className="text-foreground font-semibold">
              {t.settings.tradingDesc}
            </span>
          </p>
          <p>
            {t.settings.dataSource}
            <span className="text-foreground font-semibold">
              {t.settings.dataSourceDesc}
            </span>
          </p>
        </div>
      </Section>

      {/* Streak Bonus */}
      <Section
        icon={Flame}
        title="Streak Bonus"
        description="Earn rewards for logging in every day"
      >
        <StreakBonusCard />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Security                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <h2 className="text-[#dce1fb] font-bold text-sm uppercase tracking-wider mb-1">
          Security
        </h2>
        <p className="text-xs text-[#909097]">
          Manage two-factor authentication and active login sessions.
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Section
        icon={ShieldCheck}
        title="Two-Factor Authentication"
        description="Protect your account with a time-based one-time password"
      >
        <TwoFactorCard initialEnabled={twoFactorEnabled} />
      </Section>

      {/* Active Sessions */}
      <Section
        icon={Monitor}
        title="Active Sessions"
        description="Manage devices that are currently signed in to your account"
      >
        <SessionsCard />
      </Section>
    </div>
  );
}
