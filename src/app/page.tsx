"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/default-content";
import {
  ServiceCategory,
  PublishedContentResponse,
  HeroContent,
  FeaturesContent,
  WorkflowContent,
  RolesContent,
  ShowcaseContent,
  FaqContent,
  CtaContent,
  FooterContent,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Wrench,
  ShieldCheck,
  Zap,
  CalendarCheck,
  CreditCard,
  ClipboardCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Clock,
  MapPin,
  Flame,
  Droplets,
  AlertTriangle,
  FolderTree,
  ChevronRight,
  Shield,
  Layers,
  HelpCircle,
  FileText,
  UserCheck,
  Search,
  Star,
  Activity,
  Check,
  Laptop,
  Smartphone,
  Navigation,
  CheckCircle,
  Eye,
} from "lucide-react";

// Icon mapping helper for dynamic CMS icons
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    Zap,
    CreditCard,
    Wrench,
    ClipboardCheck,
    TrendingUp,
    CalendarCheck,
    Users,
    Clock,
    MapPin,
    Flame,
    Droplets,
    Shield,
    Layers,
    FileText,
    UserCheck,
  };

  const IconComponent = iconMap[name] || Wrench;
  return <IconComponent className={className} />;
}

// Work Order Lifecycle simulation states for interactive Hero preview
const SIMULATED_STAGES = [
  {
    id: "approved",
    label: "Approved",
    sub: "Manager Authorized",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    desc: "Service request verified and prioritized.",
    statusPill: "VERIFIED",
    techStatus: "En Route to Site",
    techEta: "ETA ~8 mins",
  },
  {
    id: "assigned",
    label: "Assigned",
    sub: "Rahim Tech (HVAC)",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10 border-indigo-500/30",
    desc: "Conflict-free dispatch confirmed via skill engine.",
    statusPill: "DISPATCHED",
    techStatus: "Approaching Location",
    techEta: "ETA ~4 mins",
  },
  {
    id: "in_progress",
    label: "In Progress",
    sub: "Live Telemetry",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    desc: "Technician on-site conducting diagnostics & repair.",
    statusPill: "ON SITE",
    techStatus: "Diagnostic Underway",
    techEta: "Work Log: 25m",
  },
  {
    id: "completed",
    label: "Report Ready",
    sub: "Digital Sign-off",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    desc: "Diagnostic findings, parts used, & photos submitted.",
    statusPill: "COMPLETED",
    techStatus: "Customer Verified",
    techEta: "Signed & Audited",
  },
  {
    id: "paid",
    label: "Settled",
    sub: "Stripe Webhook",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10 border-violet-500/30",
    desc: "Secure Stripe checkout finalized and archived.",
    statusPill: "PAID",
    techStatus: "Payment Confirmed",
    techEta: "Receipt Issued",
  },
];

export default function LandingPage() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<string>("customer");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<string>("all");
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [simulatedStageIndex, setSimulatedStageIndex] = useState<number>(2); // Default to "In Progress"

  // 1. Fetch published CMS content (falls back to DEFAULT_HOMEPAGE_SECTIONS)
  const { data: cmsData } = useQuery({
    queryKey: ["published-cms-content"],
    queryFn: async () => {
      try {
        const res = await api.get<PublishedContentResponse>("/content/published");
        return res.data;
      } catch (err) {
        return null;
      }
    },
    staleTime: 60000,
  });

  const sectionMap = cmsData?.sectionMap || DEFAULT_HOMEPAGE_SECTIONS;

  const heroSection = sectionMap["hero"] || DEFAULT_HOMEPAGE_SECTIONS["hero"];
  const featuresSection = sectionMap["features"] || DEFAULT_HOMEPAGE_SECTIONS["features"];
  const workflowSection = sectionMap["workflow"] || DEFAULT_HOMEPAGE_SECTIONS["workflow"];
  const rolesSection = sectionMap["roles"] || DEFAULT_HOMEPAGE_SECTIONS["roles"];
  const showcaseSection = sectionMap["showcase"] || DEFAULT_HOMEPAGE_SECTIONS["showcase"];
  const faqSection = sectionMap["faq"] || DEFAULT_HOMEPAGE_SECTIONS["faq"];
  const ctaSection = sectionMap["cta"] || DEFAULT_HOMEPAGE_SECTIONS["cta"];
  const footerSection = sectionMap["footer"] || DEFAULT_HOMEPAGE_SECTIONS["footer"];

  const heroContent = (heroSection.content || {}) as HeroContent;
  const featuresContent = (featuresSection.content || {}) as FeaturesContent;
  const workflowContent = (workflowSection.content || {}) as WorkflowContent;
  const rolesContent = (rolesSection.content || {}) as RolesContent;
  const showcaseContent = (showcaseSection.content || {}) as ShowcaseContent;
  const faqContent = (faqSection.content || {}) as FaqContent;
  const ctaContent = (ctaSection.content || {}) as CtaContent;
  const footerContent = (footerSection.content || {}) as FooterContent;

  // 2. Fetch REAL database-backed service categories from existing backend API
  const {
    data: categories,
    isLoading: loadingCategories,
    isError: categoryError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["public-service-categories"],
    queryFn: async () => {
      const res = await api.get<ServiceCategory[]>("/service-categories");
      return res.data || [];
    },
    staleTime: 30000,
  });

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.serviceTypes?.some((st) => st.name.toLowerCase().includes(q))
    );
  }, [categories, categorySearch]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    const items = faqContent.items || [];
    if (faqFilter === "all") return items;
    return items.filter((f) => f.category?.toLowerCase().includes(faqFilter.toLowerCase()));
  }, [faqContent.items, faqFilter]);

  const currentSimulated = SIMULATED_STAGES[simulatedStageIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 text-foreground antialiased overflow-x-hidden">
      <PublicHeader />

      <main className="flex-1">
        {/* ── 1. HERO SECTION WITH DUAL LIGHT/DARK BACKGROUND IMAGES ─── */}
        {heroSection.isVisible && (
          <section
            id="hero"
            aria-label="Introduction and Overview"
            className="relative isolate overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32 border-b border-border/60"
          >
            {/* ── Dual Mode Project-Related Background Images ── */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
              {/* Light Mode Hero Image: Real certified technician servicing smart AC & electrical system */}
              <div className="block dark:hidden absolute inset-0">
                <img
                  src="/images/hero-light.jpg"
                  alt="ServiSync Field Service Operations - Certified Technician Servicing AC"
                  className="w-full h-full object-cover object-[75%_center] lg:object-right-center opacity-85"
                />
                {/* Soft gradient mask for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/65 to-background/20" />
                <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-background to-transparent" />
              </div>

              {/* Night / Dark Mode Hero Image: Emergency night field service technician working on HVAC */}
              <div className="hidden dark:block absolute inset-0">
                <img
                  src="/images/hero-dark.jpg"
                  alt="ServiSync Night Field Service Operations - HVAC & Diagnostic Telemetry"
                  className="w-full h-full object-cover object-[75%_center] lg:object-right-center opacity-90"
                />
                {/* Cinematic night gradient mask */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19]/95 via-[#0b0f19]/65 to-[#0b0f19]/20" />
                <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0f19] to-transparent" />
              </div>
            </div>

            {/* Glowing Ambient Light Orbs */}
            <div
              className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-glow"
              aria-hidden="true"
            />
            <div
              className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none z-0 animate-float-slow"
              aria-hidden="true"
            />

            <div className="container relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* Left Column: Messaging & CTAs */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  {/* Modern Pulsing Badge */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 shadow-sm text-xs font-semibold text-primary backdrop-blur-md hover:bg-primary/15 transition-all">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{heroContent.badgeText || "Next-Gen Field Service Management"}</span>
                  </div>

                  {/* Main High-Impact Heading */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                    Smartly Connecting{" "}
                    <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      {heroContent.highlightedText || "Customers, Technicians,"}
                    </span>{" "}
                    and Service Operations.
                  </h1>

                  {/* Subtitle with High Readability */}
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    {heroSection.subtitle ||
                      "ServiSync streamlines the complete field service lifecycle — from customer request submission and conflict-free dispatching to real-time status transitions, on-site service reports, and automated Stripe billing."}
                  </p>

                  {/* Action CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto shadow-xl shadow-primary/25 font-semibold h-12 px-7 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02] group"
                    >
                      <Link href={heroContent.primaryCtaLink || "/register"}>
                        {heroContent.primaryCtaText || "Get Started as Customer"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-12 px-6 backdrop-blur-md bg-background/60 hover:bg-background/90 border-border/80 hover:border-primary/40 transition-all font-semibold"
                    >
                      <a href={heroContent.secondaryCtaLink || "#services"}>
                        {heroContent.secondaryCtaText || "Explore Service Catalog"}
                      </a>
                    </Button>
                  </div>

                  {/* Trust Highlights Strip */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Strict RBAC Enforced
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Sub-second Dispatch Latency
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-indigo-500" />
                      PCI Compliant Stripe
                    </span>
                  </div>

                  {/* Metrics Row */}
                  {heroContent.metrics && heroContent.metrics.length > 0 && (
                    <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 max-w-lg mx-auto lg:mx-0 text-left">
                      {heroContent.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm hover:border-primary/30 transition-colors"
                        >
                          <p className="text-2xl font-black text-foreground font-mono">{m.value}</p>
                          <p className="text-xs font-bold text-foreground mt-0.5">{m.label}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            {m.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Interactive Dispatch Simulator & Live Telemetry Card */}
                <div className="lg:col-span-5 relative">
                  {/* Floating Micro Badge 1 (Top Left) */}
                  <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/90 border border-border/80 shadow-lg backdrop-blur-md text-xs font-semibold animate-float">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    <span>Live GPS: Tech 0.8 km away</span>
                  </div>

                  {/* Floating Micro Badge 2 (Bottom Right) */}
                  <div className="absolute -bottom-4 -right-2 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/90 border border-border/80 shadow-lg backdrop-blur-md text-xs font-semibold animate-float-slow">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Stripe Webhook Verified</span>
                  </div>

                  {/* Main Glassmorphic Interactive Simulator */}
                  <div className="relative mx-auto max-w-md lg:max-w-none">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary/30 via-indigo-500/20 to-purple-500/30 opacity-70 blur-2xl -z-10" />

                    <Card className="border border-border/80 shadow-2xl bg-card/75 dark:bg-card/70 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300">
                      {/* Terminal-Style Header */}
                      <div className="px-5 py-3.5 bg-muted/60 border-b border-border/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                          <span className="text-xs font-mono text-muted-foreground ml-2 font-semibold">
                            ServiSync Live Engine
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5"
                        >
                          <Activity className="h-3 w-3 mr-1 animate-pulse" />
                          REAL-TIME
                        </Badge>
                      </div>

                      <CardContent className="p-6 space-y-5">
                        {/* Interactive State Machine Step Selector */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <span>Lifecycle State Machine (Click to simulate)</span>
                            <span className="text-primary font-mono font-bold">
                              Step {simulatedStageIndex + 1}/5
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold">
                            {SIMULATED_STAGES.map((s, idx) => {
                              const isActive = simulatedStageIndex === idx;
                              const isPast = idx < simulatedStageIndex;

                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSimulatedStageIndex(idx)}
                                  className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    isActive
                                      ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                                      : isPast
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                  }`}
                                  title={`Switch to ${s.label}`}
                                >
                                  {isPast ? "✓ " : ""}
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Active Work Order Preview Card */}
                        <div className={`p-4 rounded-xl border transition-all duration-300 ${currentSimulated.bgColor} space-y-3`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-primary font-extrabold">
                                WO-2026-LIVE
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-background/80 border border-border text-foreground font-semibold">
                                {currentSimulated.sub}
                              </span>
                            </div>
                            <Badge
                              variant="default"
                              className={`text-[10px] font-bold ${
                                simulatedStageIndex === 4
                                  ? "bg-emerald-600"
                                  : simulatedStageIndex === 3
                                  ? "bg-purple-600"
                                  : "bg-primary"
                              }`}
                            >
                              {currentSimulated.statusPill}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-foreground">
                              AC Compressor Diagnostic & Refrigerant Flush
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentSimulated.desc}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              Uttara, Sector 7, Dhaka
                            </span>
                            <span className="flex items-center gap-1.5 font-mono text-foreground font-semibold">
                              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                              {currentSimulated.techEta}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Certified Technician Information */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/70 hover:border-primary/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                RT
                              </div>
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground">Rahim Technician</p>
                                <span className="flex items-center text-[10px] text-amber-500 font-bold">
                                  <Star className="h-3 w-3 fill-amber-500 mr-0.5" /> 4.9
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                HVAC & Certified Electrical Lead
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              {currentSimulated.techStatus}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: TECH-042
                            </span>
                          </div>
                        </div>

                        {/* Interactive Action Bar */}
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Estimated Fee:</span>
                          <span className="font-mono font-bold text-base text-foreground">
                            ৳ 2,450 BDT
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 2. DATABASE-BACKED SERVICE CATEGORIES ──────────────────── */}
        <section
          id="services"
          aria-label="Supported Service Categories"
          className="py-20 md:py-28 bg-muted/30 border-b border-border/50 relative"
        >
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <Badge variant="default" className="text-xs px-3 py-1 font-semibold">
                Live Database Catalog
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Supported Service Categories
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore real database-backed services configured with inspection rates, SLA
                durations, and certified technician dispatch criteria.
              </p>

              {/* Real-time Category Search Input */}
              <div className="pt-2 max-w-md mx-auto relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories (e.g. AC, Electrical, Plumbing)..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-11 bg-card/80 border-border/80 focus:border-primary rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Category Data State Handling */}
            {loadingCategories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border/70 p-6 space-y-4 rounded-2xl">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-7 w-48 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </Card>
                ))}
              </div>
            ) : categoryError ? (
              <Card className="max-w-xl mx-auto border-destructive/30 bg-destructive/5 text-center p-8 space-y-4 rounded-2xl">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="font-bold text-base text-foreground">
                  Unable to Load Service Categories
                </h3>
                <p className="text-xs text-muted-foreground">
                  The backend service may be initializing. Please verify connectivity and retry.
                </p>
                <Button size="sm" variant="outline" onClick={() => refetchCategories()}>
                  Retry Loading Catalog
                </Button>
              </Card>
            ) : filteredCategories.length === 0 ? (
              <Card className="max-w-xl mx-auto border-border/70 text-center p-8 space-y-3 bg-card/60 rounded-2xl">
                <FolderTree className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="font-bold text-base text-foreground">No Categories Found</h3>
                <p className="text-xs text-muted-foreground">
                  {categorySearch
                    ? `No categories match "${categorySearch}". Try clearing your search.`
                    : "System administrators can configure categories and standard pricing in the Admin Control Panel."}
                </p>
                {categorySearch && (
                  <Button size="sm" variant="outline" onClick={() => setCategorySearch("")}>
                    Clear Filter
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => {
                  const serviceTypes = cat.serviceTypes || [];
                  const minPrice =
                    serviceTypes.length > 0
                      ? Math.min(...serviceTypes.map((t) => Number(t.basePrice || 0)))
                      : 0;

                  const isElectric = cat.name.toLowerCase().includes("electr");
                  const isPlumbing = cat.name.toLowerCase().includes("plumb");

                  return (
                    <Card
                      key={cat.id}
                      className="group border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 bg-card/90 backdrop-blur-sm flex flex-col justify-between rounded-2xl overflow-hidden"
                    >
                      <CardHeader className="pb-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-sm ${
                              isElectric
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : isPlumbing
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {isElectric ? (
                              <Zap className="h-6 w-6" />
                            ) : isPlumbing ? (
                              <Droplets className="h-6 w-6" />
                            ) : (
                              <Wrench className="h-6 w-6" />
                            )}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Active Catalog
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed line-clamp-2">
                          {cat.description ||
                            "Certified field maintenance, diagnosis, and on-site emergency repairs."}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
                        {/* Service Types inside this Category */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Available Service Types ({serviceTypes.length})
                          </p>
                          {serviceTypes.length > 0 ? (
                            <div className="space-y-1.5">
                              {serviceTypes.slice(0, 3).map((st) => (
                                <div
                                  key={st.id}
                                  className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs hover:bg-muted/70 transition-colors"
                                >
                                  <div>
                                    <p className="font-semibold text-foreground">{st.name}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> ~{st.durationMinutes || 60} mins
                                    </p>
                                  </div>
                                  <span className="font-mono font-bold text-primary">
                                    {formatCurrency(Number(st.basePrice || 0))}
                                  </span>
                                </div>
                              ))}
                              {serviceTypes.length > 3 && (
                                <p className="text-[10px] text-muted-foreground text-center pt-0.5">
                                  + {serviceTypes.length - 3} more options in portal
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/20 border border-border/40">
                              Standard inspection fee applies upon on-site diagnosis.
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Starting from
                            </span>
                            <span className="text-base font-extrabold text-foreground font-mono">
                              {minPrice > 0 ? formatCurrency(minPrice) : "Standard Fee"}
                            </span>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className="font-semibold shadow-sm rounded-xl group/btn"
                          >
                            <Link href="/dashboard/requests/new">
                              Book Service
                              <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── 3. WORKFLOW LIFECYCLE PIPELINE SECTION ─────────────────── */}
        {workflowSection.isVisible && (
          <section
            id="how-it-works"
            aria-label="How the System Works"
            className="py-20 md:py-28 border-b border-border/50 bg-background relative overflow-hidden"
          >
            {/* Ambient Background Gradient Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10"
              aria-hidden="true"
            />

            <div className="container relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <Badge variant="default" className="text-xs px-3 py-1 font-semibold">
                  {workflowContent.badge || "End-to-End Workflow"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {workflowSection.title || "How ServiSync Powers Field Service"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {workflowSection.subtitle ||
                    "From problem identification to payment settlement, every state transition is strictly authorized, audited, and synchronized in real-time."}
                </p>
              </div>

              {/* Connected Step Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {(workflowContent.steps || []).map((step, idx) => (
                  <Card
                    key={idx}
                    className="group border border-border/70 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 bg-card/80 backdrop-blur-md relative flex flex-col justify-between rounded-2xl overflow-hidden"
                  >
                    {/* Top Accent Gradient Border */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-primary/30 group-hover:text-primary font-mono transition-colors">
                          {step.stepNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary"
                        >
                          {step.role}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit border border-primary/20 group-hover:scale-110 transition-transform">
                        <DynamicIcon name={step.icon} className="h-6 w-6" />
                      </div>

                      <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>

                    <div className="px-6 pb-5 pt-0">
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>Audited State Machine Mutation</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 4. CORE PLATFORM CAPABILITIES (BENTO GRID) ─────────────── */}
        {featuresSection.isVisible && (
          <section
            id="features"
            aria-label="Platform Features"
            className="py-20 md:py-28 bg-muted/20 border-b border-border/50 relative"
          >
            <div className="container relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
                  {featuresContent.badge || "System Architecture"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {featuresSection.title || "Engineered for Reliability & Scale"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {featuresSection.subtitle ||
                    "ServiSync combines modern React 19 architecture with strict backend validation, real-time cache synchronization, and complete audit logging."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuresContent.items || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="group p-6 rounded-2xl border border-border/80 bg-card hover:bg-card/90 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                          <DynamicIcon name={feat.icon} className="h-6 w-6" />
                        </div>
                        {feat.tag && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5"
                          >
                            {feat.tag}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {feat.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-border/40 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Learn more about {feat.tag || "feature"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. ROLE-SPECIFIC BENEFIT TILES ─────────────────────────── */}
        {rolesSection.isVisible && (
          <section
            id="roles"
            aria-label="Multi-Role Architecture"
            className="py-20 md:py-28 border-b border-border/50 bg-background relative"
          >
            <div className="container relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
                  {rolesContent.badge || "Multi-Role Architecture"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {rolesSection.title || "Tailored Experiences for Every Stakeholder"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {rolesSection.subtitle ||
                    "Dedicated interfaces built specifically for the daily workflows of customers, field technicians, operations managers, and system administrators."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(rolesContent.roles || []).map((item, idx) => (
                  <Card
                    key={idx}
                    className="border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 bg-card/90 backdrop-blur-sm flex flex-col justify-between rounded-2xl overflow-hidden"
                  >
                    <CardHeader className="pb-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="default"
                          className="w-fit text-xs font-bold px-3 py-0.5 rounded-lg"
                        >
                          {item.role}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">Portal</span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {item.tagline}
                      </CardTitle>
                      {item.description && (
                        <CardDescription className="text-xs leading-relaxed">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
                      <ul className="space-y-2.5 text-xs text-muted-foreground">
                        {item.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4 border-t border-border/50">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold rounded-xl hover:bg-primary hover:text-white transition-all group"
                        >
                          <Link href="/login">
                            Access {item.role} Portal
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. INTERACTIVE PRODUCT SHOWCASE ────────────────────────── */}
        {showcaseSection.isVisible && showcaseContent.tabs && showcaseContent.tabs.length > 0 && (
          <section
            id="showcase"
            aria-label="Product Showcase"
            className="py-20 md:py-28 bg-muted/20 border-b border-border/50 relative overflow-hidden"
          >
            <div className="container relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                <Badge variant="default" className="text-xs px-3 py-1 font-semibold">
                  {showcaseContent.badge || "Product Showcase"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {showcaseSection.title || "Experience the Four Dedicated Portals"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {showcaseSection.subtitle ||
                    "Each role receives a custom-tailored interface designed to maximize speed, accuracy, and operational transparency."}
                </p>
              </div>

              {/* Tab Navigation Pill Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-10 p-1.5 max-w-2xl mx-auto rounded-2xl bg-card border border-border/80 shadow-sm">
                {showcaseContent.tabs.map((tab) => {
                  const isActive = activeShowcaseTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveShowcaseTab(tab.id)}
                      className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Details Display */}
              {(() => {
                const currentTab =
                  showcaseContent.tabs.find((t) => t.id === activeShowcaseTab) ||
                  showcaseContent.tabs[0];

                if (!currentTab) return null;

                return (
                  <Card className="border border-border/80 shadow-2xl max-w-5xl mx-auto overflow-hidden bg-card/95 backdrop-blur-xl rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-12">
                      {/* Left: Description & Highlights */}
                      <div className="md:col-span-7 p-6 sm:p-10 space-y-6">
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono text-primary border-primary/30 bg-primary/5"
                          >
                            {currentTab.label} Experience
                          </Badge>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                            {currentTab.heading}
                          </h3>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentTab.description}
                        </p>

                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Highlighted Features:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentTab.highlights.map((h, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 text-xs text-foreground p-2 rounded-lg bg-muted/30 border border-border/40"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span className="font-medium">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button
                            asChild
                            size="lg"
                            className="font-semibold shadow-md rounded-xl h-11 px-6 group"
                          >
                            <Link href="/login">
                              Launch {currentTab.label} Portal
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Right: Mock Interactive UI Representation */}
                      <div className="md:col-span-5 bg-muted/40 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-border/70 flex flex-col justify-center space-y-4">
                        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-md space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-muted-foreground">SESSION_STATE</span>
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              AUTHENTICATED
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-foreground">{currentTab.label} Console</span>
                              <Badge variant="default" className="text-[10px]">
                                Active
                              </Badge>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              <div className="h-2 w-full bg-primary/20 rounded animate-pulse" />
                              <div className="h-2 w-3/4 bg-primary/10 rounded" />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                            <div className="flex justify-between py-1 border-b border-border/40">
                              <span>API Route:</span>
                              <span className="font-mono text-foreground font-semibold">
                                /api/v1/{currentTab.id}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/40">
                              <span>Security Guard:</span>
                              <span className="text-emerald-500 font-bold">RBAC Strict</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Latency SLA:</span>
                              <span className="font-mono text-primary font-bold">&lt; 45ms</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl border border-border/60 bg-background/80 text-[11px] text-muted-foreground space-y-1">
                          <p className="font-bold text-foreground">Multi-Device Responsive:</p>
                          <p>
                            Optimized for desktop operations dispatch and mobile-first field execution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          </section>
        )}

        {/* ── 7. FAQ ACCORDION SECTION ───────────────────────────────── */}
        {faqSection.isVisible && faqContent.items && faqContent.items.length > 0 && (
          <section
            id="faq"
            aria-label="Frequently Asked Questions"
            className="py-20 md:py-28 border-b border-border/50 bg-background relative"
          >
            <div className="container max-w-4xl relative z-10">
              <div className="text-center space-y-4 mb-12">
                <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
                  {faqContent.badge || "Knowledge Base"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {faqSection.title || "Frequently Asked Questions"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {faqSection.subtitle ||
                    "Find answers to common questions about ServiSync platform architecture, scheduling, billing, and security."}
                </p>

                {/* FAQ Category Filter Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {["all", "dispatch", "billing", "security"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFaqFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                        faqFilter === cat
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {cat === "all" ? "All Questions" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <Card
                      key={idx}
                      className="border border-border/80 transition-all overflow-hidden bg-card/90 rounded-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                          <span>{item.question}</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <CardContent className="px-6 pb-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10 animate-accordion-down">
                          <p className="pt-4">{item.answer}</p>
                          {item.category && (
                            <Badge
                              variant="outline"
                              className="mt-3 text-[10px] font-mono border-primary/30 text-primary bg-primary/5"
                            >
                              {item.category}
                            </Badge>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 8. FINAL HIGH-IMPACT CTA SECTION ───────────────────────── */}
        {ctaSection.isVisible && (
          <section
            id="cta"
            aria-label="Call to Action"
            className="py-20 md:py-28 relative overflow-hidden"
          >
            {/* Ambient Background Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/15 rounded-full blur-[150px] pointer-events-none -z-10"
              aria-hidden="true"
            />

            <div className="container max-w-4xl relative z-10">
              <div className="p-8 sm:p-14 rounded-3xl border border-primary/30 bg-card/85 backdrop-blur-2xl shadow-2xl text-center space-y-6 relative overflow-hidden">
                {/* Floating ambient glow in corner */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <Badge variant="default" className="text-xs px-3.5 py-1 font-semibold">
                  Get Started Today
                </Badge>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  {ctaSection.title || "Ready to Transform Your Field Service Operations?"}
                </h2>

                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {ctaSection.subtitle ||
                    "Join thousands of satisfied customers and streamlined operations teams. Book your first service request or schedule a walkthrough today."}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto shadow-xl shadow-primary/25 font-semibold h-13 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground group"
                  >
                    <Link href={ctaContent.primaryButtonLink || "/register"}>
                      {ctaContent.primaryButtonText || "Book a Service Now"}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-13 px-8 rounded-xl backdrop-blur-md bg-background/60 hover:bg-background/90 border-border/80 font-semibold"
                  >
                    <Link href={ctaContent.secondaryButtonLink || "/login"}>
                      {ctaContent.secondaryButtonText || "Sign In to Portal"}
                    </Link>
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-border/50 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    256-Bit SSL Encrypted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    99.9% Uptime Guarantee
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Instant Dispatch Verification
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter content={footerContent} />
    </div>
  );
}
