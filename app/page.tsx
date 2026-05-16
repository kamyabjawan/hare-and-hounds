"use client";

import Link from "next/link";
import { Bot, Medal, Play, ShieldCheck, Zap } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { AuthCard } from "@/components/layout/auth-card";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { useSessionStore } from "@/stores/session-store";

export default function HomePage() {
  const profile = useSessionStore((state) => state.profile);

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="glass overflow-hidden rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between">
            <StatusPill tone="mint">Live PvP</StatusPill>
            <span className="text-xs font-semibold text-slate-400">Telegram native</span>
          </div>
          <h1 className="text-4xl font-black leading-none text-white">Hare & Hounds</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            A compact medieval chase game rebuilt for quick realtime matches, private room codes, ranking, and smooth mobile play.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link href="/matchmaking">
              <Button className="w-full" icon={<Play className="h-4 w-4" />}>
                Play
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button className="w-full" variant="secondary" icon={<Medal className="h-4 w-4" />}>
                Ranks
              </Button>
            </Link>
          </div>
        </div>

        {!profile ? <AuthCard /> : null}

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Zap, label: "Realtime", text: "Synced turns" },
            { icon: ShieldCheck, label: "Verified", text: "Server moves" },
            { icon: Bot, label: "Telegram", text: "Mini App SDK" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Panel key={item.label} className="p-3">
                <Icon className="mb-3 h-5 w-5 text-mint" />
                <h2 className="text-sm font-bold text-white">{item.label}</h2>
                <p className="mt-1 text-xs text-slate-400">{item.text}</p>
              </Panel>
            );
          })}
        </div>

        <Panel className="space-y-3">
          <h2 className="text-base font-bold text-white">Today&apos;s Hunt</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-2xl font-black text-white">{profile?.elo ?? 1200}</p>
              <p className="text-xs text-slate-400">Elo</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-2xl font-black text-white">{profile?.wins ?? 0}</p>
              <p className="text-xs text-slate-400">Wins</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-2xl font-black text-white">{profile?.games_played ?? 0}</p>
              <p className="text-xs text-slate-400">Games</p>
            </div>
          </div>
        </Panel>
      </section>
    </PageTransition>
  );
}
