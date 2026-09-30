"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ServerCrash, Home } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error securely for diagnostics
    console.error("[ServiSync Error Boundary]:", error);
  }, [error]);

  const isNetworkOrCold =
    error.message?.includes("fetch") ||
    error.message?.includes("Network") ||
    error.message?.includes("suspended");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        {isNetworkOrCold ? (
          <ServerCrash className="h-8 w-8 text-amber-600" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-destructive" />
        )}
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {isNetworkOrCold
          ? "Backend Service Connection Interrupted"
          : "Something unexpected happened"}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {isNetworkOrCold
          ? `The live backend at ${API_BASE_URL} may be sleeping on Render or temporarily unreachable.`
          : error.message || "An unhandled exception occurred during application rendering."}
      </p>

      {error.digest && (
        <p className="mt-1 text-[11px] font-mono text-muted-foreground/70">
          Error Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload & Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
        >
          {showDetails ? "Hide Diagnostics" : "View Diagnostics"}
        </Button>
      </div>

      {showDetails && (
        <div className="mt-6 max-w-xl w-full p-4 rounded-xl bg-muted/60 border border-border text-left font-mono text-xs overflow-x-auto text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Stack Trace:</p>
          <pre className="whitespace-pre-wrap">{error.stack || error.message}</pre>
        </div>
      )}
    </div>
  );
}
