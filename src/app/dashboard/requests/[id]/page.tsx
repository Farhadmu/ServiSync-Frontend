"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusTimeline } from "@/components/ui/status-timeline";
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
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
  FileText,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceRequest } from "@/types";
import { formatDate, formatCurrency, getStatusBadgeVariant } from "@/lib/utils";
import { toast } from "sonner";

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { role, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Review modal state (Manager / Admin)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Cancel modal state (Customer)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data: request, isLoading, error, refetch } = useQuery({
    queryKey: ["service-request", id],
    queryFn: async () => {
      const res = await api.get<ServiceRequest>(`/service-requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/service-requests/${id}/review`, {
        action: reviewAction,
        adminNotes: adminNotes || undefined,
        rejectionReason: reviewAction === "REJECT" ? rejectionReason : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-request", id] });
      setReviewModalOpen(false);
      toast.success(`Request ${reviewAction === "APPROVE" ? "Approved" : "Rejected"} successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit review");
    },
  });

  // Cancel Mutation (Customer)
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/service-requests/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-request", id] });
      setCancelModalOpen(false);
      toast.success("Service request has been cancelled.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to cancel service request");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
        <ErrorPanel
          title="Could not find service request"
          message={(error as any)?.message || "The requested service ticket does not exist."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const badge = getStatusBadgeVariant(request.status);
  const activeAssignment = request.assignments?.find((a) => a.status !== "CANCELLED");
  const canCustomerCancel =
    role === "CUSTOMER" &&
    ["PENDING", "UNDER_REVIEW"].includes(request.status) &&
    !activeAssignment;

  const canManagerReview =
    ["MANAGER", "ADMIN"].includes(role || "") &&
    ["PENDING", "UNDER_REVIEW"].includes(request.status);

  const canManagerDispatch =
    ["MANAGER", "ADMIN"].includes(role || "") &&
    request.status === "APPROVED" &&
    !activeAssignment;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
      </div>

      <PageHeader
        title={request.title}
        description={`Ticket ID: ${request.id} • Created on ${formatDate(request.createdAt)}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant} className="text-xs px-2.5 py-1">
            {badge.label}
          </Badge>

          {canCustomerCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Request
            </Button>
          )}

          {canManagerReview && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setReviewAction("APPROVE");
                setReviewModalOpen(true);
              }}
            >
              Review Request
            </Button>
          )}

          {canManagerDispatch && (
            <Button asChild size="sm" variant="default" className="shadow-sm">
              <Link href={`/dashboard/dispatch?requestId=${request.id}`}>
                Dispatch Technician
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Real-time Status Lifecycle Timeline */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Lifecycle Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStatus={request.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Issue Description & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {request.description || "No detailed description provided by customer."}
              </p>

              <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Service Category:</span>
                  <span className="font-bold text-foreground">
                    {request.serviceType?.category?.name || "Standard Category"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Service Type:</span>
                  <span className="font-bold text-primary">
                    {request.serviceType?.name || "General Maintenance"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Base Standard Fee:</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(request.serviceType?.basePrice, "BDT")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Estimated Duration:</span>
                  <span className="font-bold text-foreground">
                    {request.serviceType?.durationMinutes ? `${request.serviceType.durationMinutes} mins` : "Approx 90 mins"}
                  </span>
                </div>
              </div>

              {request.adminNotes && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300 text-xs">
                  <span className="font-bold block mb-0.5">Manager Review Notes:</span>
                  {request.adminNotes}
                </div>
              )}

              {request.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300 text-xs">
                  <span className="font-bold block mb-0.5">Rejection Reason:</span>
                  {request.rejectionReason}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info: Customer & Technician */}
        <div className="space-y-6">
          {/* Location & Preferred Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Schedule & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Service Address</p>
                  <p className="text-muted-foreground mt-0.5">{request.location || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-border">
                <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Customer Preferred Time</p>
                  <p className="text-muted-foreground mt-0.5">{formatDate(request.preferredDateTime)}</p>
                </div>
              </div>

              {request.customer && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-border">
                  <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Customer Contact</p>
                    <p className="text-foreground">{request.customer.name}</p>
                    <p className="text-muted-foreground">{request.customer.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Technician Card */}
          <Card className={activeAssignment ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Assigned Technician</span>
                {activeAssignment && (
                  <Badge variant="success" className="text-[10px]">
                    {activeAssignment.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {activeAssignment && activeAssignment.technician?.user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {activeAssignment.technician.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {activeAssignment.technician.user.name}
                      </p>
                      <p className="text-muted-foreground">{activeAssignment.technician.user.email}</p>
                    </div>
                  </div>

                  {activeAssignment.technicianNotes && (
                    <div className="p-2.5 rounded-lg bg-background border border-border">
                      <p className="font-semibold text-muted-foreground mb-0.5">Dispatch Instructions:</p>
                      <p>{activeAssignment.technicianNotes}</p>
                    </div>
                  )}

                  {activeAssignment.workOrder && (
                    <div className="pt-2 border-t border-border">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/dashboard/work-orders/${activeAssignment.workOrder.id}`}>
                          View Work Order & Report
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {request.status === "PENDING"
                    ? "Awaiting manager approval before assignment."
                    : request.status === "APPROVED"
                    ? "Approved. Dispatch team is scheduling a technician."
                    : "No active technician assigned."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MANAGER REVIEW MODAL */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Service Request</DialogTitle>
            <DialogDescription>
              Evaluate this customer request to approve for technician assignment or reject with reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Review Decision</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setReviewAction("APPROVE")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewAction === "APPROVE"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mb-1 text-emerald-600" />
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("REJECT")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewAction === "REJECT"
                      ? "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive font-bold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <XCircle className="h-4 w-4 mb-1 text-destructive" />
                  Reject Request
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminNotes">Internal Review Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Notes for operations and dispatch team..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {reviewAction === "REJECT" && (
              <div className="space-y-1.5">
                <Label htmlFor="rejectionReason">Rejection Reason for Customer *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explain why this service request cannot be fulfilled..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === "APPROVE" ? "default" : "destructive"}
              onClick={() => reviewMutation.mutate()}
              isLoading={reviewMutation.isPending}
            >
              Confirm {reviewAction === "APPROVE" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CUSTOMER CANCEL MODAL */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Service Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this request? This action cannot be undone once confirmed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              isLoading={cancelMutation.isPending}
            >
              Yes, Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
