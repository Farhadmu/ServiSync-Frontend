"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, LayoutDashboard } from "lucide-react";
import { api } from "@/lib/api-client";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("No Stripe checkout session ID was found in the URL.");
      return;
    }

    // Call backend callback to verify payment status with Stripe API
    api
      .post(`/payments/success?session_id=${encodeURIComponent(sessionId)}`)
      .then(() => {
        setStatus("success");
      })
      .catch((err: any) => {
        // If already verified or paid
        if (err?.message?.includes("already") || err?.statusCode === 200) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(err?.message || "Failed to verify Stripe payment transaction.");
        }
      });
  }, [sessionId]);

  return (
    <Card className="w-full max-w-md border border-border/80 shadow-2xl rounded-2xl bg-card text-center overflow-hidden">
      <CardContent className="p-8 space-y-6">
        {status === "verifying" && (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Verifying Payment with Stripe...</h2>
            <p className="text-xs text-muted-foreground">
              Please wait while our backend verifies your checkout transaction.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground">
              Your invoice has been settled and the service request lifecycle is now marked Completed and Closed.
            </p>
            <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground font-mono">
              Session ID: {sessionId?.slice(0, 24)}...
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full font-semibold">
                <Link href="/dashboard/invoices">
                  View Settled Invoices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Verification Notice</h2>
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage || "Unable to confirm payment status with Stripe."}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="/dashboard/invoices">Check Invoices</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Suspense fallback={<div>Loading verification...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
