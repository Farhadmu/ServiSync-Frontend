"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  CreditCard,
  AlertCircle,
  FileCheck,
  DollarSign,
} from "lucide-react";
import { ServiceCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function EstimateQuotePreview({
  categories = [],
}: {
  categories?: ServiceCategory[];
}) {
  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive !== false),
    [categories]
  );

  const [selectedCatId, setSelectedCatId] = useState<string>(activeCategories[0]?.id || "");
  const [complexityTier, setComplexityTier] = useState<"DIAGNOSTIC" | "STANDARD" | "COMPREHENSIVE">("STANDARD");
  const [isEmergency, setIsEmergency] = useState<boolean>(false);

  const currentCategory = useMemo(
    () => activeCategories.find((c) => c.id === selectedCatId) || activeCategories[0],
    [activeCategories, selectedCatId]
  );

  // Dynamic estimate calculation based on category & complexity
  const { baseFee, diagnosticFee, laborFee, emergencyFee, totalEstimate } = useMemo(() => {
    // Find representative base price from category service types or fallback
    const firstType = currentCategory?.serviceTypes?.[0];
    const base = firstType?.basePrice ? Number(firstType.basePrice) : 800;

    let multiplier = 1.0;
    if (complexityTier === "DIAGNOSTIC") multiplier = 0.6;
    if (complexityTier === "COMPREHENSIVE") multiplier = 1.75;

    const diag = Math.round(base * 0.4);
    const labor = Math.round(base * multiplier);
    const emergency = isEmergency ? Math.round((diag + labor) * 0.25) : 0; // +25% emergency policy
    const total = diag + labor + emergency;

    return {
      baseFee: base,
      diagnosticFee: diag,
      laborFee: labor,
      emergencyFee: emergency,
      totalEstimate: total,
    };
  }, [currentCategory, complexityTier, isEmergency]);

  return (
    <section
      id="pricing-quotes"
      aria-label="Transparent Pricing & Quote Preview"
      className="py-16 md:py-24 border-b border-border/60 relative overflow-hidden isolate"
    >
      {/* ── Background Visual Layer: Clean minimal interior & architectural workspace ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/images/bg-quotes.jpg"
          alt="Clean minimal architectural office and workspace"
          className="w-full h-full object-cover object-center opacity-85 dark:opacity-90 dark:brightness-110 dark:contrast-105 filter saturate-105"
        />
        {/* Soft elegant gradient mask that lets the real photography shine through */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/70 dark:from-[#0b0f19]/60 dark:via-[#0b0f19]/15 dark:to-[#0b0f19]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 dark:from-[#0b0f19]/30 dark:via-transparent dark:to-[#0b0f19]/30" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            Transparent Financial Protection
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Upfront Estimates. Zero Hidden Surcharges.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Preview realistic starting rates for your trade and understand how ServiSync quotes protect your card from unexpected billing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Cost Estimator */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border/80 shadow-md bg-card rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Instant Trade Estimate Calculator
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimate labor and diagnostic costs based on published platform rules
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Trade Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Trade Category
                  </Label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-1.5 text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (from ~{formatCurrency(c.serviceTypes?.[0]?.basePrice ? Number(c.serviceTypes[0].basePrice) : 800)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scope of Work */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estimated Scope of Work
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "DIAGNOSTIC", label: "Diagnostic Only", desc: "Inspection & test" },
                      { id: "STANDARD", label: "Standard Repair", desc: "Parts tuning & fix" },
                      { id: "COMPREHENSIVE", label: "Full Overhaul", desc: "Major disassembly" },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setComplexityTier(tier.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          complexityTier === tier.id
                            ? "border-primary bg-primary/10 font-bold ring-1 ring-primary/30"
                            : "border-border/70 hover:border-primary/40 bg-card"
                        }`}
                      >
                        <span className="text-xs font-bold block">{tier.label}</span>
                        <span className="text-[10px] text-muted-foreground block">{tier.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Toggle */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      Urgent Same-Day Dispatch (+25%)
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Prioritizes technician dispatch within 90-minute SLA window
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                {/* Estimate Breakdown Card */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border/70 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>On-Site Diagnostics & Inspection:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(diagnosticFee)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Estimated Labor & Execution:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(laborFee)}</span>
                  </div>
                  {isEmergency && (
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                      <span>Emergency Priority Surcharge (25%):</span>
                      <span className="font-semibold">+{formatCurrency(emergencyFee)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex justify-between items-baseline">
                    <span className="font-bold text-foreground text-sm">Estimated Total Range:</span>
                    <span className="text-xl font-extrabold text-primary">~{formatCurrency(totalEstimate)}</span>
                  </div>
                </div>

                <Button asChild className="w-full font-bold shadow-md shadow-primary/20 text-xs">
                  <Link
                    href={`/dashboard/requests/new?category=${encodeURIComponent(
                      currentCategory?.name || "General"
                    )}`}
                  >
                    Request Custom Quote / Booking
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: The 4-Step Quote Lifecycle Reassurance */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border/80 shadow-md bg-gradient-to-br from-card to-primary/5 rounded-2xl p-6 sm:p-7 space-y-6">
              <div className="border-b border-border/50 pb-3">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Authoritative Billing Safeguards
                </span>
                <h3 className="font-extrabold text-xl text-foreground mt-0.5">
                  How ServiSync Quotes Work
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-sm text-foreground">1. Transparent Base Estimate</h4>
                    <p className="text-muted-foreground">
                      Before technicians are dispatched, you see the starting rate. You are never committed to unknown pricing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-sm text-foreground">2. Itemized Quote from Operations</h4>
                    <p className="text-muted-foreground">
                      If your repair requires replacement parts or extra labor, an official itemized quote is prepared in your customer portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-sm text-foreground">3. You Approve or Decline With Zero Risk</h4>
                    <p className="text-muted-foreground">
                      Review each part and labor line. Approving a quote <strong className="text-foreground">never charges your card automatically</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-sm text-foreground">4. Post-Completion Stripe Settlement</h4>
                    <p className="text-muted-foreground">
                      Only after the technician submits the service report and you inspect the completed work is the final invoice issued for test-mode Stripe checkout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/70 flex items-center gap-2.5 text-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-muted-foreground">
                  Backed by our <strong className="text-foreground">30-Day Labor Guarantee</strong>. If the issue recurs within 30 days, follow-up inspection is covered.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
