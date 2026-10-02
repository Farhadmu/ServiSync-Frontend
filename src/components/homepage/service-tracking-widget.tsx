"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Navigation,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Wrench,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { ServiceRequest } from "@/types";
import { formatDate } from "@/lib/utils";

interface TrackedService {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  preferredDateTime?: string;
  categoryName: string;
  serviceTypeName: string;
  assignedTechnician?: {
    name: string;
    image?: string | null;
  } | null;
  scheduledWindow?: {
    startAt: string;
    endAt: string;
  } | null;
  stages: {
    key: string;
    label: string;
    done: boolean;
    timestamp?: string;
    technicianName?: string;
  }[];
}

export function ServiceTrackingWidget() {
  const { isAuthenticated, user, role } = useAuthStore();
  const [trackingInput, setTrackingInput] = useState("");
  const [activeTrackingId, setActiveTrackingId] = useState<string>("");

  // 1. If authenticated customer, fetch their real active requests
  const { data: myRequests = [], isLoading: loadingMyRequests } = useQuery<ServiceRequest[]>({
    queryKey: ["customer-active-requests"],
    queryFn: async () => {
      const res = await api.get<ServiceRequest[]>("/service-requests", {
        params: { limit: 5 },
      });
      return res.data || [];
    },
    enabled: isAuthenticated && role === "CUSTOMER",
    staleTime: 1000 * 30,
  });

  // Effective tracking ID to query
  const targetId = activeTrackingId || (myRequests.length > 0 ? myRequests[0].id : "");

  // 2. Query tracking data
  const {
    data: trackedService,
    isLoading: loadingTracking,
    error: trackingError,
    refetch,
  } = useQuery<TrackedService | null>({
    queryKey: ["service-tracking", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const res = await api.get<TrackedService>(`/service-requests/track/${targetId}`);
      return res.data;
    },
    enabled: Boolean(targetId),
    staleTime: 1000 * 15,
  });

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setActiveTrackingId(trackingInput.trim());
    }
  };

  return (
    <section
      id="track-service"
      aria-label="Track Your Field Service"
      className="py-16 md:py-24 border-b border-border/60 relative overflow-hidden isolate"
    >
      {/* ── Background Visual Layer: Modern residential interior & arrival telemetry ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
          alt="Modern residential scheduled service arrival"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-25 dark:opacity-15 filter saturate-75"
        />
        {/* Subtle multi-layer gradient mask for guaranteed contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/88 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Authoritative Dispatch Telemetry
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Track Your Service in Real-Time
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Follow your service request from triage and technician assignment through on-site execution and verified completion.
          </p>
        </div>

        {/* Tracking Card */}
        <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden">
          {/* Top Search & Selector Bar */}
          <div className="p-4 sm:p-6 bg-muted/40 border-b border-border/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {isAuthenticated && myRequests.length > 0 ? (
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select From Your Active Requests:
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setActiveTrackingId(e.target.value)}
                  className="flex h-10 w-full md:max-w-md rounded-xl border border-input bg-card px-3 py-1.5 text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {myRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title} • {req.status} (Ref: #{req.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <form onSubmit={handleManualSearch} className="flex-1 flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter Reference ID (e.g. req_... or WO ID)..."
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="pl-9 h-10 text-xs sm:text-sm bg-card rounded-xl"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 px-4 font-semibold shrink-0">
                  Track Job
                </Button>
              </form>
            )}

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {isAuthenticated ? (
                <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
                  <Link href="/dashboard/requests">
                    <span>View All in Dashboard</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                  <Link href="/login">Sign in for Full History →</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Tracking Body */}
          <CardContent className="p-6 sm:p-8 space-y-8">
            {loadingTracking ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : trackingError || !trackedService ? (
              <div className="text-center py-10 space-y-3">
                <Wrench className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
                <h4 className="font-bold text-base text-foreground">
                  {targetId ? "No Service Found With This ID" : "Track Any Active Booking"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {targetId
                    ? "Please verify your service request reference or sign in to your customer account to view your bookings."
                    : "Enter your service reference number or sign in to follow the live diagnostic and repair milestones."}
                </p>
                {!isAuthenticated && (
                  <Button asChild size="sm" variant="default" className="mt-2 text-xs">
                    <Link href="/login">Sign In to View Your Requests</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Service Overview Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                        REF #{trackedService.id.slice(0, 8)}
                      </span>
                      <h3 className="font-bold text-base text-foreground">
                        {trackedService.title}
                      </h3>
                      <Badge variant="outline" className="text-xs uppercase font-bold">
                        {trackedService.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Category: {trackedService.categoryName} • Package: {trackedService.serviceTypeName} • Placed: {formatDate(trackedService.createdAt)}
                    </p>
                  </div>

                  {trackedService.assignedTechnician && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/80 shrink-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                        {trackedService.assignedTechnician.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          {trackedService.assignedTechnician.name}
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        </p>
                        <p className="text-[10px] text-muted-foreground">Assigned Field Specialist</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone Stepper */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Authoritative Operational Milestones:
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {trackedService.stages.map((stage, idx) => (
                      <div
                        key={stage.key}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          stage.done
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs"
                            : "bg-muted/30 border-border/60 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1.5">
                          {stage.done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <span className="h-5 w-5 rounded-full border border-muted-foreground/40 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold leading-tight">{stage.label}</p>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {stage.done ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduled Window Banner */}
                {trackedService.scheduledWindow && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-xs">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">Confirmed Arrival Window: </span>
                      <span className="text-muted-foreground">
                        {new Date(trackedService.scheduledWindow.startAt).toLocaleString()} –{" "}
                        {new Date(trackedService.scheduledWindow.endAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
