"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Clock, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Notification } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: async () => {
      const res = await api.get<{ notifications: Notification[]; unreadCount: number }>(
        "/notifications",
        { params: { unreadOnly: unreadOnly ? "true" : undefined, limit: 30 } }
      );
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notifications & Alerts"
        description="Stay updated with real-time assignment changes, approvals, and invoice issuances."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? "Showing Unread Only" : "Show Unread Only"}
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            unreadOnly
              ? "You have caught up with all alerts."
              : "Notifications regarding your service tickets will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-all ${
                !n.isRead ? "border-primary/40 bg-primary/5" : "border-border/70"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                    {!n.isRead && (
                      <Badge variant="default" className="text-[9px]">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(n.createdAt)}
                  </p>
                </div>

                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markReadMutation.mutate(n.id)}
                    isLoading={markReadMutation.isPending}
                    className="h-8 text-xs shrink-0"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
