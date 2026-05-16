"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import type { Profile } from "@/types/database";
import { PageTransition } from "@/components/layout/page-transition";
import { Panel } from "@/components/ui/panel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      void supabase
        .from("profiles")
        .select("*")
        .order("elo", { ascending: false })
        .limit(50)
        .then(({ data, error: queryError }) => {
          if (queryError) {
            setError(queryError.message);
          } else {
            setLeaders(data ?? []);
          }
        });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Leaderboard unavailable.");
    }
  }, []);

  return (
    <PageTransition>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-400">Top hunters by Elo.</p>
        </div>

        {error ? <p className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{error}</p> : null}

        <Panel className="space-y-2">
          {leaders.length === 0 ? (
            <p className="text-sm text-slate-400">No ranked games yet.</p>
          ) : (
            leaders.map((profile, index) => (
              <div key={profile.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-lg bg-white/5 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-black text-white">
                  {index === 0 ? <Crown className="h-4 w-4 text-amber" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{profile.first_name}</p>
                  <p className="truncate text-xs text-slate-400">@{profile.username ?? "player"}</p>
                </div>
                <span className="font-mono text-sm font-bold text-mint">{profile.elo}</span>
              </div>
            ))
          )}
        </Panel>
      </section>
    </PageTransition>
  );
}
