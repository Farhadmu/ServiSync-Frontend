"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { SupportTicket, SupportTicketStatus } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Shield,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();
  const { user, role } = useAuthStore();
  const isCustomer = role === "CUSTOMER";

  const [replyMessage, setReplyMessage] = useState("");

  // Query ticket details
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery<SupportTicket>({
    queryKey: ["support-ticket", ticketId],
    queryFn: async () => {
      const res = await api.get<SupportTicket>(`/support/${ticketId}`);
      return res.data;
    },
    refetchInterval: 10000,
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post(`/support/${ticketId}/messages`, { message });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", ticketId] });
      setReplyMessage("");
      toast.success("Message sent");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send message");
    },
  });

  // Status update mutation (for closing or staff transition)
  const statusMutation = useMutation({
    mutationFn: async (status: SupportTicketStatus) => {
      const res = await api.patch(`/support/${ticketId}/status`, { status });
      return res.data;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success(`Ticket marked as ${status.toLowerCase()}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update ticket status");
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate(replyMessage.trim());
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">In Progress</Badge>;
      case "WAITING_FOR_CUSTOMER":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30">Action Required</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading ticket conversation...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Ticket Not Found</h2>
        <p className="text-sm text-muted-foreground">
          This ticket does not exist or you do not have permission to view it.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/support">Back to Support</Link>
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/dashboard/support">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {ticket.ticketNumber}
              </span>
              {getStatusBadge(ticket.status)}
              <Badge variant="outline" className="text-xs">
                {ticket.category.replace("_", " ")}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => statusMutation.mutate("CLOSED")}
              disabled={statusMutation.isPending}
              className="text-xs gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Close Ticket
            </Button>
          )}

          {!isCustomer && ticket.status !== "RESOLVED" && !isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => statusMutation.mutate("RESOLVED")}
              disabled={statusMutation.isPending}
              className="text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Linked Service Request Card (if any) */}
      {ticket.serviceRequest && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Related Service Request</p>
                <p className="text-sm font-semibold text-foreground">
                  {ticket.serviceRequest.title}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href={`/dashboard/requests/${ticket.serviceRequest.id}`}>
                View Service Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Discussion Thread
        </h3>

        <div className="space-y-3">
          {ticket.messages && ticket.messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const isStaff = msg.isStaffReply;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 p-4 rounded-xl border transition-all ${
                  isStaff
                    ? "bg-primary/5 border-primary/25 ml-4 sm:ml-8"
                    : isMe
                    ? "bg-card border-border/80 mr-4 sm:mr-8"
                    : "bg-muted/40 border-border/60 mr-4 sm:mr-8"
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarImage src={msg.sender?.image || undefined} />
                  <AvatarFallback
                    className={`text-xs font-bold ${
                      isStaff ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {msg.sender?.name ? msg.sender.name.slice(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1.5 flex-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {isMe ? "You" : msg.sender?.name || "Support Staff"}
                      </span>
                      {isStaff && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/15 text-primary border-primary/20">
                          Support Agent
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString()} at{" "}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply Box */}
      {isClosed ? (
        <Card className="bg-muted/40 border-dashed text-center p-6">
          <p className="text-sm text-muted-foreground">
            This ticket is closed. If you have additional questions or issues, please open a new ticket.
          </p>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <form onSubmit={handleSendReply} className="p-4 space-y-3">
            <Textarea
              placeholder="Type your reply here..."
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="resize-none focus-visible:ring-primary"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                Our support team is notified automatically of all replies.
              </span>
              <Button
                type="submit"
                disabled={!replyMessage.trim() || replyMutation.isPending}
                className="gap-2"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Reply
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
