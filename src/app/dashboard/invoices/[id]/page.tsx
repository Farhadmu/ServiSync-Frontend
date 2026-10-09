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
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Receipt,
  AlertCircle,
  ExternalLink,
  Printer,
} from "lucide-react";
import { triggerPrint } from "@/lib/export";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Invoice } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { role, user } = useAuthStore();
  const [isInitiating, setIsInitiating] = useState(false);

  const { data: invoice, isLoading, error, refetch } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await api.get<Invoice>(`/invoices/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Real Stripe Payment Initiation Mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      return api.post<{ paymentId: string; sessionUrl: string; sessionId: string }>(
        "/payments/initiate",
        { invoiceId: id }
      );
    },
    onSuccess: (res) => {
      if (res.data?.sessionUrl) {
        toast.info("Redirecting to secure Stripe Checkout...");
        window.location.href = res.data.sessionUrl;
      } else {
        toast.error("Stripe session URL was not returned by backend.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to initiate payment session");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoices
          </Link>
        </Button>
        <ErrorPanel
          title="Could not load invoice"
          message={(error as any)?.message || "Invoice not found"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isPaid = invoice.status === "PAID";
  const req = invoice.workOrder?.assignment?.serviceRequest;
  const customer = req?.customer;
  const items = invoice.items || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoices
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`Issued on ${formatDate(invoice.createdAt)}`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerPrint()}
            className="h-8 text-xs font-semibold print:hidden"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Receipt
          </Button>
          <Badge
            variant={isPaid ? "success" : "warning"}
            className="text-xs px-2.5 py-1"
          >
            {isPaid ? "PAID & SETTLED" : "PAYMENT DUE"}
          </Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Itemized Bill Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">ServiSync Field Services</h3>
                  <p className="text-xs text-muted-foreground">Itemized Work & Parts Bill</p>
                </div>
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Customer & Ticket Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Billed To:</span>
                  <span className="font-bold text-foreground text-sm">{customer?.name || user?.name}</span>
                  <span className="text-muted-foreground block">{customer?.email || user?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Service Ticket:</span>
                  <span className="font-semibold text-foreground">{req?.title || "Field Repair"}</span>
                  <span className="text-muted-foreground block">
                    Location: {req?.location || "Customer premise"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[380px]">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium text-foreground">{item.description}</td>
                        <td className="p-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="p-3 text-right font-semibold text-foreground">
                          {formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, Tax, Discount, Total Due */}
              <div className="space-y-1.5 text-xs text-muted-foreground max-w-xs ml-auto pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(
                      items.reduce((s, i) => s + Number(i.amount || 0), 0),
                      invoice.currency
                    )}
                  </span>
                </div>
                {Number(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="text-foreground font-medium">
                      + {formatCurrency(invoice.taxAmount, invoice.currency)}
                    </span>
                  </div>
                )}
                {Number(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      - {formatCurrency(invoice.discountAmount, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                  <span>Total Amount Due:</span>
                  <span className="text-primary text-base">
                    {formatCurrency(invoice.dueAmount, invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Action & Status Sidebar */}
        <div className="space-y-6">
          <Card className={isPaid ? "border-emerald-300 bg-emerald-50/20" : "border-primary/40 bg-primary/5"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                {isPaid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Payment Settled
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 text-primary" />
                    Settle with Stripe
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {isPaid
                  ? `Payment received and verified on ${formatDate(invoice.paidAt)}`
                  : "Secure checkout powered by Stripe test mode"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-bold">{invoice.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={isPaid ? "success" : "warning"} className="text-[10px]">
                    {invoice.status}
                  </Badge>
                </div>
              </div>

              {!isPaid && role === "CUSTOMER" && (
                <Button
                  onClick={() => initiatePaymentMutation.mutate()}
                  isLoading={initiatePaymentMutation.isPending}
                  size="lg"
                  className="w-full font-bold shadow-md shadow-primary/25"
                >
                  Pay {formatCurrency(invoice.dueAmount, invoice.currency)} with Stripe
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}

              {isPaid && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Verified transaction. Official receipt generated.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
