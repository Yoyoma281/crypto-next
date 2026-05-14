"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Bitcoin, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const body = await res.json();
        setErrorMsg(body?.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(78,222,163,0.12)" }}
        >
          <CheckCircle2 className="h-7 w-7" style={{ color: "#4edea3" }} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-white text-base">
            Password reset successfully.
          </p>
          <p className="text-sm mt-1" style={{ color: "#909097" }}>
            You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-xs transition-colors"
          style={{ color: "#4edea3" }}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-bold text-white">Reset Password</h1>
        <p className="text-sm" style={{ color: "#909097" }}>
          Enter your new password below.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="newPassword" className="text-white/80">
            New Password
          </Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            autoFocus
            placeholder="At least 8 characters"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-white/80">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your new password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {state === "error" && errorMsg && (
          <div
            className="text-xs text-center px-3 py-2.5 rounded-lg border"
            style={{
              color: "#ffb3ad",
              background: "rgba(255,179,173,0.07)",
              borderColor: "rgba(255,179,173,0.25)",
            }}
          >
            {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={state === "loading"}
        >
          {state === "loading" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs transition-colors"
          style={{ color: "#909097" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dce1fb")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#909097")}
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

function InvalidTokenMessage() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div
        className="text-xs px-3 py-2.5 rounded-lg border w-full"
        style={{
          color: "#ffb3ad",
          background: "rgba(255,179,173,0.07)",
          borderColor: "rgba(255,179,173,0.25)",
        }}
      >
        Invalid reset link. The link may have expired or is malformed.
      </div>
      <Link
        href="/forgot-password"
        className="text-xs transition-colors"
        style={{ color: "#4edea3" }}
      >
        Request a new reset link
      </Link>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4"
      style={{ background: "#0c1324" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            CrySer
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{
            background: "#0b1222",
            borderColor: "#2e3447",
          }}
        >
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <InvalidTokenMessage />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen w-full items-center justify-center"
          style={{ background: "#0c1324" }}
        />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
