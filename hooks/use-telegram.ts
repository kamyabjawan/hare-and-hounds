"use client";

import { useEffect, useMemo, useState } from "react";
import type { TelegramWebApp } from "@/types/telegram";

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const app = window.Telegram?.WebApp ?? null;

    if (app) {
      app.ready();
      app.expand();
      setWebApp(app);

      const root = document.documentElement;
      const params = app.themeParams;
      root.style.setProperty("--tg-bg-color", params.bg_color ?? "#070b12");
      root.style.setProperty("--tg-text-color", params.text_color ?? "#f8fafc");
      root.style.setProperty("--tg-hint-color", params.hint_color ?? "#94a3b8");
      root.style.setProperty("--tg-link-color", params.link_color ?? "#61c6ff");
      root.style.setProperty("--tg-button-color", params.button_color ?? "#4ee6a8");
      root.style.setProperty("--tg-button-text-color", params.button_text_color ?? "#071014");
    }
  }, []);

  return useMemo(
    () => ({
      webApp,
      initData: webApp?.initData ?? "",
      user: webApp?.initDataUnsafe?.user ?? null,
      isTelegram: Boolean(webApp?.initData),
      colorScheme: webApp?.colorScheme ?? "dark"
    }),
    [webApp]
  );
}
