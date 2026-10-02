"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  CloudRain,
  Zap,
  Refrigerator,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Flame,
} from "lucide-react";
import { ServiceCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SeasonalPackage {
  id: string;
  season: "SUMMER" | "MONSOON" | "ELECTRICAL" | "APPLIANCE";
  title: string;
  category: string;
  badge: string;
  icon: React.ElementType;
  badgeColor: string;
  description: string;
  startingPrice: number;
  durationMinutes: number;
  highlights: string[];
}

const SEASONAL_PACKAGES: SeasonalPackage[] = [
  {
    id: "pkg-ac-summer",
    season: "SUMMER",
    title: "Summer Heatwave AC Master Tune-Up",
    category: "HVAC & AC Repair",
    badge: "High Demand Season",
    icon: Sun,
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    description:
      "Deep chemical coil wash, refrigerant pressure optimization, duct sterilization, and amp draw safety calibration to maximize cooling efficiency.",
    startingPrice: 1200,
    durationMinutes: 90,
    highlights: [
      "Sub-zero cooling coil chemical wash",
      "R410A / R32 gas pressure calibration",
      "Blower wheel static balancing",
      "30-day labor & anti-leak warranty",
    ],
  },
  {
    id: "pkg-monsoon-plumbing",
    season: "MONSOON",
    title: "Monsoon Plumbing & Sump Pit Overhaul",
    category: "Plumbing",
    badge: "Rainy Season Essential",
    icon: CloudRain,
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    description:
      "Drainage pipe descaling, anti-overflow backflow valve inspection, water pump motor efficiency diagnostics, and underground pipeline leak detection.",
    startingPrice: 950,
    durationMinutes: 75,
    highlights: [
      "Pressure jet drain clearance",
      "Sump pump submersible motor audit",
      "Silent valve & trap seal integrity",
      "Anti-backflow inspection guarantee",
    ],
  },
  {
    id: "pkg-electrical-safety",
    season: "ELECTRICAL",
    title: "Comprehensive Earthing & Surge Safety Audit",
    category: "Electrical",
    badge: "Year-Round Safety",
    icon: Zap,
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    description:
      "Digital insulation resistance test, main breaker trip calibration, earthing pit conductivity measurement, and home surge protector certification.",
    startingPrice: 800,
    durationMinutes: 60,
    highlights: [
      "Digital megger insulation resistance test",
      "Distribution board thermal scanning",
      "Earthing electrode ohm measurement",
      "Certified safe electrical report",
    ],
  },
  {
    id: "pkg-appliance-care",
    season: "APPLIANCE",
    title: "Home Appliance Preventive Overhaul",
    category: "Appliance Repair",
    badge: "Preventive Care",
    icon: Refrigerator,
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    description:
      "Compressor motor efficiency tuning, washing machine drum vibration balancing, microwave radiation leak test, and water purifier filter sanitation.",
    startingPrice: 1100,
    durationMinutes: 90,
    highlights: [
      "Compressor start-capacitor diagnostics",
      "Drum bearing & drive belt inspection",
      "Thermostat sensor recalibration",
      "Genuine spare parts availability",
    ],
  },
];

export function SeasonalServicesSection({
  categories = [],
}: {
  categories?: ServiceCategory[];
}) {
  const [activeSeason, setActiveSeason] = useState<string>("ALL");

  const filteredPackages =
    activeSeason === "ALL"
      ? SEASONAL_PACKAGES
      : SEASONAL_PACKAGES.filter((p) => p.season === activeSeason);

  return (
    <section
      id="seasonal"
      aria-label="Recommended and Seasonal Services"
      className="py-16 md:py-24 border-b border-border/60 relative overflow-hidden isolate"
    >
      {/* ── Background Visual Layer: Home utility & AC cooling infrastructure ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/images/bg-seasonal.jpg"
          alt="Home utility and AC cooling infrastructure maintenance"
          className="w-full h-full object-cover object-center opacity-75 dark:opacity-35"
        />
        {/* Soft elegant gradient mask that lets the real photography shine through */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 dark:from-[#0b0f19]/85 dark:via-[#0b0f19]/50 dark:to-[#0b0f19]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 dark:from-[#0b0f19]/50 dark:to-[#0b0f19]/50" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Proactive Home Care
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Recommended & Seasonal Maintenance
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Prevent expensive emergency breakdowns with certified seasonal tune-ups configured for local climate demands.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "ALL", label: "All Collections" },
              { id: "SUMMER", label: "☀️ Summer AC" },
              { id: "MONSOON", label: "🌧️ Monsoon Plumbing" },
              { id: "ELECTRICAL", label: "⚡ Electrical Safety" },
              { id: "APPLIANCE", label: "🧊 Appliance Care" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSeason(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeSeason === tab.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPackages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className="border border-border/80 hover:border-primary/40 bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <CardContent className="p-6 sm:p-7 space-y-5">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-bold ${pkg.badgeColor}`}>
                          {pkg.badge}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {pkg.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {pkg.title}
                      </h3>
                    </div>

                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Highlights Checklist */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Scope of Diagnostics & Work:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Booking Action */}
                  <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Starting Rate (Taxes Incl.)</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-foreground">
                          {formatCurrency(pkg.startingPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ ~{pkg.durationMinutes} mins</span>
                      </div>
                    </div>

                    <Button asChild size="sm" className="font-bold shadow-xs">
                      <Link
                        href={`/dashboard/requests/new?category=${encodeURIComponent(
                          pkg.category
                        )}&title=${encodeURIComponent(pkg.title)}&description=${encodeURIComponent(
                          `Requesting seasonal maintenance: ${pkg.title}. Please dispatch certified technician.`
                        )}`}
                      >
                        <span>Book Package</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
