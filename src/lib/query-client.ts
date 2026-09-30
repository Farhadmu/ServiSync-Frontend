import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
          // Do not retry 4xx errors, but retry on network / cold start errors
          if (error?.statusCode >= 400 && error?.statusCode < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return createQueryClient();
  } else {
    // Browser: reuse the same client across renders
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
}
