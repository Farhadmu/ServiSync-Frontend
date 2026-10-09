"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
  Sparkles,
  Star,
  Award,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceRequest, TechnicianProfile, Assignment, RecommendationResult } from "@/types";
import { formatDate } from "@/lib/utils";
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
  const [overrideReason, setOverrideReason] = useState("");
  const [showIneligible, setShowIneligible] = useState(false);

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
        params: { status: "APPROVED", limit: 30 },
      });
      return res.data || [];
    },
  });

  // Fetch all technicians as base fallback
  const { data: technicians, isLoading: loadingTechs } = useQuery({
    queryKey: ["technicians", "available"],
    queryFn: async () => {
      const res = await api.get<TechnicianProfile[]>("/technicians", {
        params: { limit: 50 },
      });
      return res.data || [];
    },
  });

  // Fetch Smart Recommendations for selected ticket
  const {
    data: recommendations,
    isLoading: loadingRecommendations,
    isFetching: fetchingRecommendations,
  } = useQuery({
    queryKey: ["recommendations", selectedRequestId, scheduledStartAt, scheduledEndAt],
    queryFn: async () => {
      if (!selectedRequestId) return null;
      const res = await api.get<RecommendationResult>("/assignments/recommendations", {
        params: {
          serviceRequestId: selectedRequestId,
          scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt).toISOString() : undefined,
          scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt).toISOString() : undefined,
        },
      });
      return res.data;
    },
    enabled: Boolean(selectedRequestId),
    staleTime: 1000 * 30,
  });

  const selectedReq = approvedRequests?.find((r) => r.id === selectedRequestId);

  // Auto-populate appointment window from customer preference
  useEffect(() => {
    if (selectedReq?.preferredDateTime && !scheduledStartAt) {
      const start = new Date(selectedReq.preferredDateTime);
      const durationMinutes = selectedReq.serviceType?.durationMinutes || 120;
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const pad = (n: number) => String(n).padStart(2, "0");
      const formatLocal = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

      setScheduledStartAt(formatLocal(start));
      setScheduledEndAt(formatLocal(end));
    }
  }, [selectedRequestId, selectedReq]);

  // Check if non-top pick is selected
  const topPick = recommendations?.recommended?.[0];
  const isTopPickSelected = topPick && selectedTechId === topPick.technicianId;
  const isOverride = Boolean(selectedTechId) && Boolean(topPick) && !isTopPickSelected;

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
        overrideReason: isOverride && overrideReason ? overrideReason : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      toast.success("Technician assigned and dispatched successfully!");
      setSelectedRequestId("");
      setSelectedTechId("");
      setScheduledStartAt("");
      setScheduledEndAt("");
      setTechnicianNotes("");
      setOverrideReason("");
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

  const selectedTech =
    recommendations?.recommended?.find((t) => t.technicianId === selectedTechId) ||
    technicians?.find((t) => t.id === selectedTechId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Dispatch & Scheduling"
        description="Match approved service requests with certified technicians, prevent booking conflicts, and dispatch field orders."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DISPATCH FORM */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    New Dispatch Assignment
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Select an approved ticket, review skill recommendations, and dispatch
                  </CardDescription>
                </div>
                {selectedRequestId && (
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30 w-fit">
                    <Sparkles className="w-3 h-3 mr-1 text-primary animate-pulse" />
                    Smart Match Active
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Select Service Request */}
              <div className="space-y-1.5">
                <Label htmlFor="request" className="text-xs font-semibold">
                  Approved Service Request *
                </Label>
                {loadingRequests ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <select
                    id="request"
                    value={selectedRequestId}
                    onChange={(e) => {
                      setSelectedRequestId(e.target.value);
                      setSelectedTechId("");
                      setOverrideReason("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        {selectedReq.serviceType?.name} ({selectedReq.serviceType?.category?.name})
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        Est. {selectedReq.serviceType?.durationMinutes || 120} mins
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Location:</strong> {selectedReq.location || "On-site"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Customer Preferred:</strong>{" "}
                      {selectedReq.preferredDateTime
                        ? formatDate(selectedReq.preferredDateTime)
                        : "Flexible / As soon as possible"}
                    </p>
                  </div>
                )}
              </div>

              {/* Select Technician */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="technician" className="text-xs font-semibold">
                    Assigned Technician *
                  </Label>
                  {isTopPickSelected && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Top Recommended Candidate
                    </span>
                  )}
                </div>

                <select
                  id="technician"
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Select a certified technician --</option>
                  {recommendations?.recommended?.map((cand) => (
                    <option key={cand.technicianId} value={cand.technicianId}>
                      {cand.isTopPick ? "⭐ [TOP PICK] " : ""}
                      {cand.name} — {cand.score}% Match (৳{cand.hourlyRate}/hr • {cand.averageRating}★)
                    </option>
                  ))}
                  {(!recommendations || recommendations.recommended.length === 0) &&
                    technicians?.map((tech) => (
                      <option key={tech.id} value={tech.id} disabled={!tech.isAvailable}>
                        {tech.user?.name} {tech.isAvailable ? "(Available)" : "(Unavailable)"} — ৳
                        {tech.hourlyRate}/hr
                      </option>
                    ))}
                </select>
              </div>

              {/* Override Reason Field if non-top candidate is chosen */}
              {isOverride && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Manager Recommendation Override</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    You have selected a technician other than the #1 recommended candidate (
                    {topPick?.name}). Please document the reason for the audit trail.
                  </p>
                  <Input
                    placeholder="E.g., Customer requested this technician directly, or proximity preference"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              )}

              {/* Schedule Start and End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start" className="text-xs font-semibold">
                    Scheduled Start Date & Time *
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={scheduledStartAt}
                    onChange={(e) => setScheduledStartAt(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end" className="text-xs font-semibold">
                    Scheduled End Date & Time *
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={scheduledEndAt}
                    onChange={(e) => setScheduledEndAt(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Technician Dispatch Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions, gate codes, safety gear, or tool requirements..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => assignMutation.mutate()}
                  disabled={assignMutation.isPending || !selectedRequestId || !selectedTechId}
                  isLoading={assignMutation.isPending}
                  size="lg"
                  className="w-full sm:w-auto shadow-md shadow-primary/20 font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm & Dispatch Technician
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMART RECOMMENDATIONS & ROSTER */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Smart Recommendation Radar</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Multi-factor scoring: qualifications, availability & workload
                  </CardDescription>
                </div>
                {recommendations && (
                  <Badge variant="outline" className="text-[10px] w-fit">
                    {recommendations.totalEligible} Eligible / {recommendations.totalCandidates} Total
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
              {!selectedRequestId ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                  <p className="font-semibold text-foreground">Select an Approved Ticket</p>
                  <p>
                    Choose an approved service request on the left to activate deterministic skill-based
                    technician ranking and conflict prevention.
                  </p>
                </div>
              ) : loadingRecommendations || fetchingRecommendations ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : recommendations?.recommended.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>No Fully Eligible Technicians Found</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {recommendations.summary}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground">{recommendations?.summary}</p>
                  </div>

                  <div className="space-y-2.5">
                    {recommendations?.recommended?.map((cand) => (
                      <div
                        key={cand.technicianId}
                        onClick={() => setSelectedTechId(cand.technicianId)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer relative ${
                          selectedTechId === cand.technicianId
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {cand.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground text-xs">{cand.name}</span>
                                {cand.isTopPick && (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4 font-bold">
                                    TOP PICK
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">{cand.email}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              {cand.score}% Match
                            </div>
                          </div>
                        </div>

                        {/* Breakdown pills */}
                        <div className="mt-2.5 grid grid-cols-4 gap-1 text-[10px] text-center pt-2 border-t border-border/40">
                          <div className="bg-muted/60 p-1 rounded">
                            <div className="text-muted-foreground text-[9px]">Skills</div>
                            <div className="font-bold text-foreground">
                              {cand.scoreBreakdown.skillMatch}/35
                            </div>
                          </div>
                          <div className="bg-muted/60 p-1 rounded">
                            <div className="text-muted-foreground text-[9px]">Rating</div>
                            <div className="font-bold text-foreground">
                              {cand.averageRating}★
                            </div>
                          </div>
                          <div className="bg-muted/60 p-1 rounded">
                            <div className="text-muted-foreground text-[9px]">Workload</div>
                            <div className="font-bold text-foreground">
                              {cand.activeJobsCount} Jobs
                            </div>
                          </div>
                          <div className="bg-muted/60 p-1 rounded">
                            <div className="text-muted-foreground text-[9px]">Exp</div>
                            <div className="font-bold text-foreground">
                              {cand.experienceYears}y
                            </div>
                          </div>
                        </div>

                        {/* Reasons */}
                        <div className="mt-2 space-y-0.5">
                          {cand.eligibilityReasons.slice(0, 2).map((reason, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] text-muted-foreground flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2.5 flex items-center justify-between pt-1 text-[11px]">
                          <span className="font-semibold text-foreground">৳{cand.hourlyRate}/hr</span>
                          <Button
                            size="sm"
                            variant={selectedTechId === cand.technicianId ? "default" : "outline"}
                            className="h-7 text-xs px-2.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTechId(cand.technicianId);
                            }}
                          >
                            {selectedTechId === cand.technicianId ? "Selected" : "Select Candidate"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Ineligible candidates toggle */}
              {recommendations?.ineligible && recommendations.ineligible.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowIneligible(!showIneligible)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-between w-full py-1 border-t border-border/50"
                  >
                    <span>Excluded Candidates ({recommendations?.ineligible?.length || 0})</span>
                    <span className="text-[10px]">{showIneligible ? "Hide" : "Show Reasons"}</span>
                  </button>

                  {showIneligible && (
                    <div className="space-y-1.5 mt-2">
                      {recommendations?.ineligible?.map((inel) => (
                        <div
                          key={inel.technicianId}
                          className="p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px] opacity-75"
                        >
                          <div className="font-semibold text-foreground">{inel.name}</div>
                          <div className="text-[10px] text-rose-500 dark:text-rose-400 mt-0.5 space-y-0.5">
                            {inel.exclusionReasons.map((r, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading dispatch console...</div>}>
      <DispatchConsole />
    </Suspense>
  );
}
