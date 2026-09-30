"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceRequest, ServiceRequestStatus } from "@/types";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Invoiced", value: "INVOICED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function ServiceRequestsPage() {
  const { role } = useAuthStore();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["service-requests", { page, status, search }],
    queryFn: async () => {
      const res = await api.get<ServiceRequest[]>("/service-requests", {
        params: {
          page,
          limit: 10,
          status: status || undefined,
          search: search || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      return {
        requests: res.data || [],
        meta: res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const requests = data?.requests || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "CUSTOMER" ? "My Service Requests" : "All Service Requests"}
        description={
          role === "CUSTOMER"
            ? "Track the live status of your repair and maintenance requests."
            : "Review, approve, and monitor all customer service requests across departments."
        }
      >
        {role === "CUSTOMER" && (
          <Button asChild size="sm">
            <Link href="/dashboard/requests/new">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              New Service Request
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:inline-block" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No service requests found"
          description={
            status || search
              ? "Try adjusting your filters or search terms."
              : "No service requests have been submitted yet."
          }
          actionLabel={role === "CUSTOMER" ? "Create Request" : undefined}
          onAction={
            role === "CUSTOMER"
              ? () => (window.location.href = "/dashboard/requests/new")
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const badge = getStatusBadgeVariant(req.status);
            return (
              <Card
                key={req.id}
                className="hover:border-primary/50 transition-all hover:shadow-sm"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {req.title}
                      </h4>
                      <Badge variant={badge.variant} className="text-[10px]">
                        {badge.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {req.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      <span className="font-medium text-foreground">
                        {req.serviceType?.category?.name || "Service"}:{" "}
                        <span className="text-primary font-semibold">
                          {req.serviceType?.name || "Standard"}
                        </span>
                      </span>

                      {req.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {req.location}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(req.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button asChild size="sm" variant="default" className="shadow-sm">
                      <Link href={`/dashboard/requests/${req.id}`}>
                        View Details
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span>
                Showing page {meta.page} of {meta.totalPages} ({meta.total} total items)
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
                  disabled={page >= meta.totalPages}
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
