"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { mockUser } from "@/lib/mock-data";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
  login: (role?: UserRole) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => set({ user: null, isAuthenticated: false }),
      login: (role) =>
        set({
          user: { ...mockUser, role: role ?? mockUser.role },
          isAuthenticated: true,
        }),
    }),
    {
      name: "petradar:auth-session",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
