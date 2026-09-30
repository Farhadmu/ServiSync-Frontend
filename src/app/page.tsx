"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function LandingPage() {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<string>("customer");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 text-foreground antialiased">
      <PublicHeader />

      <main className="flex-1">
        {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
        {heroSection.isVisible && (
          <section
            id="hero"
            aria-label="Introduction and Overview"
            className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background"
          >
            {/* Subtle ambient gradient mesh */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10"
              aria-hidden="true"
            />

            <div className="container relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Messaging & CTAs */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  {heroContent.badgeText && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>{heroContent.badgeText}</span>
                    </div>
                  )}

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                    Smartly Connecting{" "}
                    <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {heroContent.highlightedText || "Customers, Technicians,"}
                    </span>{" "}
                    and Service Operations.
                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    {heroSection.subtitle ||
                      "ServiSync streamlines the complete field service lifecycle — from customer request submission and conflict-free dispatching to real-time status transitions, on-site service reports, and automated Stripe billing."}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto shadow-lg shadow-primary/20 font-semibold h-12 px-6"
                    >
                      <Link href={heroContent.primaryCtaLink || "/register"}>
                        {heroContent.primaryCtaText || "Get Started as Customer"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-12 px-6"
                    >
                      <a href={heroContent.secondaryCtaLink || "#services"}>
                        {heroContent.secondaryCtaText || "Explore Service Catalog"}
                      </a>
                    </Button>
                  </div>

                  {/* Architecture Metrics Row */}
                  {heroContent.metrics && heroContent.metrics.length > 0 && (
                    <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 max-w-lg mx-auto lg:mx-0 text-left">
                      {heroContent.metrics.map((m, idx) => (
                        <div key={idx}>
                          <p className="text-2xl font-black text-foreground font-mono">{m.value}</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{m.label}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Product Showcase Preview */}
                <div className="lg:col-span-5">
                  <div className="relative mx-auto max-w-md lg:max-w-none">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary to-indigo-500 opacity-20 blur-xl -z-10" />

                    <Card className="border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                      <div className="p-4 bg-muted/50 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-400" />
                          <div className="h-3 w-3 rounded-full bg-amber-400" />
                          <div className="h-3 w-3 rounded-full bg-emerald-400" />
                          <span className="text-xs font-mono text-muted-foreground ml-2">
                            ServiSync Dispatch Engine
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                          RBAC Verified
                        </Badge>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* Live Active Work Order Preview Card */}
                        <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-primary font-bold">
                              WO-2026-LIVE
                            </span>
                            <Badge variant="default" className="text-[10px] bg-primary">
                              IN PROGRESS
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-foreground">
                            AC Compressor Diagnostic & Refrigerant Flush
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              Uttara, Sector 7, Dhaka
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                              Arrival Logged: 09:30 AM
                            </span>
                          </div>
                        </div>

                        {/* State Machine Steps */}
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Lifecycle State Machine
                          </p>
                          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
                            <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Approved ✓
                            </div>
                            <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Assigned ✓
                            </div>
                            <div className="p-1.5 rounded bg-primary text-white font-bold shadow-sm">
                              In Progress
                            </div>
                            <div className="p-1.5 rounded bg-muted text-muted-foreground">
                              Invoice Pay
                            </div>
                          </div>
                        </div>

                        {/* Assigned Certified Technician */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                              RT
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">Rahim Technician</p>
                              <p className="text-[11px] text-muted-foreground">HVAC & Electrical Specialist</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            On Site
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
          className="py-20 bg-muted/20 border-b border-border/50"
        >
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="default" className="text-xs">
                Real Database Catalog
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Supported Service Categories
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fetched live from the ServiSync category database with preconfigured standard inspection fees, durations, and technician certification requirements.
              </p>
            </div>

            {/* Category Data State Handling */}
            {loadingCategories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border/70 p-6 space-y-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-7 w-48 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : categoryError ? (
              <Card className="max-w-xl mx-auto border-destructive/30 bg-destructive/5 text-center p-8 space-y-3">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="font-bold text-base text-foreground">Unable to Load Service Categories</h3>
                <p className="text-xs text-muted-foreground">
                  The backend service may be initializing on Render. Please verify backend status and retry.
                </p>
                <Button size="sm" variant="outline" onClick={() => refetchCategories()}>
                  Retry Loading Catalog
                </Button>
              </Card>
            ) : !categories || categories.length === 0 ? (
              <Card className="max-w-xl mx-auto border-border/70 text-center p-8 space-y-3 bg-card/60">
                <FolderTree className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="font-bold text-base text-foreground">No Service Categories Published Yet</h3>
                <p className="text-xs text-muted-foreground">
                  System administrators can configure categories and standard pricing in the Admin Control Panel.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/login">Admin Login to Add Categories</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const serviceTypes = cat.serviceTypes || [];
                  const minPrice =
                    serviceTypes.length > 0
                      ? Math.min(...serviceTypes.map((t) => Number(t.basePrice || 0)))
                      : 0;

                  return (
                    <Card
                      key={cat.id}
                      className="border border-border/80 hover:border-primary/50 transition-all hover:shadow-lg bg-card/90 flex flex-col justify-between"
                    >
                      <CardHeader className="pb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            {cat.name.toLowerCase().includes("electr") ? (
                              <Zap className="h-5 w-5 text-amber-500" />
                            ) : cat.name.toLowerCase().includes("plumb") ? (
                              <Droplets className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Wrench className="h-5 w-5 text-indigo-500" />
                            )}
                          </span>
                          <Badge variant="outline" className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Active Catalog
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">{cat.name}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed line-clamp-2">
                          {cat.description || "Certified field maintenance and on-site emergency repairs."}
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
                                  className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
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
                            <p className="text-xs text-muted-foreground italic p-3 rounded bg-muted/20">
                              Standard inspection fee applies upon on-site diagnosis.
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Starting from</span>
                            <span className="text-base font-extrabold text-foreground font-mono">
                              {minPrice > 0 ? formatCurrency(minPrice) : "Standard Fee"}
                            </span>
                          </div>

                          <Button asChild size="sm" className="font-semibold shadow-sm">
                            <Link href="/dashboard/requests/new">
                              Book Service
                              <ChevronRight className="ml-1 h-3.5 w-3.5" />
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

        {/* ── 3. WORKFLOW LIFECYCLE SECTION ──────────────────────────── */}
        {workflowSection.isVisible && (
          <section
            id="how-it-works"
            aria-label="How the System Works"
            className="py-20 border-b border-border/50 bg-background"
          >
            <div className="container">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                <Badge variant="default" className="text-xs">
                  {workflowContent.badge || "End-to-End Workflow"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {workflowSection.title || "How ServiSync Powers Field Service"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {workflowSection.subtitle ||
                    "From problem identification to payment settlement, every state transition is strictly authorized, audited, and synchronized in real-time."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(workflowContent.steps || []).map((step, idx) => (
                  <Card
                    key={idx}
                    className="border border-border/70 hover:border-primary/40 transition-all hover:shadow-md bg-card/80 relative flex flex-col justify-between"
                  >
                    <CardContent className="p-6 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-primary/30 font-mono">
                          {step.stepNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {step.role}
                        </Badge>
                      </div>

                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                        <DynamicIcon name={step.icon} className="h-5 w-5" />
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {step.title}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 4. CORE PLATFORM FEATURES ──────────────────────────────── */}
        {featuresSection.isVisible && (
          <section
            id="features"
            aria-label="Platform Features"
            className="py-20 bg-muted/20 border-b border-border/50"
          >
            <div className="container">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                <Badge variant="secondary" className="text-xs">
                  {featuresContent.badge || "System Capabilities"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {featuresSection.title || "Engineered for Reliability & Scale"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {featuresSection.subtitle ||
                    "ServiSync combines modern React 19 architecture with strict backend validation and complete audit logging."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuresContent.items || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-6 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-colors shadow-sm"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary h-fit shrink-0">
                      <DynamicIcon name={feat.icon} className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      {feat.tag && (
                        <Badge variant="outline" className="text-[10px] mb-1 font-mono">
                          {feat.tag}
                        </Badge>
                      )}
                      <h3 className="font-bold text-base text-foreground">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feat.description}
                      </p>
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
            className="py-20 border-b border-border/50 bg-background"
          >
            <div className="container">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
                <Badge variant="secondary" className="text-xs">
                  {rolesContent.badge || "Multi-Role Architecture"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {rolesSection.title || "Tailored Experiences for Every Stakeholder"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {rolesSection.subtitle ||
                    "Dedicated interfaces built specifically for the daily workflows of customers, field technicians, operations managers, and system administrators."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(rolesContent.roles || []).map((item, idx) => (
                  <Card key={idx} className="border border-border/80 flex flex-col justify-between">
                    <CardHeader className="pb-3 space-y-2">
                      <Badge variant="default" className="w-fit text-xs font-bold">
                        {item.role} Portal
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">
                        {item.tagline}
                      </CardTitle>
                      {item.description && (
                        <CardDescription className="text-xs leading-relaxed">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {item.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t border-border/50">
                        <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                          <Link href="/login">Access {item.role} Portal</Link>
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
            className="py-20 bg-muted/20 border-b border-border/50"
          >
            <div className="container">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                <Badge variant="default" className="text-xs">
                  {showcaseContent.badge || "Product Showcase"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {showcaseSection.title || "Experience the Four Dedicated Portals"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {showcaseSection.subtitle ||
                    "Each role receives a custom-tailored interface designed to maximize speed, accuracy, and operational transparency."}
                </p>
              </div>

              {/* Tab Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {showcaseContent.tabs.map((tab) => {
                  const isActive = activeShowcaseTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveShowcaseTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Details Display */}
              {(() => {
                const currentTab =
                  showcaseContent.tabs.find((t) => t.id === activeShowcaseTab) ||
                  showcaseContent.tabs[0];

                if (!currentTab) return null;

                return (
                  <Card className="border border-border/80 shadow-xl max-w-4xl mx-auto overflow-hidden bg-card/95">
                    <div className="grid grid-cols-1 md:grid-cols-12">
                      <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
                        <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
                          {currentTab.label} Feature Set
                        </Badge>
                        <h3 className="text-2xl font-bold text-foreground">
                          {currentTab.heading}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentTab.description}
                        </p>

                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Core Capabilities:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentTab.highlights.map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button asChild className="font-semibold shadow-sm">
                            <Link href="/login">
                              Launch {currentTab.label}
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Mock Visual representation for tab */}
                      <div className="md:col-span-5 bg-muted/40 p-6 border-t md:border-t-0 md:border-l border-border/70 flex flex-col justify-center space-y-3">
                        <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                            <span>PORTAL_ACTIVE</span>
                            <span className="text-emerald-500 font-bold">ONLINE</span>
                          </div>
                          <p className="text-xs font-bold text-foreground">
                            {currentTab.label} Module
                          </p>
                          <div className="space-y-1.5 pt-1 text-[11px] text-muted-foreground">
                            <div className="h-2 w-full bg-primary/20 rounded animate-pulse" />
                            <div className="h-2 w-3/4 bg-primary/10 rounded" />
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border border-border/60 bg-background/80 text-[11px] text-muted-foreground space-y-1">
                          <p className="font-semibold text-foreground">Guaranteed RBAC Security:</p>
                          <p>All mutations validated via Express JWT + Prisma ORM state machines.</p>
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
          <section id="faq" aria-label="Frequently Asked Questions" className="py-20 border-b border-border/50 bg-background">
            <div className="container max-w-4xl">
              <div className="text-center space-y-3 mb-12">
                <Badge variant="secondary" className="text-xs">
                  {faqContent.badge || "Knowledge Base"}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {faqSection.title || "Frequently Asked Questions"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {faqSection.subtitle ||
                    "Find answers to common questions about ServiSync platform architecture, scheduling, billing, and security."}
                </p>
              </div>

              <div className="space-y-3">
                {faqContent.items.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <Card
                      key={idx}
                      className="border border-border/80 transition-all overflow-hidden bg-card"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="flex items-center gap-2.5">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>{item.question}</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <CardContent className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                          <p className="pt-3">{item.answer}</p>
                          {item.category && (
                            <Badge variant="outline" className="mt-3 text-[10px] font-mono">
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

        {/* ── 8. FINAL HIGH-IMPACT CTA ───────────────────────────────── */}
        {ctaSection.isVisible && (
          <section id="cta" aria-label="Call to Action" className="py-20 bg-gradient-to-b from-primary/5 via-primary/10 to-background border-b border-border/50">
            <div className="container max-w-4xl text-center space-y-6">
              <Badge variant="default" className="text-xs">
                Get Started Today
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                {ctaSection.title || "Ready to Transform Your Field Service Operations?"}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {ctaSection.subtitle ||
                  "Join thousands of satisfied customers and streamlined operations teams. Book your first service request or schedule a walkthrough today."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-primary/25 font-semibold h-12 px-8"
                >
                  <Link href={ctaContent.primaryButtonLink || "/register"}>
                    {ctaContent.primaryButtonText || "Book a Service Now"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8"
                >
                  <Link href={ctaContent.secondaryButtonLink || "/login"}>
                    {ctaContent.secondaryButtonText || "Sign In to Portal"}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter content={footerContent} />
    </div>
  );
}
