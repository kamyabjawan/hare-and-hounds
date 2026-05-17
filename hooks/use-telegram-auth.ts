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
      return;
    }

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

      setSession(payload.profile, payload.accessToken);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Telegram authentication failed.");
    } finally {
      setAuthenticating(false);
    }
  }, [accessToken, isAuthenticating, setAuthError, setAuthenticating, setSession, telegram.initData]);

  useEffect(() => {
    if (telegram.initData || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      void authenticate();
    }
  }, [telegram.initData, authenticate]);

  return {
    ...telegram,
    authenticate
  };
}
