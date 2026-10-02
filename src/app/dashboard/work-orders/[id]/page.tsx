"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Play,
  FileText,
  CreditCard,
  Star,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder, ServiceReport, Invoice, Feedback } from "@/types";
import { formatDate, formatCurrency, getStatusBadgeVariant } from "@/lib/utils";
import { toast } from "sonner";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { role, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Dialog States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Service Report Form State
  const [reportSummary, setReportSummary] = useState("");
  const [reportFindings, setReportFindings] = useState("");
  const [reportActions, setReportActions] = useState("");

  // Invoice Generation State (Manager / Admin)
  const [invoiceItems, setInvoiceItems] = useState([
    { description: "Standard Service & Labor", quantity: 1, unitPrice: 80 },
  ]);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Feedback State (Customer)
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const { data: workOrder, isLoading, error, refetch } = useQuery({
    queryKey: ["work-order", id],
    queryFn: async () => {
      const res = await api.get<WorkOrder>(`/work-orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Status Mutation (Technician / Manager)
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return api.patch(`/work-orders/${id}/status`, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["work-order", id] });
      toast.success(`Work order marked as ${newStatus}!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update work order status");
    },
  });

  // Service Report Mutation (Technician)
  const reportMutation = useMutation({
    mutationFn: async () => {
      return api.put(`/service-reports/work-orders/${id}`, {
        summary: reportSummary || undefined,
        findings: reportFindings || undefined,
        actionsTaken: reportActions || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order", id] });
      setReportModalOpen(false);
      toast.success("Service report saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save service report");
    },
  });

  // Invoice Generation Mutation (Manager / Admin)
  const invoiceMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/invoices/work-orders/${id}/invoice`, {
        items: invoiceItems,
        taxAmount,
        discountAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order", id] });
      setInvoiceModalOpen(false);
      toast.success("Invoice generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to generate invoice");
    },
  });

  // Feedback Mutation (Customer)
  const feedbackMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/feedback/work-orders/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order", id] });
      setFeedbackModalOpen(false);
      toast.success("Thank you! Your feedback has been submitted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit feedback");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/work-orders">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Work Orders
          </Link>
        </Button>
        <ErrorPanel
          title="Could not find work order"
          message={(error as any)?.message || "The requested work order does not exist."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const badge = getStatusBadgeVariant(workOrder.status);
  const req = workOrder.assignment?.serviceRequest;
  const tech = workOrder.assignment?.technician?.user;

  // Calculate invoice live total
  const itemsSubtotal = invoiceItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const calculatedInvoiceTotal = itemsSubtotal + Number(taxAmount || 0) - Number(discountAmount || 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/work-orders">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Work Orders
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Work Order WO-${workOrder.id.slice(0, 8)}`}
        description={`Linked Ticket: ${req?.title || "Field Order"}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={badge.variant} className="text-xs px-2.5 py-1">
            {badge.label}
          </Badge>

          {/* Technician Action Buttons */}
          {role === "TECHNICIAN" && (
            <>
              {workOrder.status === "SCHEDULED" && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("ARRIVED")}
                  isLoading={statusMutation.isPending}
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5" />
                  Mark Arrived
                </Button>
              )}
              {workOrder.status === "ARRIVED" && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("IN_PROGRESS")}
                  isLoading={statusMutation.isPending}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Start Work
                </Button>
              )}
              {workOrder.status === "IN_PROGRESS" && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={statusMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to mark this work order as COMPLETED? This will finalize the service timeline and notify the customer."
                      )
                    ) {
                      statusMutation.mutate("COMPLETED");
                    }
                  }}
                  isLoading={statusMutation.isPending}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Complete Work
                </Button>
              )}
              {workOrder.status === "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (workOrder.serviceReport) {
                      setReportSummary(workOrder.serviceReport.summary || "");
                      setReportFindings(workOrder.serviceReport.findings || "");
                      setReportActions(workOrder.serviceReport.actionsTaken || "");
                    }
                    setReportModalOpen(true);
                  }}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  {workOrder.serviceReport ? "Edit Service Report" : "Submit Service Report"}
                </Button>
              )}
            </>
          )}

          {/* Manager / Admin Invoice Action */}
          {["MANAGER", "ADMIN"].includes(role || "") &&
            workOrder.status === "COMPLETED" &&
            !workOrder.invoice && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setInvoiceModalOpen(true)}
              >
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                Generate Invoice
              </Button>
            )}

          {/* Customer Feedback Action */}
          {role === "CUSTOMER" &&
            workOrder.status === "COMPLETED" &&
            !workOrder.feedback && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFeedbackModalOpen(true)}
              >
                <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Leave Feedback
              </Button>
            )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Execution Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground block font-medium">Technician Arrived</span>
                  <span className="font-bold text-foreground">
                    {workOrder.arrivedAt ? formatDate(workOrder.arrivedAt) : "Not yet arrived"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Work Started</span>
                  <span className="font-bold text-foreground">
                    {workOrder.startedAt ? formatDate(workOrder.startedAt) : "Not started"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Work Completed</span>
                  <span className="font-bold text-emerald-600">
                    {workOrder.completedAt ? formatDate(workOrder.completedAt) : "In progress"}
                  </span>
                </div>
              </div>

              {req && (
                <div className="pt-3 space-y-2">
                  <h4 className="font-bold text-sm text-foreground">Problem Description</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {req.description || "No specific details provided."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Report Display */}
          {workOrder.serviceReport ? (
            <Card className="border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Field Service Report
                  </CardTitle>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {workOrder.serviceReport.summary && (
                  <div>
                    <span className="font-bold text-foreground block">Executive Summary:</span>
                    <p className="text-muted-foreground mt-0.5">{workOrder.serviceReport.summary}</p>
                  </div>
                )}
                {workOrder.serviceReport.findings && (
                  <div>
                    <span className="font-bold text-foreground block">Inspection Findings:</span>
                    <p className="text-muted-foreground mt-0.5">{workOrder.serviceReport.findings}</p>
                  </div>
                )}
                {workOrder.serviceReport.actionsTaken && (
                  <div>
                    <span className="font-bold text-foreground block">Actions & Repairs Taken:</span>
                    <p className="text-muted-foreground mt-0.5">{workOrder.serviceReport.actionsTaken}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            workOrder.status === "COMPLETED" && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-xs text-muted-foreground">
                  No service report has been filed yet by the technician.
                </CardContent>
              </Card>
            )
          )}

          {/* Feedback Display */}
          {workOrder.feedback && (
            <Card className="border-amber-200 bg-amber-50/20 dark:border-amber-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Customer Feedback & Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {"★".repeat(workOrder.feedback.rating)}
                  {"☆".repeat(5 - workOrder.feedback.rating)}
                  <span className="text-foreground ml-1">({workOrder.feedback.rating} / 5)</span>
                </div>
                {workOrder.feedback.comment && (
                  <p className="text-muted-foreground mt-1 italic">&ldquo;{workOrder.feedback.comment}&rdquo;</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Personnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {tech && (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {tech.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tech.name}</p>
                    <p className="text-muted-foreground">{tech.email}</p>
                  </div>
                </div>
              )}

              {req?.customer && (
                <div className="flex items-center gap-2.5 pt-3 border-t border-border">
                  <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                    {req.customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{req.customer.name}</p>
                    <p className="text-muted-foreground">{req.customer.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Card */}
          {workOrder.invoice ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Invoice Details</span>
                  <Badge variant={workOrder.invoice.status === "PAID" ? "success" : "warning"}>
                    {workOrder.invoice.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  {workOrder.invoice.invoiceNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>Total Due:</span>
                  <span className="text-primary">
                    {formatCurrency(workOrder.invoice.dueAmount, workOrder.invoice.currency)}
                  </span>
                </div>

                <Button asChild size="sm" className="w-full shadow-sm">
                  <Link href={`/dashboard/invoices/${workOrder.invoice.id}`}>
                    {workOrder.invoice.status === "PAID" ? "View Receipt" : "Proceed to Payment"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center text-xs text-muted-foreground">
                Invoice has not been generated for this work order yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* SERVICE REPORT MODAL (Technician) */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Field Service Report</DialogTitle>
            <DialogDescription>
              Document the diagnostics, physical repairs performed, and parts replaced.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="summary">Service Summary *</Label>
              <Input
                id="summary"
                placeholder="e.g. Completed AC coil cleanup and condenser inspection"
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="findings">Inspection Findings</Label>
              <Textarea
                id="findings"
                placeholder="Document observed defects, refrigerant leaks, or worn wiring..."
                value={reportFindings}
                onChange={(e) => setReportFindings(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="actions">Actions Taken</Label>
              <Textarea
                id="actions"
                placeholder="List repairs, parts installed, or adjustments made..."
                value={reportActions}
                onChange={(e) => setReportActions(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => reportMutation.mutate()}
              isLoading={reportMutation.isPending}
            >
              Save Service Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVOICE GENERATION MODAL (Manager / Admin) */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate Customer Invoice</DialogTitle>
            <DialogDescription>
              Add billable labor and parts line items to produce the official payable invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label>Itemized Billing Lines *</Label>
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Item description"
                    className="flex-1 text-xs"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].description = e.target.value;
                      setInvoiceItems(updated);
                    }}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className="w-16 text-xs"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].quantity = Number(e.target.value);
                      setInvoiceItems(updated);
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Price"
                    className="w-24 text-xs"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].unitPrice = Number(e.target.value);
                      setInvoiceItems(updated);
                    }}
                  />
                  {invoiceItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                      className="text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setInvoiceItems([...invoiceItems, { description: "Additional Parts / Labor", quantity: 1, unitPrice: 30 }])
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label htmlFor="tax">Tax Amount (৳)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount">Discount Amount (৳)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 flex items-center justify-between text-sm font-bold">
              <span>Final Total Due:</span>
              <span className="text-primary">{formatCurrency(calculatedInvoiceTotal, "BDT")}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => invoiceMutation.mutate()}
              isLoading={invoiceMutation.isPending}
            >
              Issue Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FEEDBACK MODAL (Customer) */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Service</DialogTitle>
            <DialogDescription>
              How satisfied are you with the technician&apos;s repair work?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Service Rating (1 to 5 Stars)</Label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                  >
                    <span className={star <= feedbackRating ? "text-amber-500" : "text-muted-foreground/30"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedbackComment">Comments & Suggestions</Label>
              <Textarea
                id="feedbackComment"
                placeholder="Share your experience with the technician and customer service..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => feedbackMutation.mutate()}
              isLoading={feedbackMutation.isPending}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
