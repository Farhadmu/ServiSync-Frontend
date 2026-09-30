"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api-client";
import { AlertCircle, CheckCircle2, RefreshCw, X } from "lucide-react";

export function BackendStatusBanner() {
  const [status, setStatus] = useState<"checking" | "online" | "sleeping" | "offline">("checking");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  const checkHealth = async () => {
    setIsPinging(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL.replace(/\/api\/v1\/?$/, "")}/api/v1/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setStatus("online");
      } else {
        const text = await res.text();
        if (text.includes("Suspended") || text.includes("Render")) {
          setStatus("sleeping");
        } else {
          setStatus("offline");
        }
      }
    } catch {
      setStatus("sleeping");
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (isDismissed || status === "online") {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {status === "checking" ? (
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          )}
          <span>
            {status === "sleeping" ? (
              <>
                <strong className="font-semibold">Backend Notice:</strong> Render free instances sleep after inactivity.
                Endpoint: <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">{API_BASE_URL}</code>.
                Cold starts may take 45–60 seconds to respond.
              </>
            ) : status === "checking" ? (
              "Checking backend connection status..."
            ) : (
              <>
                <strong className="font-semibold">Backend Unreachable:</strong> Set{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1</code> for local development.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkHealth}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isPinging ? "animate-spin" : ""}`} />
            {isPinging ? "Pinging..." : "Check Status"}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss notice"
            className="p-1 hover:bg-amber-200/50 rounded text-amber-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
