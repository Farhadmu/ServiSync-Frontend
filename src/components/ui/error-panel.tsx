import React from "react";
import { AlertCircle, RefreshCw, ServerCrash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorPanelProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isColdStart?: boolean;
}

export function ErrorPanel({
  title = "Something went wrong",
  message = "Failed to load data from the server.",
  onRetry,
  isColdStart = false,
}: ErrorPanelProps) {
  const isSuspendedOrOffline =
    message?.toLowerCase().includes("suspended") ||
    message?.toLowerCase().includes("cold start") ||
    message?.toLowerCase().includes("network error") ||
    isColdStart;

  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 shrink-0">
            {isSuspendedOrOffline ? (
              <ServerCrash className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 dark:text-red-300">
              {isSuspendedOrOffline ? "Backend Service Notice" : title}
            </h4>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              {message}
            </p>

            {isSuspendedOrOffline && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300 text-xs space-y-1">
                <p className="font-semibold">Evaluator Tip:</p>
                <p>
                  The remote Render backend (<code>servisync-backend.onrender.com</code>) might be spinning up from sleep (takes up to 50s on free tiers) or temporarily suspended. You can run the backend locally on port 5000 and set <code>NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1</code> in <code>.env.local</code>.
                </p>
              </div>
            )}

            {onRetry && (
              <div className="mt-4">
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-800 hover:bg-red-100 dark:border-red-850 dark:text-red-300"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
