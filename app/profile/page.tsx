"use client";

import { Medal, Trophy, UserRound } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { AuthCard } from "@/components/layout/auth-card";
import { Panel } from "@/components/ui/panel";
import { useSessionStore } from "@/stores/session-store";

export default function ProfilePage() {
  const profile = useSessionStore((state) => state.profile);

  return (
    <PageTransition>
      <section className="space-y-4">
        <h1 className="text-2xl font-black text-white">Profile</h1>
        {!profile ? <AuthCard /> : null}
        {profile ? (
          <>
            <Panel className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-mint text-ink">
                <UserRound className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-white">{profile.first_name}</h2>
                <p className="truncate text-sm text-slate-400">@{profile.username ?? "telegram_player"}</p>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-2">
              <Panel>
                <Medal className="mb-3 h-5 w-5 text-mint" />
                <p className="text-3xl font-black text-white">{profile.elo}</p>
                <p className="text-sm text-slate-400">Elo rating</p>
              </Panel>
              <Panel>
                <Trophy className="mb-3 h-5 w-5 text-amber" />
                <p className="text-3xl font-black text-white">{profile.wins}</p>
                <p className="text-sm text-slate-400">Wins</p>
              </Panel>
            </div>

            <Panel>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-black text-white">{profile.games_played}</p>
                  <p className="text-xs text-slate-400">Games</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{profile.losses}</p>
                  <p className="text-xs text-slate-400">Losses</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">
                    {profile.games_played ? Math.round((profile.wins / profile.games_played) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-400">Win rate</p>
                </div>
              </div>
            </Panel>
          </>
        ) : null}
      </section>
    </PageTransition>
  );
}
