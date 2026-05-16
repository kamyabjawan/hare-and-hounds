"use client";

import { create } from "zustand";
import type { GameRoom, MoveRow, RoomPlayer } from "@/types/database";

type GameStore = {
  room: GameRoom | null;
  players: RoomPlayer[];
  moves: MoveRow[];
  selectedPiece: string | null;
  realtimeStatus: "idle" | "connecting" | "connected" | "error";
  setRoom: (room: GameRoom | null) => void;
  setPlayers: (players: RoomPlayer[]) => void;
  setMoves: (moves: MoveRow[] | ((currentMoves: MoveRow[]) => MoveRow[])) => void;
  addMove: (move: MoveRow) => void;
  setSelectedPiece: (piece: string | null) => void;
  setRealtimeStatus: (status: GameStore["realtimeStatus"]) => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  players: [],
  moves: [],
  selectedPiece: null,
  realtimeStatus: "idle",
  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  setMoves: (moves) =>   set((state) => ({     moves: typeof moves === "function" ? moves(state.moves) : moves   })),
  addMove: (move) =>
    set((state) => ({
      moves: state.moves.some((existing) => existing.id === move.id)
        ? state.moves
        : [...state.moves, move].sort((left, right) => left.move_number - right.move_number)
    })),
  setSelectedPiece: (piece) => set({ selectedPiece: piece }),
  setRealtimeStatus: (status) => set({ realtimeStatus: status }),
  reset: () =>
    set({
      room: null,
      players: [],
      moves: [],
      selectedPiece: null,
      realtimeStatus: "idle"
    })
}));
