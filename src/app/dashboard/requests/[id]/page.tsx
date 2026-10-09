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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  RotateCcw,
  Sparkles,
  CheckCircle2,
  CalendarRange,
  Loader2,
  Receipt,
  Star,
  Activity,
  Send,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import {
  ServiceRequest,
  ServiceQuote,
  TimelineStage,
  TimelineEvent,
  AppointmentSlot,
} from "@/types";
import { formatDate, formatCurrency, getStatusBadgeVariant } from "@/lib/utils";
import { TechnicianPublicProfileDialog } from "@/components/technicians/technician-public-profile-dialog";
import { toast } from "sonner";

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { role, user } = useAuthStore();
  const queryClient = useQueryClient();
  const isCustomer = role === "CUSTOMER";
  const isStaff = role === "MANAGER" || role === "ADMIN";

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Reschedule modal state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Rebook modal state
  const [rebookOpen, setRebookOpen] = useState(false);
  const [rebookDate, setRebookDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [rebookNotes, setRebookNotes] = useState("");

  // Quote response modal state (Customer)
  const [quoteChangeOpen, setQuoteChangeOpen] = useState(false);
  const [quoteChangeComment, setQuoteChangeComment] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Technician Public Profile Modal
  const [techProfileId, setTechProfileId] = useState<string | null>(null);

  // Manager Create Quote Modal
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [quoteSubtotal, setQuoteSubtotal] = useState<number>(0);
  const [quoteTax, setQuoteTax] = useState<number>(0);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteItems, setQuoteItems] = useState([
    { description: "Standard Diagnostic & Labor", quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  // 1. Fetch Service Request
  const { data: request, isLoading, error, refetch } = useQuery({
    queryKey: ["service-request", id],
    queryFn: async () => {
      const res = await api.get<ServiceRequest>(`/service-requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Authoritative Timeline Data
  const { data: timelineData } = useQuery<{
    stages: TimelineStage[];
    events: TimelineEvent[];
    auditLogs: any[];
  }>({
    queryKey: ["service-request-timeline", id],
    queryFn: async () => {
      const res = await api.get<any>(`/service-requests/${id}/timeline`);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 15000,
  });

  // 3. Fetch Service Quotes
  const { data: quotes = [] } = useQuery<ServiceQuote[]>({
    queryKey: ["service-quotes", id],
    queryFn: async () => {
      const res = await api.get<ServiceQuote[]>(`/quotes/request/${id}`);
      return res.data || [];
    },
    enabled: !!id,
  });

  // 4. Fetch Slots for Reschedule Dialog
  const { data: rescheduleSlotsData, isLoading: loadingRescheduleSlots } = useQuery<{
    slots: AppointmentSlot[];
  }>({
    queryKey: ["available-slots-reschedule", rescheduleDate, request?.serviceTypeId],
    queryFn: async () => {
      const res = await api.get<any>("/service-requests/available-slots", {
        params: {
          date: rescheduleDate,
          serviceTypeId: request?.serviceTypeId,
        },
      });
      return res.data;
    },
    enabled: rescheduleOpen && !!rescheduleDate,
  });

  const rescheduleSlots = rescheduleSlotsData?.slots || [];

  // Mutations
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
      queryClient.invalidateQueries({ queryKey: ["service-request-timeline", id] });
      setReviewModalOpen(false);
      toast.success(`Request ${reviewAction === "APPROVE" ? "Approved" : "Rejected"} successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit review");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/service-requests/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-request", id] });
      queryClient.invalidateQueries({ queryKey: ["service-request-timeline", id] });
      setCancelModalOpen(false);
      toast.success("Service request has been cancelled.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to cancel service request");
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error("Please select an available slot");
      return api.post(`/service-requests/${id}/reschedule`, {
        preferredDateTime: selectedSlot.startTime,
        reason: rescheduleReason.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-request", id] });
      queryClient.invalidateQueries({ queryKey: ["service-request-timeline", id] });
      setRescheduleOpen(false);
      setSelectedSlot(null);
      setRescheduleReason("");
      toast.success("Appointment rescheduled successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reschedule appointment");
    },
  });

  // Rebook mutation (Phase 3)
  const rebookMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/service-requests/${id}/rebook`, {
        preferredDateTime: new Date(`${rebookDate}T09:00:00.000Z`).toISOString(),
        description: rebookNotes.trim() || undefined,
      });
    },
    onSuccess: (res: any) => {
      toast.success("New service booking created!");
      setRebookOpen(false);
      const newId = res.data?.id;
      if (newId) {
        router.push(`/dashboard/requests/${newId}`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to rebook service");
    },
  });

  // Quote decision mutation (Phase 8)
  const quoteDecisionMutation = useMutation({
    mutationFn: async ({
      quoteId,
      action,
      comment,
    }: {
      quoteId: string;
      action: "ACCEPT" | "REQUEST_CHANGE" | "REJECT";
      comment?: string;
    }) => {
      return api.post(`/quotes/${quoteId}/respond`, { action, comment });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-quotes", id] });
      queryClient.invalidateQueries({ queryKey: ["service-request-timeline", id] });
      setQuoteChangeOpen(false);
      setQuoteChangeComment("");
      if (variables.action === "ACCEPT") {
        toast.success("Quote accepted! The service team has been notified to proceed.");
      } else if (variables.action === "REQUEST_CHANGE") {
        toast.success("Change request submitted. Our team will review and update the quote.");
      } else {
        toast.info("Quote declined.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to respond to quote");
    },
  });

  // Manager Create Quote Mutation
  const createQuoteMutation = useMutation({
    mutationFn: async () => {
      const total = Math.max(0, quoteSubtotal + quoteTax - quoteDiscount);
      return api.post("/quotes", {
        serviceRequestId: id,
        subtotal: quoteSubtotal,
        taxAmount: quoteTax,
        discountAmount: quoteDiscount,
        totalAmount: total,
        currency: "BDT",
        notes: quoteNotes || undefined,
        items: quoteItems.filter((i) => i.description.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-quotes", id] });
      setCreateQuoteOpen(false);
      toast.success("Service quote created and sent to customer for review!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create quote");
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
    isCustomer &&
    ["PENDING", "UNDER_REVIEW"].includes(request.status) &&
    !activeAssignment;

  const canReschedule =
    isCustomer &&
    ["PENDING", "UNDER_REVIEW", "APPROVED", "ASSIGNED", "SCHEDULED"].includes(request.status);

  const canRebook =
    isCustomer && ["COMPLETED", "CANCELLED", "REJECTED", "CLOSED"].includes(request.status);

  const canManagerReview =
    isStaff && ["PENDING", "UNDER_REVIEW"].includes(request.status);

  const canManagerDispatch =
    isStaff && request.status === "APPROVED" && !activeAssignment;

  const latestQuote = quotes[0];

  // 30-Day Service Warranty
  const isCompleted =
    ["COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(request.status) ||
    activeAssignment?.workOrder?.status === "COMPLETED";
  const completedDate = request.updatedAt ? new Date(request.updatedAt) : new Date(request.createdAt);
  const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
  const warrantyDaysTotal = 30;
  const warrantyDaysRemaining = Math.max(0, warrantyDaysTotal - daysSinceCompletion);
  const isWarrantyActive = isCompleted && warrantyDaysRemaining > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
      </div>

      <PageHeader
        title={request.title}
        description={`Reference: ${request.id} • Created on ${formatDate(request.createdAt)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={badge.variant} className="text-xs px-2.5 py-1">
            {badge.label}
          </Badge>

          {canReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRescheduleOpen(true)}
              className="gap-1.5 text-xs shadow-sm"
            >
              <CalendarRange className="h-3.5 w-3.5 text-primary" />
              Reschedule Visit
            </Button>
          )}

          {canRebook && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setRebookOpen(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Rebook Service
            </Button>
          )}

          {canCustomerCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="text-xs"
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
              className="text-xs"
            >
              Review Request
            </Button>
          )}

          {canManagerDispatch && (
            <Button asChild size="sm" variant="default" className="shadow-sm text-xs">
              <Link href={`/dashboard/dispatch?requestId=${request.id}`}>
                Dispatch Technician
              </Link>
            </Button>
          )}

          {isStaff && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateQuoteOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Receipt className="h-3.5 w-3.5 text-primary" />
              Create / Revise Quote
            </Button>
          )}
        </div>
      </PageHeader>

      {/* PHASE 2: Authoritative Progress Timeline */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              Live Service Milestones & Progress Tracker
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Current Status: <strong className="text-foreground">{request.status}</strong>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Horizontal / Grid Stage Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { key: "SUBMITTED", label: "Submitted", done: true },
              {
                key: "REVIEW",
                label: "Review",
                done: ["UNDER_REVIEW", "APPROVED", "ASSIGNED", "SCHEDULED", "COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(request.status),
              },
              {
                key: "APPROVED",
                label: "Approved",
                done: ["APPROVED", "ASSIGNED", "SCHEDULED", "COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(request.status),
              },
              {
                key: "ASSIGNED",
                label: "Assigned",
                done: Boolean(activeAssignment),
              },
              {
                key: "SCHEDULED",
                label: "Scheduled",
                done: Boolean(activeAssignment?.schedule),
              },
              {
                key: "IN_PROGRESS",
                label: "In Progress",
                done: ["IN_PROGRESS", "COMPLETED"].includes(activeAssignment?.workOrder?.status || ""),
              },
              {
                key: "COMPLETED",
                label: "Completed",
                done: activeAssignment?.workOrder?.status === "COMPLETED" || ["COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(request.status),
              },
              {
                key: "PAID",
                label: "Payment",
                done: request.status === "PAID" || activeAssignment?.workOrder?.invoice?.status === "PAID",
              },
            ].map((step, i) => (
              <div
                key={step.key}
                className={`p-2 rounded-lg border text-center transition-all ${
                  step.done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "bg-muted/30 border-border/60 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/40 text-[10px] flex items-center justify-center">
                      {i + 1}
                    </span>
                  )}
                </div>
                <p className="text-[11px] truncate">{step.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Event Log */}
          {timelineData?.events && timelineData.events.length > 0 && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Authoritative Event History:
              </p>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {timelineData.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start justify-between p-2.5 rounded-lg border border-border/70 bg-card text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {evt.title}
                      </p>
                      <p className="text-muted-foreground">{evt.description}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 pl-2">
                      {new Date(evt.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer 30-Day Service Warranty Banner */}
      {isCompleted && (
        <Card
          className={`border ${
            isWarrantyActive
              ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20"
              : "border-slate-300 dark:border-slate-800 bg-muted/40"
          }`}
        >
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2.5 rounded-xl ${
                  isWarrantyActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-foreground">
                    ServiSync 30-Day Labor & Service Warranty
                  </h4>
                  <Badge variant={isWarrantyActive ? "success" : "outline"} className="text-[10px]">
                    {isWarrantyActive ? `${warrantyDaysRemaining} Days Remaining` : "Warranty Expired"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isWarrantyActive
                    ? `Covers defect recurrence and parts replacement till ${new Date(
                        completedDate.getTime() + warrantyDaysTotal * 86400000
                      ).toLocaleDateString()}.`
                    : "The 30-day labor guarantee period for this job has concluded."}
                </p>
              </div>
            </div>

            {isWarrantyActive && isCustomer && (
              <Button asChild size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <Link
                  href={`/dashboard/requests/new?category=${encodeURIComponent(
                    request.serviceType?.category?.name || "General"
                  )}&description=${encodeURIComponent(
                    `Warranty follow-up request regarding Request #${request.id.slice(0, 8)}. Please dispatch technician for inspection.`
                  )}`}
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Request Warranty Follow-up
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* PHASE 8: Estimate & Service Quotes Section */}
      {latestQuote && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold">
                  Official Service Quote ({latestQuote.quoteNumber})
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Version {latestQuote.version}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {latestQuote.status === "PENDING" && (
                  <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                    Awaiting Customer Approval
                  </Badge>
                )}
                {latestQuote.status === "ACCEPTED" && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                    Quote Accepted
                  </Badge>
                )}
                {latestQuote.status === "CHANGE_REQUESTED" && (
                  <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30">
                    Revision Requested
                  </Badge>
                )}
                {latestQuote.status === "EXPIRED" && (
                  <Badge variant="secondary">Expired</Badge>
                )}
              </div>
            </div>
            <CardDescription className="text-xs">
              Itemized estimate prepared for this service request. No automatic charges; payments
              continue through Stripe only when work is completed.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {latestQuote.items && (latestQuote.items as any[]).length > 0 && (
              <div className="rounded-lg border border-border/80 overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[380px]">
                  <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(latestQuote.items as any[]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{item.description}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right">
                          {formatCurrency(item.unitPrice, latestQuote.currency)}
                        </td>
                        <td className="p-2.5 text-right font-semibold">
                          {formatCurrency(item.amount, latestQuote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
              <div className="space-y-1 text-xs text-muted-foreground max-w-sm">
                {latestQuote.notes && <p className="italic">Note: &ldquo;{latestQuote.notes}&rdquo;</p>}
                {latestQuote.expiresAt && (
                  <p>Valid until: {new Date(latestQuote.expiresAt).toLocaleDateString()}</p>
                )}
                {latestQuote.customerComment && (
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    Customer feedback: &ldquo;{latestQuote.customerComment}&rdquo;
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-right min-w-[200px] border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">
                    {formatCurrency(latestQuote.subtotal, latestQuote.currency)}
                  </span>
                </div>
                {Number(latestQuote.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>+{formatCurrency(latestQuote.taxAmount, latestQuote.currency)}</span>
                  </div>
                )}
                {Number(latestQuote.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(latestQuote.discountAmount, latestQuote.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-1">
                  <span>Total Estimate:</span>
                  <span className="text-primary text-base">
                    {formatCurrency(latestQuote.totalAmount, latestQuote.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Decision Actions */}
            {isCustomer && latestQuote.status === "PENDING" && (
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedQuoteId(latestQuote.id);
                    setQuoteChangeOpen(true);
                  }}
                  className="text-xs"
                >
                  Request Changes
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    quoteDecisionMutation.mutate({ quoteId: latestQuote.id, action: "ACCEPT" })
                  }
                  disabled={quoteDecisionMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve Quote
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Details Grid */}
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

        {/* Sidebar Info: Customer, Technician & Location */}
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
                  <p className="font-semibold text-foreground">Service Address (Snapshotted)</p>
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

          {/* Assigned Technician Card (with Public Profile Link) */}
          <Card className={activeAssignment ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Assigned Specialist</span>
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
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {activeAssignment.technician.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {activeAssignment.technician.user.name}
                      </p>
                      <p className="text-muted-foreground">Certified Field Pro</p>
                    </div>
                  </div>

                  {/* Public profile button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => setTechProfileId(activeAssignment.technicianId)}
                  >
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    View Technician Profile & Reviews
                  </Button>

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
                    ? "Awaiting review before technician assignment."
                    : request.status === "APPROVED"
                    ? "Approved. Dispatch team is scheduling a technician."
                    : "No active technician assigned."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technician Public Profile Dialog */}
      <TechnicianPublicProfileDialog
        technicianId={techProfileId}
        isOpen={!!techProfileId}
        onClose={() => setTechProfileId(null)}
      />

      {/* Reschedule Visit Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              Reschedule Service Visit
            </DialogTitle>
            <DialogDescription>
              Select a new date and an available technician arrival slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="resched-date">Select New Date *</Label>
              <Input
                id="resched-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Available Arrival Slots *</Label>
              {loadingRescheduleSlots ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Checking technician schedules...
                </div>
              ) : rescheduleSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  No slots available on this date. Please pick another date.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {rescheduleSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 font-bold"
                            : slot.available
                            ? "border-border hover:border-primary/40 bg-card"
                            : "border-border/40 bg-muted/40 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span>{slot.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {slot.available ? "Available" : slot.reason || "Full"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resched-reason">Reason for Rescheduling (Optional)</Label>
              <Input
                id="resched-reason"
                placeholder="e.g. Will be away during morning hours"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => rescheduleMutation.mutate()}
              disabled={!selectedSlot || rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? "Updating..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rebook Service Modal */}
      <Dialog open={rebookOpen} onOpenChange={setRebookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Rebook Service
            </DialogTitle>
            <DialogDescription>
              Create a brand new service request using your saved category and service location.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
              <p className="font-semibold text-foreground">
                Service: {request.serviceType?.name}
              </p>
              <p className="text-muted-foreground">Location: {request.location}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rebook-date">Preferred Date *</Label>
              <Input
                id="rebook-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={rebookDate}
                onChange={(e) => setRebookDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rebook-notes">Updated Problem Notes (Optional)</Label>
              <Textarea
                id="rebook-notes"
                placeholder="Describe any new symptoms or routine maintenance requirements..."
                value={rebookNotes}
                onChange={(e) => setRebookNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRebookOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => rebookMutation.mutate()}
              disabled={rebookMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {rebookMutation.isPending ? "Creating..." : "Confirm & Rebook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Change Request Dialog */}
      <Dialog open={quoteChangeOpen} onOpenChange={setQuoteChangeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Quote Changes</DialogTitle>
            <DialogDescription>
              Tell our team what adjustments or clarifications you require for this estimate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="change-comments">Comments / Requested Modifications *</Label>
            <Textarea
              id="change-comments"
              placeholder="e.g. Please clarify part replacement costs or adjust scope..."
              value={quoteChangeComment}
              onChange={(e) => setQuoteChangeComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteChangeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedQuoteId) return;
                quoteDecisionMutation.mutate({
                  quoteId: selectedQuoteId,
                  action: "REQUEST_CHANGE",
                  comment: quoteChangeComment,
                });
              }}
              disabled={!quoteChangeComment.trim() || quoteDecisionMutation.isPending}
            >
              Submit Change Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Create / Revise Quote Modal */}
      <Dialog open={createQuoteOpen} onOpenChange={setCreateQuoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create / Revise Service Quote</DialogTitle>
            <DialogDescription>
              Generate an official quote for the customer to review and accept before work begins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label>Line Items</Label>
              {quoteItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-6 h-8 text-xs"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...quoteItems];
                      copy[idx].description = e.target.value;
                      setQuoteItems(copy);
                    }}
                  />
                  <Input
                    className="col-span-2 h-8 text-xs text-center"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...quoteItems];
                      copy[idx].quantity = Number(e.target.value) || 1;
                      copy[idx].amount = copy[idx].quantity * copy[idx].unitPrice;
                      setQuoteItems(copy);
                      const sum = copy.reduce((acc, curr) => acc + curr.amount, 0);
                      setQuoteSubtotal(sum);
                    }}
                  />
                  <Input
                    className="col-span-4 h-8 text-xs text-right"
                    type="number"
                    min="0"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const copy = [...quoteItems];
                      copy[idx].unitPrice = Number(e.target.value) || 0;
                      copy[idx].amount = copy[idx].quantity * copy[idx].unitPrice;
                      setQuoteItems(copy);
                      const sum = copy.reduce((acc, curr) => acc + curr.amount, 0);
                      setQuoteSubtotal(sum);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 mt-1"
                onClick={() =>
                  setQuoteItems([
                    ...quoteItems,
                    { description: "Spare Part / Additional Labor", quantity: 1, unitPrice: 0, amount: 0 },
                  ])
                }
              >
                + Add Item
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div>
                <Label htmlFor="q-sub">Subtotal (BDT)</Label>
                <Input
                  id="q-sub"
                  type="number"
                  value={quoteSubtotal}
                  onChange={(e) => setQuoteSubtotal(Number(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="q-tax">Tax (BDT)</Label>
                <Input
                  id="q-tax"
                  type="number"
                  value={quoteTax}
                  onChange={(e) => setQuoteTax(Number(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="q-disc">Discount (BDT)</Label>
                <Input
                  id="q-disc"
                  type="number"
                  value={quoteDiscount}
                  onChange={(e) => setQuoteDiscount(Number(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center font-bold text-sm">
              <span>Total Estimated:</span>
              <span className="text-primary text-base">
                ৳{Math.max(0, quoteSubtotal + quoteTax - quoteDiscount).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="q-notes">Notes for Customer</Label>
              <Textarea
                id="q-notes"
                placeholder="e.g. Includes 30-day warranty on parts..."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateQuoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createQuoteMutation.mutate()}
              disabled={createQuoteMutation.isPending || quoteSubtotal <= 0}
            >
              {createQuoteMutation.isPending ? "Creating..." : "Issue Quote to Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Review Modal */}
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
              disabled={reviewMutation.isPending}
            >
              Confirm {reviewAction === "APPROVE" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Cancel Modal */}
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
              disabled={cancelMutation.isPending}
            >
              Yes, Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
