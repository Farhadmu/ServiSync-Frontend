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
import { Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder } from "@/types";
import { formatDate } from "@/lib/utils";

export default function FeedbackPage() {
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["customer-feedback-orders"],
    queryFn: async () => {
      const res = await api.get<WorkOrder[]>("/work-orders", {
        params: { limit: 20 },
      });
      return res.data || [];
    },
  });

  const completedOrders = workOrders?.filter((wo) => wo.status === "COMPLETED") || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Service Feedback & Ratings"
        description="Share ratings and reviews for technicians who have completed repairs at your premises."
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
          icon={Star}
          title="No completed services ready for feedback"
          description="Once a technician finishes your repair and completes the work order, you can rate your experience here."
        />
      ) : (
        <div className="space-y-3">
          {completedOrders.map((wo) => {
            const req = wo.assignment?.serviceRequest;
            const tech = wo.assignment?.technician?.user;

            return (
              <Card key={wo.id} className="border-border/80">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">
                      {req?.title || "Field Service"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Technician: <strong className="text-foreground">{tech?.name}</strong> • Completed on {formatDate(wo.completedAt)}
                    </p>

                    {wo.feedback ? (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-amber-500 font-bold">
                        <span>{"★".repeat(wo.feedback.rating)}</span>
                        <span className="text-muted-foreground font-normal">
                          ({wo.feedback.rating}/5) &ldquo;{wo.feedback.comment}&rdquo;
                        </span>
                      </div>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">
                        Feedback Pending
                      </Badge>
                    )}
                  </div>

                  <Button asChild size="sm" variant={wo.feedback ? "outline" : "default"}>
                    <Link href={`/dashboard/work-orders/${wo.id}`}>
                      {wo.feedback ? "View Order" : "Leave Review"}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
