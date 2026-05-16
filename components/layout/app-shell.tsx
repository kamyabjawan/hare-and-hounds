"use client";

import Script from "next/script";
import { useEffect } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { useTelegramAuth } from "@/hooks/use-telegram-auth";
import { useSettingsStore } from "@/stores/settings-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  useTelegramAuth();
  const themeMode = useSettingsStore((state) => state.themeMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="min-h-screen pb-24">
        <TopBar />
        <main className="mx-auto max-w-lg px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </>
  );
}
