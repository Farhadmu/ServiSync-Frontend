"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
  SupportTicketPriority,
  ServiceRequest,
} from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";

export default function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const isCustomer = role === "CUSTOMER";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("BOOKING_ISSUE");
  const [priority, setPriority] = useState<SupportTicketPriority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [serviceRequestId, setServiceRequestId] = useState<string>("");

  // Fetch tickets
  const { data: ticketsData, isLoading } = useQuery<{
    data: SupportTicket[];
    meta?: { total: number };
  }>({
    queryKey: ["support-tickets", statusFilter, categoryFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      const res = await api.get<any>("/support", { params });
      return {
        data: Array.isArray(res.data) ? res.data : res.data?.data || [],
        meta: res.data?.meta,
      };
    },
  });

  const tickets = ticketsData?.data || [];

  // Fetch customer's service requests for selection
  const { data: customerRequests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ["customer-service-requests-for-support"],
    queryFn: async () => {
      const res = await api.get<any>("/service-requests", { params: { limit: 50 } });
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: isCustomer && isCreateOpen,
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      subject: string;
      category: SupportTicketCategory;
      priority: SupportTicketPriority;
      description: string;
      serviceRequestId?: string;
    }) => {
      const res = await api.post("/support", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Support ticket created. Our team will assist you shortly.");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit support ticket");
    },
  });

  const resetForm = () => {
    setSubject("");
    setCategory("BOOKING_ISSUE");
    setPriority("MEDIUM");
    setDescription("");
    setServiceRequestId("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || subject.trim().length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    createMutation.mutate({
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      serviceRequestId: serviceRequestId && serviceRequestId !== "NONE" ? serviceRequestId : undefined,
    });
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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

  const getCategoryLabel = (cat: SupportTicketCategory) => {
    switch (cat) {
      case "BOOKING_ISSUE":
        return "Booking & Scheduling";
      case "TECHNICIAN_ISSUE":
        return "Technician Service";
      case "BILLING_ISSUE":
        return "Billing & Invoice";
      case "PAYMENT_ISSUE":
        return "Payment / Stripe";
      default:
        return "General Query";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            {isCustomer ? "Support & Inquiries" : "Customer Support Desk"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isCustomer
              ? "Need help with a booking, payment, or technician? Open a ticket below."
              : "Manage, respond, and resolve customer support inquiries and complaints."}
          </p>
        </div>
        {isCustomer && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Support Ticket
          </Button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <Card className="border-border/70">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket # or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_CUSTOMER">Action Required</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Categories</option>
              <option value="BOOKING_ISSUE">Booking</option>
              <option value="TECHNICIAN_ISSUE">Technician</option>
              <option value="BILLING_ISSUE">Billing</option>
              <option value="PAYMENT_ISSUE">Payment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading support tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="border-dashed border-2 py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No support tickets found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isCustomer
                  ? "Everything looks good! If you ever encounter an issue with your service, you can create a ticket here."
                  : "No tickets matching your filter criteria."}
              </p>
            </div>
            {isCustomer && (
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-2 gap-2">
                <Plus className="h-4 w-4" />
                Submit a Question or Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <Card
              key={t.id}
              className="border-border/80 hover:border-primary/50 transition-all hover:shadow-sm"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    {getStatusBadge(t.status)}
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(t.category)}
                    </Badge>
                    {t.priority === "HIGH" || t.priority === "URGENT" ? (
                      <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/20 text-xs">
                        {t.priority}
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="text-base font-semibold text-foreground">{t.subject}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/80 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(t.createdAt).toLocaleDateString()} at{" "}
                      {new Date(t.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {t._count?.messages ? (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {t._count.messages} {t._count.messages === 1 ? "message" : "messages"}
                      </span>
                    ) : null}
                    {t.serviceRequest && (
                      <span className="text-primary font-medium">
                        Related: {t.serviceRequest.title}
                      </span>
                    )}
                    {!isCustomer && t.customer && (
                      <span className="font-medium text-foreground">
                        User: {t.customer.name} ({t.customer.email})
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center w-full sm:w-auto">
                  <Button asChild variant="outline" size="sm" className="gap-2 w-full sm:w-auto justify-center">
                    <Link href={`/dashboard/support/${t.id}`}>
                      View Discussion
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Open a Support Ticket
            </DialogTitle>
            <DialogDescription>
              Describe your issue or question. Our support team responds promptly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="category-select">Issue Category *</Label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="BOOKING_ISSUE">Booking & Scheduling</option>
                <option value="TECHNICIAN_ISSUE">Technician Service</option>
                <option value="BILLING_ISSUE">Billing & Invoice</option>
                <option value="PAYMENT_ISSUE">Payment / Stripe</option>
                <option value="OTHER">Other / General Question</option>
              </select>
            </div>

            {customerRequests.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="request-select">Related Service Request (Optional)</Label>
                <select
                  id="request-select"
                  value={serviceRequestId}
                  onChange={(e) => setServiceRequestId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="NONE">None / Not Request Specific</option>
                  {customerRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title} ({req.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject-field">Subject *</Label>
              <Input
                id="subject-field"
                placeholder="e.g. Need to adjust appointment time or query billing"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-field">Detailed Description *</Label>
              <Textarea
                id="description-field"
                placeholder="Please provide details about what happened, any error messages, or questions you have..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
