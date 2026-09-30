import React from "react";
import { Check, Clock, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceRequestStatus } from "@/types";

interface StatusTimelineProps {
  currentStatus: ServiceRequestStatus | string;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
}

const ORDERED_STEPS: { status: ServiceRequestStatus; label: string; description: string }[] = [
  { status: "PENDING", label: "Requested", description: "Request submitted by customer" },
  { status: "UNDER_REVIEW", label: "Review", description: "Under manager review" },
  { status: "APPROVED", label: "Approved", description: "Approved for technician assignment" },
  { status: "ASSIGNED", label: "Assigned", description: "Technician assigned" },
  { status: "SCHEDULED", label: "Scheduled", description: "Technician accepted & scheduled" },
  { status: "IN_PROGRESS", label: "In Progress", description: "Field technician on site" },
  { status: "COMPLETED", label: "Completed", description: "Service work finished" },
  { status: "INVOICED", label: "Invoiced", description: "Invoice generated" },
  { status: "CLOSED", label: "Closed", description: "Payment settled & closed" },
];

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  const isCancelled = currentStatus === "CANCELLED";
  const isRejected = currentStatus === "REJECTED";

  const currentIndex = ORDERED_STEPS.findIndex((s) => s.status === currentStatus);

  if (isCancelled || isRejected) {
    return (
      <div className={cn("p-4 rounded-xl border border-red-200 bg-red-50/60 dark:border-red-950 dark:bg-red-950/30", className)}>
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-300">
              Request {isCancelled ? "Cancelled" : "Rejected"}
            </h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              This request was {isCancelled ? "cancelled" : "rejected"} and will not proceed through further stages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="relative">
        {/* Mobile vertical, Desktop horizontal */}
        <div className="hidden lg:grid lg:grid-cols-9 gap-1 relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/20 -z-0" />
          {ORDERED_STEPS.map((step, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;

            return (
              <div key={step.status} className="flex flex-col items-center text-center relative z-10 px-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm",
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs font-semibold leading-tight",
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet vertical list */}
        <div className="lg:hidden space-y-3">
          {ORDERED_STEPS.map((step, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            if (!isCompleted && !isCurrent && idx > currentIndex + 1) return null;

            return (
              <div key={step.status} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary text-white ring-2 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isCurrent ? "text-primary font-bold" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
