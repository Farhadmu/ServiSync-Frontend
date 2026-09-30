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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Field Jobs"
        description="Review new dispatch assignments, accept or decline jobs, and track active field work orders."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : jobs?.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs currently assigned"
          description="When operations managers assign customer tickets to your queue, they will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => {
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
                        </span>
                      )}
                      {req?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {req.location}
                        </span>
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
