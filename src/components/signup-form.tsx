"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const schema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export function SignupForm({
  className,
  onSwitchToLogin,
  focusFirst,
}: {
  className?: string;
  onSwitchToLogin?: () => void;
  focusFirst?: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (focusFirst) {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [focusFirst]);

  const onSubmit = async (data: FormData) => {
    setState("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error ?? t.auth.networkError);
        setState("idle");
        return;
      }

      setState("success");
      setTimeout(() => router.push("/login"), 2200);
    } catch {
      setServerError(t.auth.networkError);
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 anim-scale-in">
        <div className="relative">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(22,199,132,0.12)" }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: "#4edea3" }} />
          </div>
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "#4edea3" }}
          />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">
            {t.auth.accountCreated}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t.auth.redirectingLogin}
          </p>
        </div>
        {/* Virtual balance badge */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold"
          style={{
            background: "rgba(78,222,163,0.08)",
            borderColor: "rgba(78,222,163,0.3)",
            color: "#4edea3",
          }}
        >
          <Wallet className="h-4 w-4" />
          {t.auth.virtualBalance}
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-5", className)}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">{t.auth.createAccount}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="username">{t.auth.username}</Label>
          <Input
            id="username"
            type="text"
            placeholder="satoshi"
            autoComplete="username"
            {...register("username")}
            ref={(el) => {
              register("username").ref(el);
              firstFieldRef.current = el;
            }}
          />
          {errors.username && (
            <p className="text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="confirm">{t.auth.confirmPassword}</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            {...register("confirm")}
          />
          {errors.confirm && (
            <p className="text-xs text-destructive">{errors.confirm.message}</p>
          )}
        </div>

        {serverError && (
          <div
            className="text-xs text-center px-3 py-2.5 rounded-lg border"
            style={{
              color: "#ffb3ad",
              background: "rgba(255,179,173,0.07)",
              borderColor: "rgba(255,179,173,0.25)",
            }}
          >
            {serverError}
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
              {t.auth.creatingAccount}
            </span>
          ) : (
            t.auth.signUp
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.hasAccount}{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {t.auth.signInLink}
          </button>
        ) : (
          <Link
            href="/login"
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {t.auth.signInLink}
          </Link>
        )}
      </p>
    </form>
  );
}
