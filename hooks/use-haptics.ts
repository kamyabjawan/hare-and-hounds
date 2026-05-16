"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useTelegram } from "@/hooks/use-telegram";

export function useHaptics() {
  const enabled = useSettingsStore((state) => state.hapticsEnabled);
  const { webApp } = useTelegram();

  return useCallback(
    (style: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
      if (!enabled) {
        return;
      }

      if (style === "success" || style === "error") {
        webApp?.HapticFeedback?.notificationOccurred(style);
        return;
      }

      webApp?.HapticFeedback?.impactOccurred(style);
    },
    [enabled, webApp]
  );
}
