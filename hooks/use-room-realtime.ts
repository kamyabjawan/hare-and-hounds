"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { GameRoom, MoveRow, RoomPlayer } from "@/types/database";
import { useGameStore } from "@/stores/game-store";
import { useSupabase } from "@/hooks/use-supabase";

export function useRoomRealtime(roomId: string) {
  const supabase = useSupabase();
  const { setRoom, setMoves, setPlayers, addMove, setRealtimeStatus } = useGameStore();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    setRealtimeStatus("connecting");

    async function loadInitialState() {
      const [roomResult, playersResult, movesResult] = await Promise.all([
        supabase.from("game_rooms").select("*").eq("id", roomId).single(),
        supabase.from("room_players").select("*").eq("room_id", roomId),
        supabase.from("moves").select("*").eq("room_id", roomId).order("move_number", { ascending: true })
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

    const channel = supabase
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
          setRoom(payload.new);
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
        () => {
          void supabase
            .from("room_players")
            .select("*")
            .eq("room_id", roomId)
            .then(({ data }) => {
              if (data) {
                setPlayers(data);
              }
            });
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
          addMove(payload.new);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : status === "CHANNEL_ERROR" ? "error" : "connecting");
      });

    return () => {
      mounted = false;
      setRealtimeStatus("idle");
      void supabase.removeChannel(channel);
    };
  }, [addMove, roomId, setMoves, setPlayers, setRealtimeStatus, setRoom, supabase]);
}
