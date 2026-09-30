import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ApiError,
  getStoredAccessToken,
  setStoredTokens,
  clearStoredTokens,
} from "@/lib/api-client";

describe("API Client & Session State", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves access and refresh tokens", () => {
    expect(getStoredAccessToken()).toBeNull();
    setStoredTokens("sample_access_token", "sample_refresh_token");
    expect(getStoredAccessToken()).toBe("sample_access_token");
    expect(localStorage.getItem("servisync_refresh_token")).toBe("sample_refresh_token");
  });

  it("clears stored tokens on logout", () => {
    setStoredTokens("access", "refresh");
    clearStoredTokens();
    expect(getStoredAccessToken()).toBeNull();
    expect(localStorage.getItem("servisync_refresh_token")).toBeNull();
  });

  it("creates ApiError with normalized flags for cold starts", () => {
    const error = new ApiError("Backend timeout", 503, [], true, true);
    expect(error.statusCode).toBe(503);
    expect(error.isNetworkError).toBe(true);
    expect(error.isBackendSuspendedOrCold).toBe(true);
  });
});
