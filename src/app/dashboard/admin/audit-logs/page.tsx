"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Clock, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-audit-logs", page],
    queryFn: async () => {
      const res = await api.get<AuditLog[]>("/admin/audit-logs", {
        params: { page, limit: 15 },
      });
      return {
        logs: res.data || [],
        meta: res.meta || { page: 1, limit: 15, total: 0, totalPages: 1 },
      };
    },
  });

  const logs = data?.logs || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Audit & Activity Logs"
        description="Comprehensive audit trail recording user logins, status transitions, role modifications, and payment operations."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No audit logs recorded yet"
          description="Security and operational events will automatically appear here as users interact with the system."
        />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="p-3 text-foreground font-sans font-medium">
                      {log.user?.name || log.userId || "System Service"}
                    </td>
                    <td className="p-3 font-sans">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground font-sans">{log.entityType}</td>
                    <td className="p-3 text-muted-foreground">{log.ipAddress || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && (meta.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/60 text-xs text-muted-foreground">
              <span>
                Page {meta.page} of {meta.totalPages ?? 1} ({meta.total} logged events)
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
