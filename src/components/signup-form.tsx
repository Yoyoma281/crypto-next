"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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

export function SignupForm({ className }: { className?: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setState("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error ?? "Registration failed");
        setState("idle");
        return;
      }

      setState("success");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setServerError("Network error. Please try again.");
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-14 w-14 rounded-full bg-[rgba(22,199,132,0.15)] flex items-center justify-center text-2xl">
          ✓
        </div>
        <p className="text-lg font-semibold text-foreground">Account created!</p>
        <p className="text-sm text-muted-foreground">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-5", className)}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start with <span className="text-foreground font-semibold">$1,000</span> in virtual funds
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="satoshi" {...register("username")} />
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type="password" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>

        {serverError && (
          <p className="text-xs text-destructive text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={state === "loading"}>
          {state === "loading" ? "Creating account…" : "Create Account"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
