"use client";

import { Swords, UserRound } from "lucide-react";
import type { GameRoom, Profile, RoomPlayer } from "@/types/database";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils/cn";

type PlayerStripProps = {
  room: GameRoom;
  players: RoomPlayer[];
  currentProfile: Profile | null;
};

export function PlayerStrip({ room, players, currentProfile }: PlayerStripProps) {
  const currentRole =
    currentProfile?.id === room.hare_player_id ? "hare" : currentProfile?.id === room.hounds_player_id ? "hounds" : null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {(["hounds", "hare"] as const).map((role) => {
        const occupied = players.some((player) => player.role === role);
        const isYou = currentRole === role;
        const isTurn = room.current_turn === role && room.status === "playing";

        return (
          <div
            key={role}
            className={cn(
              "glass-subtle rounded-lg p-3",
              isTurn && "border-mint/40 bg-mint/10"
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold capitalize text-white">
                {role === "hare" ? <UserRound className="h-4 w-4 text-amber" /> : <Swords className="h-4 w-4 text-skyglow" />}
                {role}
              </span>
              {isYou ? <StatusPill tone="mint">You</StatusPill> : null}
            </div>
            <p className="text-xs text-slate-400">
              {occupied ? (isTurn ? "Thinking..." : "Ready") : "Waiting"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
