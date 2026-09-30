"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, ArrowRight, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Assignment } from "@/types";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";

export default function TechnicianSchedulePage() {
  const { data: schedule, isLoading, error, refetch } = useQuery({
    queryKey: ["technician-schedule"],
    queryFn: async () => {
      const res = await api.get<Assignment[]>("/technicians/me/schedule");
      return res.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Service Schedule"
        description="Chronological schedule of confirmed appointments and on-site repair windows."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : schedule?.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled jobs on your calendar"
          description="Accepted assignments will be organized here by start time."
        />
      ) : (
        <div className="space-y-4">
          {schedule?.map((item) => {
            const req = item.serviceRequest;
            const startTime = item.schedule?.startAt || item.scheduledStartAt;
            const endTime = item.schedule?.endAt || item.scheduledEndAt;

            return (
              <Card key={item.id} className="border-border/80">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/10 text-primary shrink-0 min-w-[70px] text-center">
                      <Calendar className="h-5 w-5 mb-1" />
                      <span className="text-[11px] font-bold">
                        {startTime ? new Date(startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                      </span>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {req?.title || "Scheduled Field Job"}
                        </h4>
                        <Badge
                          variant={getStatusBadgeVariant(item.status).variant}
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {new Date(startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            {endTime && ` – ${new Date(endTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        )}

                        {req?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {req.location}
                          </span>
                        )}

                        {req?.customer && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {req.customer.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {item.workOrder && (
                      <Button asChild size="sm" variant="default">
                        <Link href={`/dashboard/work-orders/${item.workOrder.id}`}>
                          Work Order
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
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
