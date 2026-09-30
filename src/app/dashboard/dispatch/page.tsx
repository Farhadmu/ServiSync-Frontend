"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceRequest, TechnicianProfile, Assignment } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function DispatchConsole() {
  const searchParams = useSearchParams();
  const preselectedRequestId = searchParams.get("requestId");
  const queryClient = useQueryClient();

  // Form states
  const [selectedRequestId, setSelectedRequestId] = useState(preselectedRequestId || "");
  const [selectedTechId, setSelectedTechId] = useState("");
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");

  // Fetch approved service requests ready to assign
  const { data: approvedRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["service-requests", "approved"],
    queryFn: async () => {
      const res = await api.get<ServiceRequest[]>("/service-requests", {
        params: { status: "APPROVED", limit: 20 },
      });
      return res.data || [];
    },
  });

  // Fetch all technicians
  const { data: technicians, isLoading: loadingTechs, error: techError } = useQuery({
    queryKey: ["technicians", "available"],
    queryFn: async () => {
      const res = await api.get<TechnicianProfile[]>("/technicians", {
        params: { limit: 50 },
      });
      return res.data || [];
    },
  });

  // Assign Mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRequestId) throw new Error("Please select a service request");
      if (!selectedTechId) throw new Error("Please select a technician");
      if (!scheduledStartAt || !scheduledEndAt) {
        throw new Error("Scheduled start and end times are required");
      }

      return api.post("/assignments", {
        serviceRequestId: selectedRequestId,
        technicianId: selectedTechId,
        scheduledStartAt: new Date(scheduledStartAt).toISOString(),
        scheduledEndAt: new Date(scheduledEndAt).toISOString(),
        technicianNotes: technicianNotes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast.success("Technician assigned and scheduled successfully!");
      setSelectedRequestId("");
      setSelectedTechId("");
      setScheduledStartAt("");
      setScheduledEndAt("");
      setTechnicianNotes("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to assign technician");
    },
  });

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssignment || !rescheduleStart || !rescheduleEnd) {
        throw new Error("Both start and end dates are required");
      }
      return api.patch(`/assignments/${selectedAssignment.id}/reschedule`, {
        scheduledStartAt: new Date(rescheduleStart).toISOString(),
        scheduledEndAt: new Date(rescheduleEnd).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      setRescheduleModalOpen(false);
      toast.success("Assignment rescheduled successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reschedule assignment");
    },
  });

  const selectedTech = technicians?.find((t) => t.id === selectedTechId);
  const selectedReq = approvedRequests?.find((r) => r.id === selectedRequestId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Dispatch & Scheduling"
        description="Match approved service requests with certified technicians, prevent booking conflicts, and dispatch field orders."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DISPATCH FORM */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                New Dispatch Assignment
              </CardTitle>
              <CardDescription className="text-xs">
                Select an approved ticket and dispatch an available field technician
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Select Service Request */}
              <div className="space-y-1.5">
                <Label htmlFor="request">Approved Service Request *</Label>
                {loadingRequests ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <select
                    id="request"
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Choose an approved service ticket --</option>
                    {approvedRequests?.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.title} • {req.customer?.name} ({req.serviceType?.name || "Service"})
                      </option>
                    ))}
                  </select>
                )}
                {selectedReq && (
                  <div className="p-2.5 rounded-lg bg-muted/60 text-xs text-muted-foreground mt-1">
                    <p className="font-semibold text-foreground">
                      Location: {selectedReq.location || "N/A"}
                    </p>
                    <p>Customer Preferred Time: {formatDate(selectedReq.preferredDateTime)}</p>
                  </div>
                )}
              </div>

              {/* Select Technician */}
              <div className="space-y-1.5">
                <Label htmlFor="technician">Eligible Technician *</Label>
                {loadingTechs ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <select
                    id="technician"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Select a certified technician --</option>
                    {technicians?.map((tech) => (
                      <option key={tech.id} value={tech.id} disabled={!tech.isAvailable}>
                        {tech.user?.name} {tech.isAvailable ? "(Available)" : "(Unavailable)"} — ৳
                        {tech.hourlyRate}/hr
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Schedule Start and End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start">Scheduled Start Date & Time *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={scheduledStartAt}
                    onChange={(e) => setScheduledStartAt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end">Scheduled End Date & Time *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={scheduledEndAt}
                    onChange={(e) => setScheduledEndAt(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Technician Dispatch Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions, gate codes, or tool requirements..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => assignMutation.mutate()}
                  isLoading={assignMutation.isPending}
                  size="lg"
                  className="shadow-md shadow-primary/20 font-semibold"
                >
                  Confirm & Dispatch Technician
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TECHNICIAN ROSTER & SKILL VERIFICATION */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Field Technician Roster</span>
                <Badge variant="outline" className="text-[10px]">
                  {technicians?.length || 0} Technicians
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Availability, verified skills, and hourly rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingTechs ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : technicians?.length === 0 ? (
                <EmptyState
                  icon={Wrench}
                  title="No technicians registered"
                  description="Technicians will appear once registered in the system."
                />
              ) : (
                technicians?.map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => {
                      if (tech.isAvailable) setSelectedTechId(tech.id);
                    }}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedTechId === tech.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {tech.user?.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{tech.user?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{tech.user?.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={tech.isAvailable ? "success" : "secondary"}
                        className="text-[9px]"
                      >
                        {tech.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                      <span>Rate: ৳{tech.hourlyRate}/hr</span>
                      <span>Experience: {tech.experienceYears || 2} yrs</span>
                    </div>

                    {tech.skills && tech.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tech.skills.map((s) => (
                          <span
                            key={s.id}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono"
                          >
                            {s.skill?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DispatchPage() {
  return (
    <Suspense fallback={<div>Loading dispatch console...</div>}>
      <DispatchConsole />
    </Suspense>
  );
}
