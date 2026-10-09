"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Package,
  ShieldCheck,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ServiceReportsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "FILED" | "PENDING">("ALL");
  const [search, setSearch] = useState("");

  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["technician-reports"],
    queryFn: async () => {
      const res = await api.get<WorkOrder[]>("/work-orders", {
        params: { limit: 50 },
      });
      return res.data || [];
    },
  });

  const completedOrders = useMemo(() => {
    return workOrders?.filter((wo) => wo.status === "COMPLETED") || [];
  }, [workOrders]);

  // Operational metrics
  const filedCount = completedOrders.filter((wo) => Boolean(wo.serviceReport)).length;
  const pendingCount = completedOrders.filter((wo) => !wo.serviceReport).length;

  // Calculate total parts tracked across filed reports
  const totalPartsTracked = useMemo(() => {
    let count = 0;
    completedOrders.forEach((wo) => {
      if (wo.serviceReport?.actionsTaken) {
        try {
          const parsed = JSON.parse(wo.serviceReport.actionsTaken);
          if (Array.isArray(parsed?.spareParts)) {
            count += parsed.spareParts.length;
          }
        } catch {
          // not json, ignore
        }
      }
    });
    return count;
  }, [completedOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return completedOrders.filter((wo) => {
      if (activeTab === "FILED" && !wo.serviceReport) return false;
      if (activeTab === "PENDING" && Boolean(wo.serviceReport)) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const title = wo.assignment?.serviceRequest?.title?.toLowerCase() || "";
        const customer = wo.assignment?.serviceRequest?.customer?.name?.toLowerCase() || "";
        const id = wo.id.toLowerCase();
        return title.includes(query) || customer.includes(query) || id.includes(query);
      }
      return true;
    });
  }, [completedOrders, activeTab, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Service & Inspection Reports"
        description="Authoritative documentation of completed diagnostics, safety checklists, and spare parts replacements."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Completed Work Orders</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{completedOrders.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Reports Filed</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {filedCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Reports Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Parts Tracked</p>
              <p className="text-2xl font-bold text-primary mt-0.5">{totalPartsTracked}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border/80 text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === "ALL"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({completedOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FILED")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === "FILED"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reports Filed ({filedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === "PENDING"
                ? "bg-card text-amber-600 dark:text-amber-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Filing ({pendingCount})
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search report, title or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : completedOrders.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No completed work orders yet"
          description="Once field jobs reach Completed status, service reports and spare parts tracking will be managed here."
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching service reports found"
          description="Try selecting a different filter tab or clearing your search term."
        />
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((wo) => {
            const hasReport = Boolean(wo.serviceReport);
            let sparePartsCount = 0;
            let checklistCount = 0;

            if (wo.serviceReport?.actionsTaken) {
              try {
                const parsed = JSON.parse(wo.serviceReport.actionsTaken);
                if (Array.isArray(parsed?.spareParts)) {
                  sparePartsCount = parsed.spareParts.length;
                }
                if (Array.isArray(parsed?.checklist)) {
                  checklistCount = parsed.checklist.filter((c: any) => c.completed).length;
                }
              } catch {
                // non json
              }
            }

            return (
              <Card
                key={wo.id}
                className="border-border/80 hover:border-primary/40 transition-all shadow-sm overflow-hidden"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        WO-{wo.id.slice(0, 8)}
                      </span>
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {wo.assignment?.serviceRequest?.title || "Field Job"}
                      </h4>
                      <Badge
                        variant={hasReport ? "success" : "warning"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {hasReport ? "Report Filed & Verified" : "Documentation Pending"}
                      </Badge>
                      {sparePartsCount > 0 && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30">
                          <Package className="h-3 w-3" />
                          {sparePartsCount} {sparePartsCount === 1 ? "Part Replaced" : "Parts Replaced"}
                        </Badge>
                      )}
                      {checklistCount > 0 && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-500/30">
                          <ShieldCheck className="h-3 w-3" />
                          {checklistCount}/5 QA Checks Passed
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Customer: <strong className="text-foreground">{wo.assignment?.serviceRequest?.customer?.name || "Customer"}</strong>
                      </span>
                      <span>•</span>
                      <span>Completed on: {formatDate(wo.completedAt)}</span>
                      {wo.assignment?.technician?.user?.name && (
                        <>
                          <span>•</span>
                          <span>Technician: {wo.assignment.technician.user.name}</span>
                        </>
                      )}
                    </div>

                    {hasReport && wo.serviceReport?.summary && (
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
                        <span className="font-semibold text-foreground">Diagnostics Summary: </span>
                        <span className="text-muted-foreground">{wo.serviceReport.summary}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      asChild
                      size="sm"
                      variant={hasReport ? "outline" : "default"}
                      className={!hasReport ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm" : ""}
                    >
                      <Link href={`/dashboard/work-orders/${wo.id}`}>
                        {hasReport ? "View / Edit Report" : "Submit Service Report"}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
  );
}
