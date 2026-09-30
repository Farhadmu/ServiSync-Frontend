import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-muted/30 to-background">
      <Card className="w-full max-w-md border border-border/80 shadow-2xl rounded-2xl bg-card text-center overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Payment Cancelled</h2>
          <p className="text-sm text-muted-foreground">
            The checkout session was cancelled. No charges were made to your account. Your invoice remains pending.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Button asChild size="lg" className="w-full font-semibold">
              <Link href="/dashboard/invoices">
                <RefreshCw className="mr-2 h-4 w-4" />
                Return to Invoices
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
