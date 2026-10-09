"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/export";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Invoice } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const { role } = useAuthStore();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["invoices", { page, status }],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices", {
        params: {
          page,
          limit: 10,
          status: status || undefined,
        },
      });
      return {
        invoices: res.data || [],
        meta: res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
  });

  const invoices = data?.invoices || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "CUSTOMER" ? "My Invoices & Payments" : "Customer Invoices"}
        description={
          role === "CUSTOMER"
            ? "View itemized repair bills and pay securely using Stripe Checkout."
            : "Review billing status, issued invoices, and Stripe settlement records."
        }
      />

      {/* Filter and Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Invoices</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PAID">Paid & Settled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {invoices.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCsv(
                "servisync_invoices",
                invoices.map((inv) => ({
                  InvoiceNumber: inv.invoiceNumber,
                  TotalAmount: inv.totalAmount,
                  DueAmount: inv.dueAmount,
                  Status: inv.status,
                  CreatedAt: inv.createdAt,
                  PaidAt: inv.paidAt || "Pending",
                }))
              )
            }
            className="h-8 text-xs font-semibold"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No invoices found"
          description={
            status
              ? "No invoices match the selected filter."
              : "Invoices will be generated once work orders are completed."
          }
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isPaid = inv.status === "PAID";
            const req = inv.workOrder?.assignment?.serviceRequest;

            return (
              <Card key={inv.id} className="hover:border-primary/50 transition-all hover:shadow-sm">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {inv.invoiceNumber}
                      </span>
                      <Badge
                        variant={isPaid ? "success" : "warning"}
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {req?.title || "Field Service Order"} • Issued: {formatDate(inv.createdAt)}
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="font-bold text-primary text-sm">
                        {formatCurrency(inv.dueAmount, inv.currency)}
                      </span>
                      {inv.paidAt && (
                        <span className="text-emerald-600 font-medium">
                          Paid on {formatDate(inv.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0 w-full md:w-auto justify-start md:justify-end">
                    <Button asChild size="sm" variant={isPaid ? "outline" : "default"} className="w-full sm:w-auto">
                      <Link href={`/dashboard/invoices/${inv.id}`}>
                        {isPaid ? "View Receipt" : "Pay with Stripe"}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {meta && (meta.totalPages ?? 1) > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground text-center sm:text-left">
              <span>
                Showing page {meta.page} of {meta.totalPages ?? 1} ({meta.total} total items)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (meta.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
