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
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  User,
  Navigation,
  Phone,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
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

  const totalScheduled = schedule?.length || 0;
  const activeWorkOrders = schedule?.filter((s) => s.workOrder && s.workOrder.status !== "COMPLETED").length || 0;
  const completedJobs = schedule?.filter((s) => s.workOrder?.status === "COMPLETED").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Service Schedule"
        description="Chronological schedule of confirmed appointments and on-site repair windows."
      />

      {/* Schedule Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalScheduled}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">In-Progress / Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {activeWorkOrders}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Completed Field Jobs</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {completedJobs}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Card key={item.id} className="border-border/80 hover:border-primary/30 transition-all shadow-sm">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/10 text-primary shrink-0 min-w-[75px] text-center border border-primary/20">
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
                        {item.workOrder && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            WO: {item.workOrder.id.slice(0, 8)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {startTime && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
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

                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {/* Maps Route Button */}
                    {req?.location && (
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open address in Google Maps"
                        >
                          <Navigation className="mr-1 h-3.5 w-3.5 text-primary" />
                          Route
                        </a>
                      </Button>
                    )}

                    {/* Customer Phone Link */}
                    {req?.customer?.phone && (
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                        <a href={`tel:${req.customer.phone}`} title="Call Customer">
                          <Phone className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                          Call
                        </a>
                      </Button>
                    )}

                    {/* Work Order Direct Link */}
                    {item.workOrder && (
                      <Button asChild size="sm" variant="default" className="h-8 text-xs shadow-sm">
                        <Link href={`/dashboard/work-orders/${item.workOrder.id}`}>
                          Open Work Order
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
