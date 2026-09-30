"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder } from "@/types";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";

export default function WorkOrdersPage() {
  const { role } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["work-orders", page],
    queryFn: async () => {
      const res = await api.get<WorkOrder[]>("/work-orders", {
        params: { page, limit: 10 },
      });
      return {
        workOrders: res.data || [],
        meta: res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
  });

  const workOrders = data?.workOrders || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Work Orders"
        description="Monitor active field dispatches, on-site service reports, and status transitions."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : workOrders.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No work orders recorded"
          description="Work orders are automatically generated when technicians accept dispatched assignments."
        />
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => {
            const badge = getStatusBadgeVariant(wo.status);
            const req = wo.assignment?.serviceRequest;
            const tech = wo.assignment?.technician?.user;

            return (
              <Card key={wo.id} className="hover:border-primary/50 transition-all hover:shadow-sm">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary">
                        WO-{wo.id.slice(0, 8)}
                      </span>
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {req?.title || "Service Work Order"}
                      </h4>
                      <Badge variant={badge.variant} className="text-[10px]">
                        {badge.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      {tech && (
                        <span>
                          Technician: <strong className="text-foreground">{tech.name}</strong>
                        </span>
                      )}
                      {req?.customer && (
                        <span>
                          Customer: <strong className="text-foreground">{req.customer.name}</strong>
                        </span>
                      )}
                      <span>Created: {formatDate(wo.createdAt)}</span>
                      {wo.completedAt && (
                        <span className="text-emerald-600 font-medium">
                          Completed: {formatDate(wo.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {wo.invoice && (
                      <Badge variant={wo.invoice.status === "PAID" ? "success" : "default"}>
                        Invoice: {wo.invoice.status}
                      </Badge>
                    )}
                    <Button asChild size="sm" variant="default" className="shadow-sm">
                      <Link href={`/dashboard/work-orders/${wo.id}`}>
                        View Order
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {meta && (meta.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span>
                Showing page {meta.page} of {meta.totalPages ?? 1} ({meta.total} total items)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (meta.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
