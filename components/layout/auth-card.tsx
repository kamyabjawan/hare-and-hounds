"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useTelegramAuth } from "@/hooks/use-telegram-auth";
import { useSessionStore } from "@/stores/session-store";

export function AuthCard() {
  const { authenticate, isTelegram } = useTelegramAuth();
  const { isAuthenticating, authError } = useSessionStore();

  return (
    <Panel className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/15 text-amber">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-white">Telegram sign-in required</h2>
          <p className="text-sm text-slate-400">Launch from your bot to unlock multiplayer.</p>
        </div>
      </div>
      {authError ? <p className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{authError}</p> : null}
      <Button className="w-full" isLoading={isAuthenticating} onClick={() => void authenticate()}>
        {isTelegram ? "Retry Telegram sign-in" : "Use demo sign-in"}
      </Button>
    </Panel>
  );
}
