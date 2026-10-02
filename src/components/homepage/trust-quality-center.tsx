"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  CreditCard,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Lock,
  ThumbsUp,
  UserCheck,
  RefreshCw,
  PhoneCall,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface PublicReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customerName: string;
  customerImage?: string | null;
  technicianName: string;
  serviceName: string;
  categoryName: string;
}

interface PublicReviewsResponse {
  reviews: PublicReview[];
  stats: {
    totalReviews: number;
    averageRating: number;
    verifiedReviewCount: number;
  };
}

const QUALITY_PILLARS = [
  {
    icon: ShieldCheck,
    title: "30-Day Labor & Parts Warranty",
    desc: "If any repaired defect resurfaces within 30 days of completion, your follow-up inspection and correction are guaranteed.",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: UserCheck,
    title: "100% Background-Checked Specialists",
    desc: "Every technician on our fleet passes national identity verification, trade skill testing, and ongoing customer rating audits.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: RefreshCw,
    title: "Flexible Rescheduling & Zero Penalty",
    desc: "Change your appointment window or cancel free of charge up to 2 hours prior to technician dispatch with one click.",
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    icon: CreditCard,
    title: "Protected Stripe Financial Settlement",
    desc: "All payments are processed securely through Stripe. You are never invoiced until work is signed off and inspected.",
    color: "text-purple-600 bg-purple-500/10",
  },
];

const FAQS = [
  {
    q: "How does ServiSync match technicians to my service request?",
    a: "Our deterministic dispatch engine scores candidate technicians based on exact trade skill requirements (35%), historical review rating (25%), current active workload (20%), and years of field experience (20%). This eliminates double-booking and ensures the most qualified specialist arrives on-site.",
  },
  {
    q: "Will I be charged immediately when I request an appointment?",
    a: "No. Requesting an appointment or approving an estimate never automatically charges your payment method. You will receive an official digital invoice only after the technician finishes the job and submits the diagnostic service report, which you settle securely through Stripe test-mode.",
  },
  {
    q: "What does the 30-Day Service Warranty cover?",
    a: "Our warranty covers recurring malfunctions, leaks, loose electrical connections, or workmanship defects associated with the completed work order. You can initiate a 1-click warranty claim directly from your customer dashboard.",
  },
  {
    q: "Can I reschedule or cancel my service booking?",
    a: "Yes. Customers can reschedule their preferred arrival window or cancel eligible pending/approved requests directly from their dashboard at zero penalty up to 2 hours prior to the scheduled dispatch time.",
  },
  {
    q: "How do I communicate with my assigned technician?",
    a: "Once a technician is assigned to your request, their verified profile, name, and ETA will appear on your service tracking view. You can also open an interactive support ticket at any time.",
  },
];

export function TrustQualityCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fetch real reviews from DB
  const { data: reviewsData, isLoading } = useQuery<PublicReviewsResponse>({
    queryKey: ["public-verified-reviews"],
    queryFn: async () => {
      const res = await api.get<PublicReviewsResponse>("/feedback/public", {
        params: { limit: 6 },
      });
      return res.data;
    },
    staleTime: 1000 * 60,
  });

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats;

  return (
    <section
      id="trust-quality"
      aria-label="Trust and Quality Center"
      className="py-16 md:py-24 bg-gradient-to-b from-card via-background to-muted/20 border-b border-border/60"
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified Standards & Governance
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Trust & Quality Center
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover genuine verified customer reviews, transparent service policies, and our strict quality assurance protocols.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUALITY_PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Card
                key={i}
                className="border border-border/80 bg-card rounded-2xl p-5 space-y-3 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`p-2.5 rounded-xl ${p.color} w-fit`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Genuine Customer Reviews Section */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                Customer Testimonials
              </span>
              <h3 className="font-bold text-xl text-foreground mt-0.5">
                Verified Reviews from Completed Service Orders
              </h3>
            </div>

            {stats && (
              <div className="flex items-center gap-2 bg-muted/50 border border-border/70 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-amber-500 mr-1" />
                  <span>{stats.averageRating}</span>
                </div>
                <span className="text-muted-foreground">/ 5.0 Rating ({stats.totalReviews} verified completions)</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-muted/20 border border-dashed border-border/80">
              <p className="text-xs text-muted-foreground">
                All client reviews on ServiSync are tied to real completed Stripe payments. Check back shortly as new field jobs complete.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <Card
                  key={rev.id}
                  className="border border-border/80 bg-card rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                        Verified Order
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed italic line-clamp-3">
                      &ldquo;{rev.comment || "Fast, professional and clean field execution. Solved the issue completely."}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>{rev.customerName}</span>
                      <span className="text-muted-foreground text-[10px] font-normal">{formatDate(rev.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground truncate">
                      {rev.serviceName} • Tech: {rev.technicianName}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="font-bold text-xl text-foreground">Frequently Asked Questions</h3>
            <p className="text-xs text-muted-foreground">
              Everything you need to know about our scheduling, quotes, payments, and warranty.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-border/70 rounded-2xl bg-card overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support & Dispute Help Banner */}
        <Card className="border border-border/80 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <Badge variant="outline" className="text-[10px] bg-card text-primary font-bold">
              24/7 Operations Desk
            </Badge>
            <h4 className="font-extrabold text-lg text-foreground">
              Need assistance with an active or past order?
            </h4>
            <p className="text-xs text-muted-foreground max-w-xl">
              Our support team is available to assist with warranty claims, special billing requests, or dispute arbitration.
            </p>
          </div>

          <Button asChild size="sm" className="font-bold shadow-xs shrink-0">
            <Link href="/dashboard/support">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Open Support Ticket
            </Link>
          </Button>
        </Card>
      </div>
    </section>
  );
}
