"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bitcoin, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
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
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username }),
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
          {state === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(78,222,163,0.12)" }}
              >
                <CheckCircle2 className="h-7 w-7" style={{ color: "#4edea3" }} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-base">
                  Reset link sent.
                </p>
                <p className="text-sm mt-1" style={{ color: "#909097" }}>
                  Check your email for the password reset link.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 text-xs transition-colors"
                style={{ color: "#909097" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#dce1fb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#909097")
                }
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5 text-center">
                <h1 className="text-xl font-bold text-white">
                  Forgot Password
                </h1>
                <p className="text-sm" style={{ color: "#909097" }}>
                  Enter your username and we&apos;ll send a reset link to your
                  email.
                </p>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-white/80">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="satoshi"
                    autoComplete="username"
                    autoFocus
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
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
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs transition-colors"
                  style={{ color: "#909097" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#dce1fb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#909097")
                  }
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
