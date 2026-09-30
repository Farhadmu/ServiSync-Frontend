"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ServiceReportsPage() {
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["technician-reports"],
    queryFn: async () => {
      const res = await api.get<WorkOrder[]>("/work-orders", {
        params: { limit: 20 },
      });
      return res.data || [];
    },
  });

  const completedOrders = workOrders?.filter((wo) => wo.status === "COMPLETED") || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Service Reports"
        description="Review and document completed field diagnostics, part replacements, and repair summaries."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : completedOrders.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No completed work orders yet"
          description="Once jobs are marked Completed, you can submit and manage their service reports here."
        />
      ) : (
        <div className="space-y-3">
          {completedOrders.map((wo) => (
            <Card key={wo.id} className="border-border/80">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      WO-{wo.id.slice(0, 8)}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">
                      {wo.assignment?.serviceRequest?.title || "Field Job"}
                    </h4>
                    <Badge variant={wo.serviceReport ? "success" : "warning"} className="text-[10px]">
                      {wo.serviceReport ? "Report Filed" : "Report Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customer: {wo.assignment?.serviceRequest?.customer?.name} • Completed: {formatDate(wo.completedAt)}
                  </p>
                  {wo.serviceReport?.summary && (
                    <p className="text-xs text-foreground/90 font-medium line-clamp-1 mt-1">
                      Summary: {wo.serviceReport.summary}
                    </p>
                  )}
                </div>

                <Button asChild size="sm" variant="default">
                  <Link href={`/dashboard/work-orders/${wo.id}`}>
                    {wo.serviceReport ? "View / Edit Report" : "Submit Report"}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
