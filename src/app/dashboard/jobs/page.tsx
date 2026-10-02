"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Assignment } from "@/types";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import { toast } from "sonner";

export default function TechnicianJobsPage() {
  const queryClient = useQueryClient();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAssignmentId, setRejectAssignmentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ["technician-jobs"],
    queryFn: async () => {
      const res = await api.get<Assignment[]>("/technicians/me/jobs");
      return res.data || [];
    },
  });

  // Respond Mutation (Accept / Reject)
  const respondMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      action,
      reason,
    }: {
      assignmentId: string;
      action: "ACCEPT" | "REJECT";
      reason?: string;
    }) => {
      return api.patch(`/assignments/${assignmentId}/respond`, {
        action,
        reason,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["technician-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["technician"] });
      setRejectModalOpen(false);
      setRejectReason("");
      toast.success(
        vars.action === "ACCEPT"
          ? "Job accepted! Work order has been initialized."
          : "Assignment has been rejected."
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to respond to assignment");
    },
  });

  const [filterTab, setFilterTab] = useState<"ALL" | "ACTION_REQUIRED" | "ACTIVE" | "COMPLETED">("ALL");

  // Calculate daily dispatch assistant metrics
  const now = new Date();
  const pendingAcceptanceJobs = jobs?.filter((j) => j.status === "SCHEDULED") || [];
  const activeJob = jobs?.find(
    (j) => j.workOrder && ["ARRIVED", "IN_PROGRESS"].includes(j.workOrder.status)
  );
  const overdueJobs = jobs?.filter(
    (j) =>
      j.scheduledStartAt &&
      new Date(j.scheduledStartAt) < now &&
      (!j.workOrder || !["COMPLETED", "CANCELLED"].includes(j.workOrder.status))
  ) || [];
  const completedJobs = jobs?.filter((j) => j.workOrder?.status === "COMPLETED") || [];

  // Filtered jobs list
  const filteredJobs = (jobs || []).filter((j) => {
    if (filterTab === "ACTION_REQUIRED") return j.status === "SCHEDULED";
    if (filterTab === "ACTIVE") return j.workOrder && ["ARRIVED", "IN_PROGRESS"].includes(j.workOrder.status);
    if (filterTab === "COMPLETED") return j.workOrder?.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Field Jobs"
        description="Review new dispatch assignments, accept or decline jobs, and track active field work orders."
      />

      {/* DAILY DISPATCH & SCHEDULE ASSISTANT HUD */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">Daily Dispatch Assistant</h3>
                <Badge variant="outline" className="text-[10px] bg-background">
                  Live Operations Feed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Automated route coordination, dispatch alerts, and assignment readiness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20">
              {pendingAcceptanceJobs.length} Need Response
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
              {completedJobs.length} Completed
            </span>
          </div>
        </div>

        {/* Overdue Warning Notification if any */}
        {overdueJobs.length > 0 && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>SLA Alert:</strong> {overdueJobs.length} assigned job(s) past scheduled arrival time. Please update status.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilterTab("ALL")}
              className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Review
            </Button>
          </div>
        )}

        {/* Active In-Progress Focus Card */}
        {activeJob && activeJob.workOrder && (
          <div className="p-3.5 rounded-xl bg-background/80 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-mono font-bold text-primary">CURRENT MISSION IN FIELD</span>
                <Badge variant="default" className="text-[10px]">
                  {activeJob.workOrder.status}
                </Badge>
              </div>
              <p className="text-sm font-bold text-foreground">{activeJob.serviceRequest?.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" /> {activeJob.serviceRequest?.location || "Premise"}
              </p>
            </div>
            <Button asChild size="sm" className="h-8 text-xs font-semibold shadow-sm shrink-0">
              <Link href={`/dashboard/work-orders/${activeJob.workOrder.id}`}>
                Resume Work Order <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-border pb-3 text-xs">
        <Button
          size="sm"
          variant={filterTab === "ALL" ? "default" : "outline"}
          onClick={() => setFilterTab("ALL")}
          className="rounded-xl h-8"
        >
          All Assignments ({jobs?.length || 0})
        </Button>
        <Button
          size="sm"
          variant={filterTab === "ACTION_REQUIRED" ? "default" : "outline"}
          onClick={() => setFilterTab("ACTION_REQUIRED")}
          className="rounded-xl h-8"
        >
          Needs Action ({pendingAcceptanceJobs.length})
        </Button>
        <Button
          size="sm"
          variant={filterTab === "ACTIVE" ? "default" : "outline"}
          onClick={() => setFilterTab("ACTIVE")}
          className="rounded-xl h-8"
        >
          Active On-Site ({activeJob ? 1 : 0})
        </Button>
        <Button
          size="sm"
          variant={filterTab === "COMPLETED" ? "default" : "outline"}
          onClick={() => setFilterTab("COMPLETED")}
          className="rounded-xl h-8"
        >
          Completed History ({completedJobs.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs matching this filter"
          description="Assignments matching your selected criteria will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const req = job.serviceRequest;
            const isPendingAcceptance = job.status === "SCHEDULED";

            return (
              <Card
                key={job.id}
                className={
                  isPendingAcceptance
                    ? "border-primary/50 bg-primary/5 shadow-md"
                    : "border-border/70"
                }
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-base text-foreground truncate">
                        {req?.title || "Field Service Job"}
                      </h4>
                      <Badge
                        variant={getStatusBadgeVariant(job.status).variant}
                        className="text-[10px]"
                      >
                        {job.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {req?.description || "No problem notes provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      {req?.customer && (
                        <span>
                          Customer: <strong className="text-foreground">{req.customer.name}</strong>
                          {req.customer.phone && (
                            <a
                              href={`tel:${req.customer.phone}`}
                              className="ml-2 text-primary hover:underline font-mono inline-flex items-center gap-1"
                              title="Call customer"
                            >
                              📞 {req.customer.phone}
                            </a>
                          )}
                        </span>
                      )}
                      {req?.location && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(req.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors hover:underline"
                          title="View on Google Maps"
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground text-primary" />
                          <span>{req.location}</span>
                        </a>
                      )}
                      {job.scheduledStartAt && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(job.scheduledStartAt)}
                        </span>
                      )}
                    </div>

                    {job.technicianNotes && (
                      <div className="p-2 rounded bg-background/80 border border-border text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Manager Note:</strong> {job.technicianNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isPendingAcceptance ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={respondMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                          onClick={() =>
                            respondMutation.mutate({
                              assignmentId: job.id,
                              action: "ACCEPT",
                            })
                          }
                          isLoading={respondMutation.isPending}
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Accept Job
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={respondMutation.isPending}
                          onClick={() => {
                            setRejectAssignmentId(job.id);
                            setRejectModalOpen(true);
                          }}
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </>
                    ) : job.workOrder ? (
                      <Button asChild size="sm" variant="default">
                        <Link href={`/dashboard/work-orders/${job.workOrder.id}`}>
                          Open Work Order
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* DECLINE ASSIGNMENT MODAL */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Service Assignment</DialogTitle>
            <DialogDescription>
              Please provide a reason so operations managers can reassign this ticket.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="rejectReason">Reason for Declining *</Label>
            <Textarea
              id="rejectReason"
              placeholder="e.g. Incompatible toolset, conflicting emergency repair, transit delay..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectAssignmentId) {
                  respondMutation.mutate({
                    assignmentId: rejectAssignmentId,
                    action: "REJECT",
                    reason: rejectReason || "Unavailable for this slot",
                  });
                }
              }}
              isLoading={respondMutation.isPending}
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
