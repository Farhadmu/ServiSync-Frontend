"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Star, ArrowRight, CheckCircle2, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { WorkOrder } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<WorkOrder | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  // Query completed work orders
  const { data: workOrders = [], isLoading: loadingOrders, error: ordersError, refetch } = useQuery({
    queryKey: ["customer-feedback-orders"],
    queryFn: async () => {
      const res = await api.get<WorkOrder[]>("/work-orders", {
        params: { limit: 50 },
      });
      return res.data || [];
    },
  });

  // Query customer's submitted reviews
  const { data: myReviews = [], isLoading: loadingReviews } = useQuery<any[]>({
    queryKey: ["customer-my-reviews"],
    queryFn: async () => {
      const res = await api.get<any[]>("/feedback/my-reviews");
      return res.data || [];
    },
  });

  const completedOrders = workOrders.filter((wo) => wo.status === "COMPLETED");
  const pendingReviewOrders = completedOrders.filter((wo) => !wo.feedback);

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({
      workOrderId,
      rating,
      comment,
    }: {
      workOrderId: string;
      rating: number;
      comment?: string;
    }) => {
      return api.post(`/feedback/work-orders/${workOrderId}/feedback`, {
        rating,
        comment: comment?.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-feedback-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-my-reviews"] });
      toast.success("Thank you! Your verified review has been submitted.");
      setReviewOrder(null);
      setComment("");
      setRating(5);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit review");
    },
  });

  const handleOpenReview = (wo: WorkOrder) => {
    setReviewOrder(wo);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    submitFeedbackMutation.mutate({
      workOrderId: reviewOrder.id,
      rating,
      comment,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Customer Reviews & Ratings"
        description="Share honest feedback for completed field visits and view your past submitted ratings."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Ready for Review</span>
          {pendingReviewOrders.length > 0 && (
            <Badge className="bg-primary/15 text-primary border-primary/20 text-xs px-1.5 py-0">
              {pendingReviewOrders.length}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HISTORY")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "HISTORY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>My Submitted Reviews</span>
          {myReviews.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {myReviews.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab 1: Ready for Review */}
      {activeTab === "PENDING" && (
        <>
          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : ordersError ? (
            <ErrorPanel message={(ordersError as any)?.message} onRetry={() => refetch()} />
          ) : pendingReviewOrders.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All completed services are reviewed!"
              description="You have no pending reviews. Once another service work order is marked completed and paid, you can rate it here."
            />
          ) : (
            <div className="space-y-3">
              {pendingReviewOrders.map((wo) => {
                const req = wo.assignment?.serviceRequest;
                const tech = wo.assignment?.technician?.user;

                return (
                  <Card key={wo.id} className="border-border/80 shadow-sm hover:border-primary/40 transition-all">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {req?.title || "Field Service"}
                          </h4>
                          <Badge variant="warning" className="text-[10px]">
                            Review Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Specialist: <strong className="text-foreground">{tech?.name || "Technician"}</strong> • Completed on {formatDate(wo.completedAt)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenReview(wo)}
                        className="gap-1.5 shadow-sm w-full sm:w-auto"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Rate Experience
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: My Submitted Reviews */}
      {activeTab === "HISTORY" && (
        <>
          {loadingReviews ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : myReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No submitted reviews yet"
              description="Reviews you write for completed service visits will appear here."
            />
          ) : (
            <div className="space-y-3">
              {myReviews.map((rev) => (
                <Card key={rev.id} className="border-border/80">
                  <CardContent className="p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm text-foreground">
                          {rev.workOrder?.assignment?.serviceRequest?.title || "Service Job"}
                        </p>
                        <p className="text-muted-foreground">
                          Technician: <strong className="text-foreground">{rev.technician?.name || "Specialist"}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-foreground text-xs ml-1">({rev.rating}/5)</span>
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="p-3 rounded-lg bg-muted/40 italic text-foreground/90 text-xs">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground pt-1">
                      Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewOrder} onOpenChange={(open) => !open && setReviewOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Rate Your Service Experience
            </DialogTitle>
            <DialogDescription>
              Your verified rating directly helps maintain high service standards across ServiSync.
            </DialogDescription>
          </DialogHeader>

          {reviewOrder && (
            <form onSubmit={handleSubmitReview} className="space-y-4 py-2">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/80 text-xs space-y-1">
                <p className="font-semibold text-foreground">
                  {reviewOrder.assignment?.serviceRequest?.title || "Completed Service"}
                </p>
                <p className="text-muted-foreground">
                  Specialist: {reviewOrder.assignment?.technician?.user?.name || "Assigned Pro"}
                </p>
              </div>

              {/* Star Selection */}
              <div className="space-y-2 text-center py-2">
                <Label className="text-xs font-semibold">Select Rating (1 to 5 Stars) *</Label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1.5 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          s <= rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-500">
                  {rating === 5 && "Exceptional (5 Stars)"}
                  {rating === 4 && "Great Service (4 Stars)"}
                  {rating === 3 && "Average (3 Stars)"}
                  {rating === 2 && "Needs Improvement (2 Stars)"}
                  {rating === 1 && "Poor Experience (1 Star)"}
                </p>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <Label htmlFor="review-comment">Review Comments (Optional)</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Share details about punctuality, diagnostic accuracy, professionalism..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setReviewOrder(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitFeedbackMutation.isPending}>
                  {submitFeedbackMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
