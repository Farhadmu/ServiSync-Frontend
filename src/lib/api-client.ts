import { ApiResponse } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://servisync-backend.onrender.com/api/v1";

export class ApiError extends Error {
  statusCode: number;
  errors: any[];
  isNetworkError: boolean;
  isBackendSuspendedOrCold: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors: any[] = [],
    isNetworkError: boolean = false,
    isBackendSuspendedOrCold: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.isBackendSuspendedOrCold = isBackendSuspendedOrCold;
  }
}

// Token helper functions using secure in-memory + localStorage for access token,
// and session management
const TOKEN_KEY = "servisync_token";
const REFRESH_TOKEN_KEY = "servisync_refresh_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Refresh queue to prevent duplicate refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers = {}, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(rest.body instanceof FormData) && !reqHeaders["Content-Type"]) {
    reqHeaders["Content-Type"] = "application/json";
  }

  const token = getStoredAccessToken();
  if (token && !skipAuth) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for Render cold starts

    response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    const msg = isAbort
      ? "Request timed out. The backend server might be starting up (Render cold start) or suspended."
      : "Network error: Unable to connect to ServiSync backend. Please check backend status or local configuration.";
    throw new ApiError(msg, 0, [], true, true);
  }

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && !skipAuth && endpoint !== "/auth/login" && endpoint !== "/auth/refresh-token") {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.success && refreshData.data?.accessToken) {
            setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
            processQueue(null, refreshData.data.accessToken);
            isRefreshing = false;
            // Retry current request with new token
            reqHeaders["Authorization"] = `Bearer ${refreshData.data.accessToken}`;
            const retryRes = await fetch(url, { ...rest, headers: reqHeaders });
            return await handleResponse<T>(retryRes);
          } else {
            clearStoredTokens();
            processQueue(new Error("Refresh failed"), null);
            isRefreshing = false;
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
              window.location.href = "/login?expired=1";
            }
          }
        } catch (refreshErr) {
          clearStoredTokens();
          processQueue(refreshErr, null);
          isRefreshing = false;
        }
      } else {
        // Wait for active refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken) => {
              reqHeaders["Authorization"] = `Bearer ${newToken}`;
              fetch(url, { ...rest, headers: reqHeaders })
                .then((res) => handleResponse<T>(res))
                .then(resolve)
                .catch(reject);
            },
            reject,
          });
        });
      }
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // If not json, might be Render's HTML page (like "Service Suspended" or "Application Error")
    const isSuspended =
      text.includes("Service Suspended") ||
      text.includes("Not Found") ||
      response.status === 502 ||
      response.status === 503;

    throw new ApiError(
      isSuspended
        ? "ServiSync backend is currently suspended or offline on Render. Please verify backend status or configure local backend."
        : `Unexpected server response (${response.status})`,
      response.status,
      [],
      false,
      isSuspended
    );
  }

  if (!response.ok) {
    const errorMsg = json?.message || `Request failed with status ${response.status}`;
    const errors = json?.errors || [];
    throw new ApiError(errorMsg, response.status, errors);
  }

  return json as ApiResponse<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
