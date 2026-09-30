import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Programming Hero B7A7 • Field Service Management System</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Smartly Connecting{" "}
                  <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Customers, Technicians,
                  </span>{" "}
                  and Service Operations.
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  ServiSync streamlines the complete field service lifecycle — from customer request submission and conflict-free dispatching to real-time status transitions, on-site service reports, and automated Stripe billing.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20 font-semibold">
                    <Link href="/register">
                      Get Started as Customer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <a href="#demo-access">Evaluator Demo Accounts</a>
                  </Button>
                </div>

                {/* Key Metrics row */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 max-w-lg mx-auto lg:mx-0">
                  <div>
                    <p className="text-2xl font-bold text-foreground">4 Roles</p>
                    <p className="text-xs text-muted-foreground mt-0.5">RBAC Enforced</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">100% Real</p>
                    <p className="text-xs text-muted-foreground mt-0.5">API State Machine</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Stripe</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Verified Billing</p>
                  </div>
                </div>
              </div>

              {/* Visual Showcase Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative glowing gradient backdrop */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary to-indigo-500 opacity-20 blur-xl -z-10" />

                  <Card className="border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <div className="p-4 bg-muted/50 border-b border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <div className="h-3 w-3 rounded-full bg-emerald-400" />
                        <span className="text-xs font-mono text-muted-foreground ml-2">
                          ServiSync Live Operations
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        Operational
                      </Badge>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Active Work Order preview */}
                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-primary font-semibold">
                            WO-2026-0881
                          </span>
                          <Badge variant="default" className="text-[10px]">
                            IN PROGRESS
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-foreground">
                          AC Coil Inspection & Refrigerant Flush
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            123 Main St, Dhaka
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            Arrived at 09:30 AM
                          </span>
                        </div>
                      </div>

                      {/* Mini Timeline simulation */}
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Lifecycle Progress
                        </p>
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-medium">
                          <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Approved ✓
                          </div>
                          <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Assigned ✓
                          </div>
                          <div className="p-1.5 rounded bg-primary text-white font-bold animate-pulse">
                            In Progress
                          </div>
                          <div className="p-1.5 rounded bg-muted text-muted-foreground">
                            Invoice
                          </div>
                        </div>
                      </div>

                      {/* Assigned Tech snippet */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            RT
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">Rahim Technician</p>
                            <p className="text-[11px] text-muted-foreground">HVAC & Electrical Specialist</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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

        {/* WORKFLOW LIFECYCLE SECTION */}
        <section id="how-it-works" className="py-20 bg-muted/30 border-b border-border/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="default" className="text-xs">End-to-End Workflow</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How ServiSync Powers Field Service
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                From problem identification to payment settlement, every state transition is strictly authorized, audited, and synchronized in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Submit Request",
                  role: "Customer",
                  desc: "Customers choose a category & service type, specify problem details, location, and preferred date.",
                  icon: CalendarCheck,
                },
                {
                  step: "02",
                  title: "Dispatch & Schedule",
                  role: "Manager",
                  desc: "Operations review request, match available technicians with eligible skills, and prevent schedule conflicts.",
                  icon: Users,
                },
                {
                  step: "03",
                  title: "Execute & Report",
                  role: "Technician",
                  desc: "Technician accepts the job, logs arrival, starts work, and writes a detailed field service report upon completion.",
                  icon: ClipboardCheck,
                },
                {
                  step: "04",
                  title: "Invoice & Stripe Pay",
                  role: "Manager & Customer",
                  desc: "Manager generates itemized invoice; customer settles securely via integrated Stripe Checkout.",
                  icon: CreditCard,
                },
              ].map((item) => (
                <Card key={item.step} className="border border-border/70 hover:border-primary/40 transition-all hover:shadow-md">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-primary/40 font-mono">
                        {item.step}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.role}
                      </Badge>
                    </div>
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CORE PLATFORM FEATURES */}
        <section id="features" className="py-20 border-b border-border/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="secondary" className="text-xs">System Architecture</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Engineered for Reliability & Scale
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                ServiSync combines modern React 19 architecture with strict backend validation and complete audit logging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Four-Role RBAC",
                  desc: "Guaranteed backend authorization for CUSTOMER, TECHNICIAN, MANAGER, and ADMIN. No client-side impersonation.",
                },
                {
                  icon: Zap,
                  title: "TanStack Query Engine",
                  desc: "Automatic cache invalidation upon mutations, optimistic updates, and background refetching for always-fresh state.",
                },
                {
                  icon: CreditCard,
                  title: "Real Stripe Integration",
                  desc: "Live payment sessions with checkout redirection, backend webhook processing, and truthful paid status verification.",
                },
                {
                  icon: Wrench,
                  title: "Technician Skill Matching",
                  desc: "Category requirements validate technician certifications (Electrical, HVAC, Plumbing) before assigning work orders.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Field Service Reports",
                  desc: "Technicians log findings, actions taken, and image evidence directly from mobile or tablet interfaces.",
                },
                {
                  icon: TrendingUp,
                  title: "Executive Dashboards",
                  desc: "Real-time metrics, revenue aggregation, active jobs, and system audit logs with search and pagination.",
                },
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-border/60 hover:bg-muted/40 transition-colors">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary h-fit shrink-0">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICE CATEGORIES SHOWCASE */}
        <section id="services" className="py-20 bg-muted/20 border-b border-border/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="default" className="text-xs">Service Catalog</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Supported Service Categories
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fetched directly from the ServiSync category database with preconfigured standard rates and durations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Electrical Repair & Installation",
                  category: "Electrical",
                  services: ["AC Repair (120 mins - ৳80)", "Wiring Installation (180 mins - ৳100)"],
                  skills: ["ELECTRICAL", "HVAC"],
                },
                {
                  name: "Plumbing & Leak Management",
                  category: "Plumbing",
                  services: ["Water Leak Detection (90 mins - ৳60)", "Pipe Maintenance"],
                  skills: ["PLUMBING"],
                },
                {
                  name: "HVAC & Climate Control",
                  category: "HVAC",
                  services: ["Compressor Diagnostic", "Filter Replacement & Gas Refill"],
                  skills: ["HVAC", "ELECTRICAL"],
                },
              ].map((cat, i) => (
                <Card key={i} className="border border-border/80 hover:shadow-lg transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{cat.category}</Badge>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Available Now
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">Popular Services:</p>
                      {cat.services.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border/50 flex flex-wrap gap-1">
                      {cat.skills.map((sk) => (
                        <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ROLE-SPECIFIC BENEFITS */}
        <section id="roles" className="py-20 border-b border-border/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="secondary" className="text-xs">Multi-Role Architecture</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Tailored Experiences for Every Stakeholder
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  role: "Customer",
                  tagline: "Effortless Requests",
                  bullets: [
                    "Easy service booking with date/time",
                    "Real-time status timeline tracking",
                    "View assigned technician profile",
                    "Direct Stripe payment & feedback",
                  ],
                },
                {
                  role: "Technician",
                  tagline: "Field Job Mobility",
                  bullets: [
                    "Job queue & schedule calendar",
                    "Accept / reject assignments",
                    "Status buttons (Arrived, In-Progress)",
                    "Digital service report submission",
                  ],
                },
                {
                  role: "Manager",
                  tagline: "Operations Dispatch",
                  bullets: [
                    "Review, approve or reject requests",
                    "Technician conflict checking",
                    "Schedule start & end dispatching",
                    "One-click invoice generation",
                  ],
                },
                {
                  role: "Admin",
                  tagline: "System Governance",
                  bullets: [
                    "User management & role changes",
                    "Active status toggle (Deactivate/Activate)",
                    "Platform metrics & revenue analytics",
                    "Comprehensive audit logs viewer",
                  ],
                },
              ].map((item, idx) => (
                <Card key={idx} className="border border-border/80">
                  <CardContent className="p-6 space-y-3">
                    <Badge variant="default" className="text-xs font-bold">
                      {item.role}
                    </Badge>
                    <h3 className="text-base font-bold text-foreground">{item.tagline}</h3>
                    <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                      {item.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO ACCESS / EVALUATION SECTION */}
        <section id="demo-access" className="py-20 bg-gradient-to-b from-muted/50 to-background border-b border-border/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <Badge variant="default" className="text-xs">Evaluator Quick Access</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                One-Click Demo Credentials
              </h2>
              <p className="text-sm text-muted-foreground">
                Documented seed accounts pre-loaded in the ServiSync backend. Click any role on the login screen for instant autofill!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  role: "ADMIN",
                  email: "admin@servisync.com",
                  pass: "Admin@123",
                  name: "System Admin",
                  color: "border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20",
                },
                {
                  role: "MANAGER",
                  email: "manager@servisync.com",
                  pass: "Manager@123",
                  name: "Operations Manager",
                  color: "border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20",
                },
                {
                  role: "TECHNICIAN",
                  email: "tech1@servisync.com",
                  pass: "Tech@123",
                  name: "Rahim Technician",
                  color: "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20",
                },
                {
                  role: "CUSTOMER",
                  email: "customer1@example.com",
                  pass: "Customer@123",
                  name: "Alice Customer",
                  color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
                },
              ].map((acc) => (
                <Card key={acc.role} className={`border ${acc.color}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {acc.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">Seed Data</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{acc.name}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{acc.email}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">Password: {acc.pass}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold">
                      <Link href={`/login?demoRole=${acc.role}`}>
                        Log in as {acc.role}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button asChild size="lg" className="shadow-lg font-semibold">
                <Link href="/login">
                  Go to Secure Login Page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
