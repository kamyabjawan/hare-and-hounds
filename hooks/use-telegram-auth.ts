"use client";

import { useCallback, useEffect } from "react";
import { useTelegram } from "@/hooks/use-telegram";
import { useSessionStore } from "@/stores/session-store";
import type { Profile } from "@/types/database";

export function useTelegramAuth() {
  const telegram = useTelegram();
  const { accessToken, isAuthenticating, setAuthenticating, setAuthError, setSession } = useSessionStore();

  const authenticate = useCallback(async () => {
    if (accessToken || isAuthenticating) {
      console.log("[useTelegramAuth] Skipping auth: accessToken exists or already authenticating");
      return;
    }

    console.log("[useTelegramAuth] Starting authentication...");
    setAuthenticating(true);

    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ initData: telegram.initData })
      });

      const payload = (await response.json()) as
        | { profile: Profile; accessToken: string }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Telegram authentication failed.");
      }

      console.log("[useTelegramAuth] Auth successful!", { username: payload.profile.username });
      setSession(payload.profile, payload.accessToken);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Telegram authentication failed.";
      console.error("[useTelegramAuth] Auth failed:", errorMsg);
      setAuthError(errorMsg);
    } finally {
      setAuthenticating(false);
    }
  }, [accessToken, isAuthenticating, setAuthError, setAuthenticating, setSession, telegram.initData]);

  useEffect(() => {
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const hasInitData = Boolean(telegram.initData);
    
    console.log("[useTelegramAuth] useEffect check:", {
      demoMode,
      hasInitData,
      shouldAuth: hasInitData || demoMode,
      telegram_initData: telegram.initData ? "present" : "missing"
    });

    if (hasInitData || demoMode) {
      void authenticate();
    }
  }, [telegram.initData, authenticate]);

  return {
    ...telegram,
    authenticate
  };
}
