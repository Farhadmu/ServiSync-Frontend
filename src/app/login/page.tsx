"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { api, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Wrench, Shield, ArrowRight, AlertCircle, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthTokens } from "@/types";

const DEMO_ACCOUNTS = [
  { role: "CUSTOMER", email: "customer1@example.com", pass: "Customer@123", label: "Customer (Alice)" },
  { role: "TECHNICIAN", email: "tech1@servisync.com", pass: "Tech@123", label: "Technician (Rahim)" },
  { role: "MANAGER", email: "manager@servisync.com", pass: "Manager@123", label: "Operations Manager" },
  { role: "ADMIN", email: "admin@servisync.com", pass: "Admin@123", label: "System Admin" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const demoRoleParam = searchParams.get("demoRole");
  const isExpired = searchParams.get("expired") === "1";

  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isExpired ? "Your session has expired. Please sign in again." : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle demo role autofill from URL or click
  const autofillDemo = useCallback((email: string, pass: string, roleName: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setErrorMessage(null);
    toast.info(`Filled credentials for ${roleName}`);
  }, [setValue]);

  useEffect(() => {
    if (demoRoleParam) {
      const match = DEMO_ACCOUNTS.find((d) => d.role.toUpperCase() === demoRoleParam.toUpperCase());
      if (match) {
        autofillDemo(match.email, match.pass, match.role);
      }
    }
  }, [demoRoleParam, autofillDemo]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<AuthTokens>("/auth/login", data, { skipAuth: true });
      if (res.success && res.data) {
        setAuth(res.data.user as any, res.data.accessToken, res.data.refreshToken);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      const message =
        err?.message || "Invalid email or password. Please verify your credentials.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="border border-border/80 shadow-xl rounded-2xl bg-card">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Sign In to ServiSync
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Access your personalized service dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold shadow-md shadow-primary/20"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Evaluator One-Click Logins */}
          <div className="pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">
                  Evaluator Demo Autofill
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => autofillDemo(acc.email, acc.pass, acc.role)}
                  className="p-2 text-left rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
                >
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{acc.role}</span>
                    <Sparkles className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 text-center text-xs text-muted-foreground border-t border-border/50 p-4">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
          <Link href="/" className="hover:underline text-[11px]">
            ← Return to Landing Page
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md group-hover:scale-105 transition-transform">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            ServiSync
          </span>
        </Link>
      </div>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
