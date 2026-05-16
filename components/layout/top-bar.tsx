"use client";

import Link from "next/link";
import { Crown, Radio, Settings } from "lucide-react";
import { useSessionStore } from "@/stores/session-store";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";

export function TopBar() {
  const profile = useSessionStore((state) => state.profile);
  const realtimeStatus = useGameStore((state) => state.realtimeStatus);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/75 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint text-ink">
            <Crown className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase text-white">Hare & Hounds</span>
            <span className="block truncate text-[11px] text-slate-400">
              {profile ? `${profile.elo} Elo · ${profile.first_name}` : "Telegram arena"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {realtimeStatus !== "idle" ? (
            <StatusPill tone={realtimeStatus === "connected" ? "mint" : realtimeStatus === "error" ? "coral" : "amber"}>
              <Radio className="mr-1 h-3 w-3" />
              Live
            </StatusPill>
          ) : null}
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
