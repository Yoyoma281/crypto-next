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
import { Loader2, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export async function login(username: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export function LoginForm({
  className,
  onSwitchToSignup,
  focusFirst,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & { onSwitchToSignup?: () => void; focusFirst?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (focusFirst) {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [focusFirst]);

  const onSubmit = async (data: LoginFormData) => {
    setState("loading");
    setErrorMsg(null);
    try {
      const response = await login(data.username, data.password);
      if (response && response.token) {
        setState("success");
        setTimeout(() => router.push("/"), 1600);
      } else {
        setErrorMsg("Invalid credentials. Please try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Login failed. Please check your credentials.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 anim-scale-in">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(22,199,132,0.12)" }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: "#16c784" }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Welcome back!</p>
          <p className="text-sm text-muted-foreground mt-0.5">Redirecting to markets…</p>
        </div>
        <div className="flex gap-1 mt-1">
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
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your CrySer account
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input
            id="email"
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
            <p className="text-xs text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {(state === "error" && errorMsg) && (
          <div
            className="text-xs text-center px-3 py-2.5 rounded-lg border"
            style={{ color: "#ea3943", background: "rgba(234,57,67,0.07)", borderColor: "rgba(234,57,67,0.25)" }}
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
              Signing in…
            </span>
          ) : "Sign In"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Sign up free
          </button>
        ) : (
          <a href="/signup" className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity">
            Sign up free
          </a>
        )}
      </div>
    </form>
  );
}
