import { create } from "zustand";
import { User, UserRole } from "@/types";
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  api,
} from "@/lib/api-client";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, accessToken: string, refreshToken?: string) => {
    setStoredTokens(accessToken, refreshToken);
    set({
      user,
      role: user.role,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (partialUser: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...partialUser };
      set({ user: updated, role: updated.role });
    }
  },

  logout: async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken }).catch(() => {});
      }
    } finally {
      clearStoredTokens();
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  checkAuth: async () => {
    const token = getStoredAccessToken();
    if (!token) {
      set({ user: null, role: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await api.get<User>("/users/me");
      if (res.success && res.data) {
        set({
          user: res.data,
          role: res.data.role,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        clearStoredTokens();
        set({ user: null, role: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      // In case of error (e.g. backend down or invalid token), handle gracefully
      clearStoredTokens();
      set({ user: null, role: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
