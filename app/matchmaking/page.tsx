"use client";

import { useState } from "react";
import { DoorOpen, Plus, Shuffle, Swords } from "lucide-react";
import type { GameRole, RoomPrivacy } from "@/types/database";
import { PageTransition } from "@/components/layout/page-transition";
import { AuthCard } from "@/components/layout/auth-card";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { useSessionStore } from "@/stores/session-store";

export default function MatchmakingPage() {
  const profile = useSessionStore((state) => state.profile);
  const [preferredRole, setPreferredRole] = useState<GameRole | "random">("random");
  const [privacy, setPrivacy] = useState<RoomPrivacy>("private");
  const [code, setCode] = useState("");
  const [turnSeconds, setTurnSeconds] = useState(45);
  const { startQueue, createRoom, joinRoom, isLoading, error } = useMatchmaking();

  return (
    <PageTransition>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-white">Matchmaking</h1>
          <p className="mt-1 text-sm text-slate-400">Queue instantly or create a private room code.</p>
        </div>

        {!profile ? <AuthCard /> : null}

        <Panel className="space-y-4">
          <SegmentedControl
            value={preferredRole}
            onChange={setPreferredRole}
            options={[
              { value: "random", label: "Random" },
              { value: "hounds", label: "Hounds" },
              { value: "hare", label: "Hare" }
            ]}
          />
          <Button
            className="w-full"
            isLoading={isLoading}
            icon={<Shuffle className="h-4 w-4" />}
            onClick={() => void startQueue(preferredRole)}
          >
            Quick Match
          </Button>
        </Panel>

        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Private Room</h2>
            <Swords className="h-5 w-5 text-skyglow" />
          </div>
          <SegmentedControl
            value={privacy}
            onChange={setPrivacy}
            options={[
              { value: "private", label: "Private" },
              { value: "public", label: "Public" }
            ]}
          />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-300">Turn timer: {turnSeconds}s</span>
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={turnSeconds}
              className="w-full accent-mint"
              onChange={(event) => setTurnSeconds(Number(event.target.value))}
            />
          </label>
          <Button
            className="w-full"
            variant="secondary"
            isLoading={isLoading}
            icon={<Plus className="h-4 w-4" />}
            onClick={() => void createRoom({ privacy, preferredRole, turnSeconds })}
          >
            Create Room
          </Button>
        </Panel>

        <Panel className="space-y-3">
          <h2 className="text-base font-bold text-white">Join Room</h2>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 font-mono text-white outline-none placeholder:text-slate-500 focus:border-mint/60"
            />
            <Button
              variant="secondary"
              isLoading={isLoading}
              icon={<DoorOpen className="h-4 w-4" />}
              onClick={() => void joinRoom(code)}
            >
              Join
            </Button>
          </div>
        </Panel>

        {error ? <p className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{error}</p> : null}
      </section>
    </PageTransition>
  );
}
