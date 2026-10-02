"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Zap,
  ShieldCheck,
  CreditCard,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Sparkles,
  ClipboardCheck,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function TechnicianOpportunityHub() {
  const { isAuthenticated, role, user } = useAuthStore();
  const isTechnician = isAuthenticated && role === "TECHNICIAN";

  return (
    <section
      id="technician-hub"
      aria-label="Technician Opportunity Hub"
      className="py-16 md:py-24 border-b border-border/60 relative overflow-hidden isolate"
    >
      {/* ── Background Visual Layer: Professional technician working in field ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80"
          alt="Professional field technician working on equipment"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-25 dark:opacity-15 filter saturate-75"
        />
        {/* Multi-layer gradient mask with deep subtle navy accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Ambient background glow accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading and Core Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Service Fleet Careers & Partners
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Are You a Skilled Technician? <span className="text-primary">Grow with ServiSync.</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Say goodbye to cold calls and unpaid bidding wars. ServiSync connects certified HVAC, electrical, plumbing, and appliance specialists with pre-qualified, dispatched jobs in your local coverage zone.
              </p>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit">
                  <Zap className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Algorithmic Dispatch</h4>
                <p className="text-xs text-muted-foreground">
                  Get assigned based on your verified skills, rating, and location without manual bidding.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Digital Field HUD</h4>
                <p className="text-xs text-muted-foreground">
                  Interactive 5-point safety checklists, spare parts tracker, and mobile service reports.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Transparent Payouts</h4>
                <p className="text-xs text-muted-foreground">
                  Guaranteed hourly labor and replacement parts compensation settled upon Stripe completion.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                  <Clock className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Flexible Availability</h4>
                <p className="text-xs text-muted-foreground">
                  One-tap On-Duty / Off-Duty toggle. Work when you want, where you want.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isTechnician ? (
                <Button asChild size="lg" className="font-bold shadow-md shadow-primary/20 text-sm">
                  <Link href="/dashboard/jobs">
                    <span>Open Technician Dispatch HUD</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="font-bold shadow-md shadow-primary/20 text-sm">
                    <Link href="/register?role=TECHNICIAN">
                      <span>Apply as Certified Technician</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-sm font-semibold">
                    <Link href="/login">Technician Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: 3-Step Verification Timeline Card */}
          <div className="lg:col-span-6">
            <Card className="border border-border/80 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="border-b border-border/50 pb-4">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Simple 3-Step Fast-Track
                </span>
                <h3 className="font-extrabold text-xl text-foreground mt-0.5">
                  How You Start Working on ServiSync
                </h3>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-primary/20">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Online Registration & Trade Profile</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Register your technician account, specify your trade specializations (HVAC, Electrical, Plumbing, Appliance), and set your base hourly rates.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-primary/20">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Skill Verification by Operations Manager</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our platform managers review your certifications and past experience to assign verified skill tags, qualifying you for automated dispatch matching.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-emerald-500/20">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Accept Dispatches & Complete Digital Checklists</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Receive confirmed client bookings with navigation routes, perform work using the mobile safety checklist, and submit your parts report for automated payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality & Trust Commitment Banner */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/60 flex items-center gap-3 text-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Zero hidden commission fees.</strong> You receive your full agreed labor and material reimbursement upon customer checkout.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
