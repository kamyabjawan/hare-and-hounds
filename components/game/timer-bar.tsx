"use client";

import { Clock3 } from "lucide-react";
import { useEffect } from "react";
import type { GameRoom } from "@/types/database";
import { usePlayerTimer } from "@/hooks/use-player-timer";
import { useSessionStore } from "@/stores/session-store";
import { useSound } from "@/hooks/use-sound";

export function TimerBar({ room }: { room: GameRoom }) {
  const { remainingSeconds, expired } = usePlayerTimer(room.turn_deadline);
  const accessToken = useSessionStore((state) => state.accessToken);
  const playSound = useSound();
  const max = room.turn_duration_seconds;
  const percentage = room.turn_deadline ? Math.max(0, Math.min(100, (remainingSeconds / max) * 100)) : 0;

  useEffect(() => {
    if (remainingSeconds > 0 && remainingSeconds <= 5) {
      playSound("tick");
    }
  }, [playSound, remainingSeconds]);

  useEffect(() => {
    if (!expired || room.status !== "playing" || !accessToken) {
      return;
    }

    void fetch(`/api/rooms/${room.id}/timeout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }, [accessToken, expired, room.id, room.status]);

  return (
    <div className="glass-subtle rounded-lg p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold text-white">
          <Clock3 className="h-4 w-4 text-mint" />
          {room.current_turn === "hare" ? "Hare" : "Hounds"} turn
        </span>
        <span className="font-mono text-slate-200">{room.status === "playing" ? `${remainingSeconds}s` : "--"}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-mint transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
