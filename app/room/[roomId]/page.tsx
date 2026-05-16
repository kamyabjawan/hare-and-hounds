"use client";

import { useParams } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { AuthCard } from "@/components/layout/auth-card";
import { GameBoard } from "@/components/game/game-board";
import { MoveList } from "@/components/game/move-list";
import { PlayerStrip } from "@/components/game/player-strip";
import { RoomCodeCard } from "@/components/game/room-code-card";
import { RulesCard } from "@/components/game/rules-card";
import { TimerBar } from "@/components/game/timer-bar";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { useRoomRealtime } from "@/hooks/use-room-realtime";
import { useGameStore } from "@/stores/game-store";
import { useSessionStore } from "@/stores/session-store";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const profile = useSessionStore((state) => state.profile);
  const room = useGameStore((state) => state.room);
  const players = useGameStore((state) => state.players);
  const moves = useGameStore((state) => state.moves);

  useRoomRealtime(roomId);

  if (!profile) {
    return (
      <PageTransition>
        <AuthCard />
      </PageTransition>
    );
  }

  if (!room) {
    return (
      <PageTransition>
        <Panel>
          <p className="animate-soft-pulse text-sm text-slate-300">Loading live room...</p>
        </Panel>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Game Room</h1>
            <p className="text-sm text-slate-400">State v{room.state_version}</p>
          </div>
          <StatusPill tone={room.status === "playing" ? "mint" : room.status === "waiting" ? "amber" : "sky"}>
            {room.status}
          </StatusPill>
        </div>

        {room.status === "waiting" ? <RoomCodeCard code={room.code} /> : null}
        <PlayerStrip room={room} players={players} currentProfile={profile} />
        <TimerBar room={room} />
        <GameBoard room={room} />

        {room.status === "finished" ? (
          <Panel>
            <p className="text-lg font-black text-white">
              {room.winner_role === "hare" ? "Hare escaped" : "Hounds trapped the hare"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Elo has been settled for both players.</p>
          </Panel>
        ) : null}

        <MoveList moves={moves} />
        <RulesCard />
      </section>
    </PageTransition>
  );
}
