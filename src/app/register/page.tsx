"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Wrench, AlertCircle, UserPlus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ServiSyncLogo } from "@/components/common/servisync-logo";
import { AuthTokens } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
      phone: "",
      address: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<AuthTokens>("/auth/register", data, { skipAuth: true });
      if (res.success && res.data) {
        setAuth(res.data.user as any, res.data.accessToken, res.data.refreshToken);
        toast.success(`Account created! Welcome, ${res.data.user.name}.`);
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message =
        err?.message || "Registration failed. Please review your input.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mb-6 text-center">
        <ServiSyncLogo href="/" size="xl" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <Card className="border border-border/80 shadow-xl rounded-2xl bg-card">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Create an Account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Join ServiSync to request services or manage field assignments
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
              {/* Role selector pill */}
              <div className="space-y-1.5">
                <Label>I want to register as a:</Label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setValue("role", "CUSTOMER")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === "CUSTOMER"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <p className="text-sm font-bold">Customer</p>
                    <p className="text-[11px] opacity-80">Request repairs & service</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("role", "TECHNICIAN")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === "TECHNICIAN"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <p className="text-sm font-bold">Technician</p>
                    <p className="text-[11px] opacity-80">Deliver field repairs</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Alice Rahman"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alice@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password (min 6 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+88017..."
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Address / City</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Dhaka"
                    error={errors.address?.message}
                    {...register("address")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-md shadow-primary/20 mt-2"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-0 text-center text-xs text-muted-foreground border-t border-border/50 p-4">
            <p>
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in here
              </Link>
            </p>
            <Link href="/" className="hover:underline text-[11px]">
              ← Back to Landing Page
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
