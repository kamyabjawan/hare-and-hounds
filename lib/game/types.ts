import type { GameRole } from "@/types/database";

export type NodeId =
  | "L"
  | "A1"
  | "B1"
  | "C1"
  | "A2"
  | "B2"
  | "C2"
  | "D"
  | "A3"
  | "B3"
  | "C3";

export type PieceId = "hare" | "hound-1" | "hound-2" | "hound-3";

export type BoardPoint = {
  id: NodeId;
  x: number;
  y: number;
  label: string;
};

export type BoardState = {
  hare: NodeId;
  hounds: [NodeId, NodeId, NodeId];
};

export type GameState = {
  positions: BoardState;
  currentTurn: GameRole;
  houndStallCount: number;
  moveCount: number;
  winner: GameRole | null;
};

export type MoveInput = {
  role: GameRole;
  piece: PieceId;
  from: NodeId;
  to: NodeId;
};

export type MoveResult = {
  ok: true;
  state: GameState;
  winReason: string | null;
};

export type MoveFailure = {
  ok: false;
  reason: string;
};

export type ValidationResult = MoveResult | MoveFailure;
