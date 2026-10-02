"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SettlementCard } from "@/components/dashboard/settlement-card";
import {
  Wrench,
  Users,
  CreditCard,
  ClipboardList,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Briefcase,
  Play,
  Navigation,
  Zap,
  Droplets,
  Activity,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  FolderTree,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "@/lib/utils";
import { ServiceRequest, WorkOrder, Invoice, DashboardStats, ServiceCategory, AuditLog } from "@/types";
import { toast } from "sonner";

export default function DashboardOverviewPage() {
  const { user, role } = useAuthStore();

  if (!user || !role) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* 4 Distinct, State-of-the-Art Dashboards */}
      {role === "CUSTOMER" && <CustomerDashboardView />}
      {role === "TECHNICIAN" && <TechnicianDashboardView />}
      {role === "MANAGER" && <ManagerDashboardView />}
      {role === "ADMIN" && <AdminDashboardView />}
    </div>
  );
}

/* ========================================================
   1. ADMINISTRATOR DASHBOARD: "Executive Command Center"
   Aesthetic: Deep Cyber-Navy / Glassmorphism / Real Database Metrics
   ======================================================== */
function AdminDashboardView() {
  const { user } = useAuthStore();

  // 1. Fetch real platform stats from database
  const { data: statsData, isLoading: loadingStats, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get<DashboardStats>("/admin/dashboard-stats");
      return res.data;
    },
  });

  // 2. Fetch real active service categories from database
  const { data: categories } = useQuery({
    queryKey: ["admin", "live-categories"],
    queryFn: async () => {
      const res = await api.get<ServiceCategory[]>("/service-categories");
      return res.data || [];
    },
  });

  // 3. Fetch real live security audit logs from database
  const { data: auditData } = useQuery({
    queryKey: ["admin", "recent-audit-logs"],
    queryFn: async () => {
      const res = await api.get<AuditLog[]>("/admin/audit-logs", { params: { limit: 5 } });
      return res.data || [];
    },
  });

  if (loadingStats) return <DashboardLoadingSkeleton />;
  if (statsError) return <ErrorPanel message={(statsError as any)?.message} onRetry={() => refetchStats()} />;

  const stats = statsData;

  // Real operational completion ratio
  const completedJobs = stats?.completedJobs ?? 0;
  const activeJobs = stats?.activeJobs ?? 0;
  const totalJobsExecuted = completedJobs + activeJobs;
  const jobCompletionRate = totalJobsExecuted > 0 ? Math.round((completedJobs / totalJobsExecuted) * 100) : 0;

  // Real invoice settlement ratio
  const paidInvoices = stats?.paidInvoices ?? 0;
  const totalInvoices = stats?.totalInvoices ?? 0;
  const invoiceSettlementRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const pendingInvoices = Math.max(0, totalInvoices - paidInvoices);

  return (
    <div className="space-y-7">
      {/* Hero Welcome Banner */}
      <DashboardHero
        userName={user?.name || "System Admin"}
        roleTitle="ADMIN"
        description="Here is your real-time operational overview as ADMIN. Manage accounts, service categories, and platform governance."
        heroImage="/images/admin-hero.jpg"
        healthBadge="All Systems Operational"
        healthTitle="Platform Core Infrastructure"
        healthSubtitle="PostgreSQL & Express API Connected"
        actionLabel="User Control Matrix →"
        actionHref="/dashboard/admin/users"
      />

      {/* 4 Core Real Database Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Customers"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          description="Customer user records"
          variant="blue"
        />
        <StatCard
          title="Certified Technicians"
          value={stats?.totalTechnicians ?? 0}
          icon={Wrench}
          description="Active field technicians"
          variant="cyan"
        />
        <StatCard
          title="Total Service Requests"
          value={stats?.totalServiceRequests ?? 0}
          icon={ClipboardList}
          description="Lifetime system requests"
          variant="amber"
        />
        <StatCard
          title="Total Revenue Collected"
          value={formatCurrency(stats?.totalRevenue ?? 0, "BDT")}
          icon={TrendingUp}
          description="Verified settled payments"
          variant="purple"
        />
      </div>

      {/* Settlement & Operations Health Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementCard
          badgeTitle="FIELD OPERATIONS EXECUTION"
          badgeTag="Real-Time"
          title="Work Order Settlement Health"
          description="Ratio of completed work orders versus active dispatch assignments"
          rate={jobCompletionRate}
          rateLabel="Completion Rate"
          primaryCount={completedJobs}
          primaryLabel="Completed"
          secondaryCount={activeJobs}
          secondaryLabel="Active"
          legendPrimary={`Completed Jobs (${completedJobs})`}
          legendSecondary={`Active Field Jobs (${activeJobs})`}
          secondaryColor="amber"
        />

        <SettlementCard
          badgeTitle="FINANCIAL SETTLEMENT"
          badgeTag="Stripe Engine"
          tagIcon={CreditCard}
          title="Invoice Settlement Health"
          description="Ratio of paid invoices settled via Stripe versus pending invoices"
          rate={invoiceSettlementRate}
          rateLabel="Settlement Rate"
          primaryCount={paidInvoices}
          primaryLabel="Settled"
          secondaryCount={totalInvoices}
          secondaryLabel="Invoiced"
          legendPrimary={`Settled Payments (${paidInvoices})`}
          legendSecondary={`Pending Invoices (${pendingInvoices})`}
          secondaryColor="amber"
          showChartIcon={true}
        />
      </div>

      {/* Database Categories & Recent Security Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Card */}
        <Card className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Configured Service Categories ({categories?.length || 0})
              </CardTitle>
              <CardDescription className="text-xs">
                Real database-backed service catalogs and pricing structures
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
              <Link href="/dashboard/admin/categories">Edit Catalog</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {!categories || categories.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-6 text-center">
                No categories configured yet in database.
              </p>
            ) : (
              categories.slice(0, 5).map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs hover:border-primary/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
                      <FolderTree className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-foreground">{cat.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {cat.serviceTypes?.length || 0} active service types
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                      Active
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Security Audit Events */}
        <Card className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Recent Security Audit Events
              </CardTitle>
              <CardDescription className="text-xs">
                Live cryptographic events logged by backend middleware
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
              <Link href="/dashboard/admin/audit-logs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {!auditData || auditData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-6 text-center">
                No audit events recorded yet.
              </p>
            ) : (
              auditData.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs hover:border-primary/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-mono text-[11px]">{log.action}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {log.entityType}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        By: {log.user?.name || "System"} • {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {log.ipAddress ? `IP: ${log.ipAddress}` : "Internal"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Control Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-all p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">User Directory</h4>
              <p className="text-[10px] text-muted-foreground">RBAC roles & permissions</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="w-full text-xs rounded-xl h-8">
            <Link href="/dashboard/admin/users">Manage Users</Link>
          </Button>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-all p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Service Catalog</h4>
              <p className="text-[10px] text-muted-foreground">Trades & pricing matrix</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="w-full text-xs rounded-xl h-8">
            <Link href="/dashboard/admin/categories">Edit Categories</Link>
          </Button>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-all p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Audit Logs</h4>
              <p className="text-[10px] text-muted-foreground">Security trail & changes</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="w-full text-xs rounded-xl h-8">
            <Link href="/dashboard/admin/audit-logs">Audit Explorer</Link>
          </Button>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-all p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Landing CMS</h4>
              <p className="text-[10px] text-muted-foreground">Live website content</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="w-full text-xs rounded-xl h-8">
            <Link href="/dashboard/admin/content">Edit Content</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

/* ========================================================
   2. MANAGER DASHBOARD: "Operations Command & Dispatch"
   Aesthetic: High-Density Indigo/Cyan Command Center
   ======================================================== */
function ManagerDashboardView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["manager", "overview"],
    queryFn: async () => {
      const [reqRes, statsRes] = await Promise.all([
        api.get<ServiceRequest[]>("/service-requests", { params: { limit: 12 } }),
        api.get<DashboardStats>("/admin/dashboard-stats"),
      ]);
      return {
        requests: reqRes.data || [],
        stats: statsRes.data,
      };
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "APPROVE" | "REJECT" }) => {
      return api.post(`/service-requests/${id}/review`, { action });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["manager", "overview"] });
      toast.success(`Service request ${vars.action === "APPROVE" ? "Approved" : "Rejected"}!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to review request");
    },
  });

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (error) return <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />;

  const requests = data?.requests || [];
  const stats = data?.stats;
  const reviewQueue = requests.filter((r) => ["PENDING", "UNDER_REVIEW"].includes(r.status));

  const totalRequests = stats?.totalServiceRequests ?? requests.length;
  const activeJobs = stats?.activeJobs ?? 0;
  const completedJobs = stats?.completedJobs ?? 0;
  const dispatchRate = totalRequests > 0 ? Math.round(((totalRequests - reviewQueue.length) / totalRequests) * 100) : 100;

  return (
    <div className="space-y-7">
      {/* Hero Welcome Banner */}
      <DashboardHero
        userName={user?.name || "Operations Manager"}
        roleTitle="MANAGER"
        description="Here is your real-time operational overview as MANAGER. Triage incoming requests, dispatch field technicians, and monitor work orders."
        heroImage="/images/manager-hero.jpg"
        healthBadge="Operations Online"
        healthTitle="Dispatch Operations Health"
        healthSubtitle="Real-time triage & dispatch active"
        actionLabel="Launch Dispatch Board →"
        actionHref="/dashboard/dispatch"
      />

      {/* Manager KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Service Tickets"
          value={totalRequests}
          icon={ClipboardList}
          description="Total customer requests logged"
          variant="blue"
        />
        <StatCard
          title="Pending Triage Queue"
          value={stats?.pendingRequests ?? reviewQueue.length}
          icon={Clock}
          description="Awaiting manager review"
          variant="cyan"
        />
        <StatCard
          title="Active Field Work Orders"
          value={activeJobs}
          icon={Wrench}
          description="Technicians currently on-site"
          variant="amber"
        />
        <StatCard
          title="Completed Missions"
          value={completedJobs}
          icon={CheckCircle2}
          description="Successfully completed & archived"
          variant="purple"
        />
      </div>

      {/* Dual Settlement / Dispatch Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementCard
          badgeTitle="FIELD DISPATCH TRIAGE"
          badgeTag="Live Queue"
          title="Work Order Dispatch Health"
          description="Ratio of evaluated requests dispatched versus pending evaluation"
          rate={dispatchRate}
          rateLabel="Dispatch Rate"
          primaryCount={Math.max(0, totalRequests - reviewQueue.length)}
          primaryLabel="Dispatched"
          secondaryCount={reviewQueue.length}
          secondaryLabel="Pending"
          legendPrimary={`Dispatched / Reviewed (${Math.max(0, totalRequests - reviewQueue.length)})`}
          legendSecondary={`Awaiting Triage (${reviewQueue.length})`}
          secondaryColor="amber"
        />

        <SettlementCard
          badgeTitle="OPERATIONAL EXCELLENCE"
          badgeTag="Field Execution"
          title="Field Work Order Completion Health"
          description="Ratio of completed missions settled on-schedule against active assignments"
          rate={completedJobs + activeJobs > 0 ? Math.round((completedJobs / (completedJobs + activeJobs)) * 100) : 100}
          rateLabel="Fulfillment Rate"
          primaryCount={completedJobs}
          primaryLabel="Settled"
          secondaryCount={activeJobs}
          secondaryLabel="Active"
          legendPrimary={`Completed Missions (${completedJobs})`}
          legendSecondary={`Active Field Jobs (${activeJobs})`}
          secondaryColor="amber"
          showChartIcon={true}
        />
      </div>

      {/* Review Queue with 1-Click Action */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Action Required: Pending Service Requests</h3>
            <p className="text-xs text-muted-foreground">Approve requests to verify scope and enable dispatch assignment</p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
            <Link href="/dashboard/requests">View All</Link>
          </Button>
        </div>

        {reviewQueue.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 p-8 text-center text-muted-foreground text-sm space-y-1">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-foreground">All caught up!</p>
            <p className="text-xs">No customer service requests are currently pending review.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviewQueue.map((req) => (
              <Card key={req.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{req.title}</p>
                      <Badge variant="warning" className="text-[10px]">
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Client: {req.customer?.name} ({req.customer?.email}) • Category: {req.serviceType?.category?.name || "General"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {req.location || "N/A"} • Schedule: {formatDate(req.preferredDateTime)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => reviewMutation.mutate({ id: req.id, action: "APPROVE" })}
                      isLoading={reviewMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl h-8"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => reviewMutation.mutate({ id: req.id, action: "REJECT" })}
                      isLoading={reviewMutation.isPending}
                      className="text-xs rounded-xl h-8"
                    >
                      Reject
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-xs rounded-xl h-8">
                      <Link href={`/dashboard/requests/${req.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================
   3. TECHNICIAN DASHBOARD: "Field Technician Mobile Cockpit"
   Aesthetic: High-Visibility Tactical Ops & Diagnostic HUD
   ======================================================== */
function TechnicianDashboardView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["technician", "overview"],
    queryFn: async () => {
      const [jobsRes, profileRes] = await Promise.all([
        api.get<any[]>("/technicians/me/jobs").catch(() => ({ data: [] })),
        api.get<any>("/technicians/me/profile").catch(() => ({ data: null })),
      ]);
      return {
        jobs: jobsRes?.data || [],
        profile: profileRes?.data || null,
      };
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      return api.patch("/technicians/me/availability", { isAvailable });
    },
    onSuccess: (_, isAvailable) => {
      queryClient.invalidateQueries({ queryKey: ["technician", "overview"] });
      toast.success(
        isAvailable ? "Dispatch status: AVAILABLE (Online)" : "Dispatch status: OFF DUTY (Paused)"
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update availability");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ workOrderId, status }: { workOrderId: string; status: string }) => {
      return api.patch(`/work-orders/${workOrderId}/status`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["technician", "overview"] });
      toast.success(`Work order status transitioned to ${vars.status}!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Status transition rejected by server");
    },
  });

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (error) return <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />;

  const jobs = data?.jobs || [];
  const profile = data?.profile;
  const isAvailable = profile?.isAvailable ?? true;

  const activeJob = jobs.find((j) =>
    j.workOrder && ["SCHEDULED", "ARRIVED", "IN_PROGRESS"].includes(j.workOrder.status)
  );
  const completedJobs = jobs.filter((j) => j.workOrder?.status === "COMPLETED");

  const progressRate = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 100;

  return (
    <div className="space-y-7">
      {/* Hero Welcome Banner */}
      <DashboardHero
        userName={user?.name || "Field Technician"}
        roleTitle="TECHNICIAN"
        description="Here is your real-time operational overview as TECHNICIAN. Execute assigned missions, transition field stages, and log diagnostic completions."
        heroImage="/images/technician-hero.jpg"
        healthBadge={isAvailable ? "Dispatch Ready" : "Off Duty"}
        healthTitle="Field Mission Readiness"
        healthSubtitle="Live dispatch queue connected"
        actionLabel="My Assigned Jobs →"
        actionHref="/dashboard/jobs"
      />

      {/* Tactical Dispatch Duty Readiness Strip */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isAvailable
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
          : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-3.5 w-3.5 rounded-full ${isAvailable ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Dispatch Readiness
                </span>
                <Badge variant={isAvailable ? "success" : "warning"} className="text-[10px]">
                  {isAvailable ? "ON DUTY — DISPATCHABLE" : "OFF DUTY — STANDBY"}
                </Badge>
              </div>
              <p className="text-sm font-bold text-foreground">
                {isAvailable ? "Operations dispatch can assign incoming emergency orders." : "You will not receive new dispatch assignments while off duty."}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={isAvailable ? "outline" : "default"}
            onClick={() => availabilityMutation.mutate(!isAvailable)}
            isLoading={availabilityMutation.isPending}
            className="font-bold shadow-sm rounded-xl text-xs h-9"
          >
            {isAvailable ? "Switch to Off-Duty" : "Go On-Duty (Ready)"}
          </Button>
        </div>
      </div>

      {/* Technician KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Work Orders"
          value={jobs.length}
          icon={Briefcase}
          description="Assigned job tickets"
          variant="blue"
        />
        <StatCard
          title="Current Mission"
          value={activeJob ? "1 In Progress" : "Available"}
          icon={Wrench}
          description={activeJob ? "On-site diagnostic active" : "Ready for next dispatch"}
          variant="cyan"
        />
        <StatCard
          title="Completed Jobs"
          value={completedJobs.length}
          icon={CheckCircle2}
          description="Successfully finished & signed"
          variant="amber"
        />
        <StatCard
          title="Hourly Labor Rate"
          value={profile?.hourlyRate ? `৳${profile.hourlyRate}/hr` : "৳500/hr"}
          icon={DollarSign}
          description="Field dispatch billing rate"
          variant="purple"
        />
      </div>

      {/* Settlement & Mission Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementCard
          badgeTitle="FIELD MISSION EXECUTION"
          badgeTag="Active Work"
          title="Mission Completion Health"
          description="Ratio of assigned jobs completed versus pending on-site visits"
          rate={progressRate}
          rateLabel="Completion Rate"
          primaryCount={completedJobs.length}
          primaryLabel="Completed"
          secondaryCount={Math.max(0, jobs.length - completedJobs.length)}
          secondaryLabel="Remaining"
          legendPrimary={`Completed Jobs (${completedJobs.length})`}
          legendSecondary={`Active / Pending (${Math.max(0, jobs.length - completedJobs.length)})`}
          secondaryColor="amber"
        />

        <SettlementCard
          badgeTitle="LABOR SETTLEMENT"
          badgeTag="Verified Rate"
          tagIcon={CreditCard}
          title="Technician Labor Settlement"
          description="Ratio of verified completed missions against assigned field orders"
          rate={progressRate}
          rateLabel="Settlement Rate"
          primaryCount={completedJobs.length}
          primaryLabel="Settled"
          secondaryCount={jobs.length}
          secondaryLabel="Assigned"
          legendPrimary={`Settled Missions (${completedJobs.length})`}
          legendSecondary={`Total Assigned (${jobs.length})`}
          secondaryColor="amber"
          showChartIcon={true}
        />
      </div>

      {/* Tactical Active Work Order Box */}
      {activeJob && activeJob.workOrder ? (
        <Card className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/5 via-card to-background shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                ACTIVE FIELD MISSION • WO-{activeJob.workOrder.id.slice(0, 8)}
              </span>
            </div>
            <Badge variant="default" className="bg-amber-600 text-white font-bold">
              {activeJob.workOrder.status}
            </Badge>
          </div>

          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-foreground">{activeJob.serviceRequest?.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeJob.serviceRequest?.description || "Diagnostic and repair protocol."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">Site Address:</span>
                  <span className="font-semibold text-foreground">{activeJob.serviceRequest?.location || "Customer premise"}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">Customer Contact:</span>
                  <span className="font-semibold text-foreground">{activeJob.serviceRequest?.customer?.name || "Client"}</span>
                </div>
              </div>
            </div>

            {/* Tactile Status Transition Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {activeJob.workOrder.status === "SCHEDULED" && (
                <Button
                  size="default"
                  onClick={() => statusMutation.mutate({ workOrderId: activeJob.workOrder.id, status: "ARRIVED" })}
                  isLoading={statusMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md rounded-xl text-xs h-9"
                >
                  <Navigation className="mr-1.5 h-4 w-4" />
                  Log Arrival on Site
                </Button>
              )}
              {activeJob.workOrder.status === "ARRIVED" && (
                <Button
                  size="default"
                  onClick={() => statusMutation.mutate({ workOrderId: activeJob.workOrder.id, status: "IN_PROGRESS" })}
                  isLoading={statusMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md rounded-xl text-xs h-9"
                >
                  <Play className="mr-1.5 h-4 w-4" />
                  Begin Diagnostic & Work
                </Button>
              )}
              {activeJob.workOrder.status === "IN_PROGRESS" && (
                <Button
                  size="default"
                  onClick={() => statusMutation.mutate({ workOrderId: activeJob.workOrder.id, status: "COMPLETED" })}
                  isLoading={statusMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md rounded-xl text-xs h-9"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Complete Job & Generate Report
                </Button>
              )}

              <Button asChild size="default" variant="outline" className="rounded-xl text-xs h-9">
                <Link href={`/dashboard/work-orders/${activeJob.workOrder.id}`}>
                  <FileText className="mr-1.5 h-4 w-4" />
                  Open Work Order Sheet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 p-6 text-center space-y-2">
          <Wrench className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="font-bold text-sm text-foreground">No active work order right now</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            You are in queue. Make sure your availability is turned ON so operations can dispatch new requests to you.
          </p>
        </Card>
      )}

      {/* Queue of Assigned Jobs */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          My Dispatch Queue
        </h3>
        {jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs in queue"
            description="When operations managers assign jobs matching your skills, they will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{job.serviceRequest?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Client: {job.serviceRequest?.customer?.name} • Category: {job.serviceRequest?.serviceType?.category?.name || "General"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getStatusBadgeVariant(job.status).variant} className="text-[10px]">
                      {job.status}
                    </Badge>
                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
                      <Link href={job.workOrder ? `/dashboard/work-orders/${job.workOrder.id}` : `/dashboard/jobs`}>
                        {job.workOrder ? "View" : "Details"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================
   4. CUSTOMER DASHBOARD: "Service Concierge & Request Hub"
   Aesthetic: Clean Cyan/Blue & Indigo Concierge Experience
   ======================================================== */
function CustomerDashboardView() {
  const { user } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customer", "overview"],
    queryFn: async () => {
      const [reqRes, invRes] = await Promise.all([
        api.get<ServiceRequest[]>("/service-requests", { params: { limit: 6 } }),
        api.get<Invoice[]>("/invoices", { params: { limit: 6 } }),
      ]);
      return {
        requests: reqRes.data || [],
        invoices: invRes.data || [],
      };
    },
  });

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (error) return <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />;

  const requests = data?.requests || [];
  const invoices = data?.invoices || [];

  const pendingCount = requests.filter((r) => ["PENDING", "UNDER_REVIEW"].includes(r.status)).length;
  const activeCount = requests.filter((r) => ["APPROVED", "ASSIGNED", "SCHEDULED", "IN_PROGRESS"].includes(r.status)).length;
  const completedCount = requests.filter((r) => ["COMPLETED", "RESOLVED"].includes(r.status)).length;
  const activeJob = requests.find((r) => ["ASSIGNED", "SCHEDULED", "IN_PROGRESS"].includes(r.status));
  const unpaidInvoices = invoices.filter((i) => i.status === "PENDING");
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

  const serviceCompletionRate = requests.length > 0 ? Math.round((completedCount / requests.length) * 100) : 100;
  const invoiceSettlementRate = invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 100;

  return (
    <div className="space-y-7">
      {/* Hero Welcome Banner */}
      <DashboardHero
        userName={user?.name || "Valued Client"}
        roleTitle="CLIENT"
        description="Here is your real-time operational overview as CLIENT. Request certified technicians, track active field visits, and settle invoices seamlessly."
        heroImage="/images/customer-hero.jpg"
        healthBadge="Support Online 24/7"
        healthTitle="Concierge Service Desk"
        healthSubtitle="Certified Trade Specialists Available"
        actionLabel="New Service Request →"
        actionHref="/dashboard/requests/new"
      />

      {/* Quick Trade Booking Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Fast-Track Booking</span>
            <h3 className="text-base font-extrabold text-foreground mt-0.5">Need on-site technical assistance?</h3>
            <p className="text-xs text-muted-foreground">Select a trade to request a certified technician with standard inspection fees.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs rounded-xl h-8">
              <Link href="/dashboard/requests/new">
                <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" />
                Electrical
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs rounded-xl h-8">
              <Link href="/dashboard/requests/new">
                <Droplets className="mr-1 h-3.5 w-3.5 text-blue-500" />
                Plumbing
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs rounded-xl h-8">
              <Link href="/dashboard/requests/new">
                <Wrench className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                AC / HVAC
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs shadow-sm rounded-xl h-8">
              <Link href="/dashboard/requests/new">
                <PlusCircle className="mr-1 h-3.5 w-3.5" />
                Custom Request
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Live Active Service Tracker Card (if active job exists) */}
      {activeJob && (
        <Card className="rounded-2xl border border-primary/30 bg-primary/5 shadow-lg overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs bg-primary">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Active In Field
                </Badge>
                <span className="text-xs font-mono font-bold text-primary">
                  REF: {activeJob.id.slice(0, 8)}
                </span>
              </div>
              <h4 className="text-base font-bold text-foreground">{activeJob.title}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {activeJob.location || "Customer Address"} • Preferred: {formatDate(activeJob.preferredDateTime)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-muted-foreground block">Current Stage</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  {activeJob.status}
                </span>
              </div>
              <Button asChild size="sm" className="font-semibold shadow-sm rounded-xl text-xs h-8">
                <Link href={`/dashboard/requests/${activeJob.id}`}>Track Live</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Customer Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Service Requests"
          value={requests.length}
          icon={ClipboardList}
          description="Lifetime submitted tickets"
          variant="blue"
        />
        <StatCard
          title="Active Field Jobs"
          value={activeCount}
          icon={Wrench}
          description="Assigned or in progress"
          variant="cyan"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          description="Manager triage in progress"
          variant="amber"
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          icon={CreditCard}
          description={unpaidInvoices.length > 0 ? "Requires settlement" : "All invoices cleared"}
          variant="purple"
        />
      </div>

      {/* Settlement & Operations Health Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementCard
          badgeTitle="SERVICE FULFILLMENT HEALTH"
          badgeTag="Home Service"
          title="Service Request Fulfillment Health"
          description="Ratio of resolved service visits versus active ongoing technician jobs"
          rate={serviceCompletionRate}
          rateLabel="Fulfillment Rate"
          primaryCount={completedCount}
          primaryLabel="Completed"
          secondaryCount={activeCount}
          secondaryLabel="Active"
          legendPrimary={`Completed Requests (${completedCount})`}
          legendSecondary={`Active Field Visits (${activeCount})`}
          secondaryColor="amber"
        />

        <SettlementCard
          badgeTitle="BILLING & SETTLEMENT"
          badgeTag="Stripe Verified"
          tagIcon={CreditCard}
          title="Invoice Settlement Health"
          description="Ratio of paid invoices settled via Stripe versus outstanding dues"
          rate={invoiceSettlementRate}
          rateLabel="Settlement Rate"
          primaryCount={paidInvoices.length}
          primaryLabel="Settled"
          secondaryCount={invoices.length}
          secondaryLabel="Invoiced"
          legendPrimary={`Paid Invoices (${paidInvoices.length})`}
          legendSecondary={`Pending Settlement (${unpaidInvoices.length})`}
          secondaryColor="amber"
          showChartIcon={true}
        />
      </div>

      {/* Main Dual Grid: Requests & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Service Requests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              My Service Requests
            </h3>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs h-8">
              <Link href="/dashboard/requests">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {requests.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No service requests yet"
              description="Need assistance with AC, electrical, or plumbing? Submit your first service request."
              actionLabel="Create Request"
              onAction={() => (window.location.href = "/dashboard/requests/new")}
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const badge = getStatusBadgeVariant(req.status);
                return (
                  <Card key={req.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground truncate">{req.title}</p>
                          <Badge variant={badge.variant} className="text-[10px]">
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{req.serviceType?.name || "Standard Inspection"}</span>
                          <span>•</span>
                          <span>{formatDate(req.createdAt)}</span>
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl text-xs h-8">
                        <Link href={`/dashboard/requests/${req.id}`}>Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoices & Stripe Settlement */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              Invoices & Billing
            </h3>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs h-8">
              <Link href="/dashboard/invoices">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {invoices.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No invoices recorded"
              description="Invoices will appear here automatically upon technician field completion."
            />
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <Card key={inv.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold text-foreground">{inv.invoiceNumber}</p>
                      <p className="text-base font-extrabold text-foreground font-mono">
                        {formatCurrency(inv.dueAmount, inv.currency)}
                      </p>
                      <Badge
                        variant={inv.status === "PAID" ? "success" : "warning"}
                        className="text-[10px] font-semibold"
                      >
                        {inv.status === "PAID" ? "✓ Paid via Stripe" : "Action Needed: Unpaid"}
                      </Badge>
                    </div>
                    {inv.status === "PENDING" && (
                      <Button asChild size="sm" className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs h-8">
                        <Link href={`/dashboard/invoices/${inv.id}`}>Pay with Stripe</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </div>
  );
}
