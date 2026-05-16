"use client";

import { create } from "zustand";
import type { Profile } from "@/types/database";

type SessionState = {
  profile: Profile | null;
  accessToken: string | null;
  isAuthenticating: boolean;
  authError: string | null;
  setSession: (profile: Profile, accessToken: string) => void;
  setAuthenticating: (value: boolean) => void;
  setAuthError: (message: string | null) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  profile: null,
  accessToken: null,
  isAuthenticating: false,
  authError: null,
  setSession: (profile, accessToken) =>
    set({
      profile,
      accessToken,
      isAuthenticating: false,
      authError: null
    }),
  setAuthenticating: (value) => set({ isAuthenticating: value }),
  setAuthError: (message) => set({ authError: message, isAuthenticating: false }),
  clearSession: () =>
    set({
      profile: null,
      accessToken: null,
      isAuthenticating: false,
      authError: null
    })
}));
