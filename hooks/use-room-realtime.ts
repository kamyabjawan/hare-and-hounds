"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js";
import type { Database, GameRoom, MoveRow } from "@/types/database";
import { useGameStore } from "@/stores/game-store";
import { useSupabase } from "@/hooks/use-supabase";

export function useRoomRealtime(roomId: string) {
  const supabase = useSupabase();
  const { setRoom, setMoves, setPlayers, setRealtimeStatus } = useGameStore();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client: SupabaseClient<Database> = supabase;
    let mounted = true;
    setRealtimeStatus("connecting");

    async function loadInitialState() {
      const [roomResult, playersResult, movesResult] = await Promise.all([
        client.from("game_rooms").select("*").eq("id", roomId).single(),
        client.from("room_players").select("*").eq("room_id", roomId),
        client.from("moves").select("*").eq("room_id", roomId).order("move_number", { ascending: true })
      ]);

      if (!mounted) {
        return;
      }

      if (roomResult.data) {
        setRoom(roomResult.data);
      }

      if (playersResult.data) {
        setPlayers(playersResult.data);
      }

      if (movesResult.data) {
        setMoves(movesResult.data);
      }
    }

    void loadInitialState();

    const channel = client
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`
        },
        (payload: RealtimePostgresChangesPayload<GameRoom>) => {
          if (mounted) {
            setRoom(payload.new as GameRoom);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          if (!mounted) {
            return;
          }

          const { data } = await client
            .from("room_players")
            .select("*")
            .eq("room_id", roomId);

          if (data && mounted) {
            setPlayers(data);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moves",
          filter: `room_id=eq.${roomId}`
        },
        (payload: RealtimePostgresChangesPayload<MoveRow>) => {
          if (mounted) {
            const move = payload.new as MoveRow;

            setMoves((currentMoves) =>
              currentMoves.some((existing) => existing.id === move.id)
                ? currentMoves
                : [...currentMoves, move].sort((left, right) => left.move_number - right.move_number)
            );
          }
        }
      )
      .subscribe((status) => {
        if (mounted) {
          setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : status === "CHANNEL_ERROR" ? "error" : "connecting");
        }
      });

    return () => {
      mounted = false;
      setRealtimeStatus("idle");
      void client.removeChannel(channel);
    };
  }, [roomId, setMoves, setPlayers, setRealtimeStatus, setRoom, supabase]);
}
