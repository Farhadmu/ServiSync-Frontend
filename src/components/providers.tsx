"use client";

import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
