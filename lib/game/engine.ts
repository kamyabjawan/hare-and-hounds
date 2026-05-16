import type { GameRole } from "@/types/database";
import { ADJACENCY, INITIAL_BOARD_STATE, nodeX } from "./board";
import type { BoardState, GameState, MoveInput, NodeId, PieceId, ValidationResult } from "./types";

export const DEFAULT_TURN_SECONDS = 45;
export const HOUND_STALL_LIMIT = 10;

export function createInitialGameState(): GameState {
  return {
    positions: structuredClone(INITIAL_BOARD_STATE),
    currentTurn: "hounds",
    houndStallCount: 0,
    moveCount: 0,
    winner: null
  };
}

export function normalizeBoardState(value: unknown): BoardState {
  if (!value || typeof value !== "object") {
    return structuredClone(INITIAL_BOARD_STATE);
  }

  const candidate = value as Partial<BoardState>;

  if (!candidate.hare || !Array.isArray(candidate.hounds) || candidate.hounds.length !== 3) {
    return structuredClone(INITIAL_BOARD_STATE);
  }

  return {
    hare: candidate.hare,
    hounds: [candidate.hounds[0], candidate.hounds[1], candidate.hounds[2]]
  } as BoardState;
}

export function isOccupied(state: BoardState, node: NodeId, ignoredPiece?: PieceId) {
  if (ignoredPiece !== "hare" && state.hare === node) {
    return true;
  }

  return state.hounds.some((houndNode, index) => ignoredPiece !== `hound-${index + 1}` && houndNode === node);
}

export function getPieceNode(state: BoardState, piece: PieceId) {
  if (piece === "hare") {
    return state.hare;
  }

  const index = Number(piece.replace("hound-", "")) - 1;
  return state.hounds[index];
}

export function canHoundMove(from: NodeId, to: NodeId) {
  return nodeX(to) >= nodeX(from);
}

export function legalMovesForPiece(state: BoardState, piece: PieceId) {
  const from = getPieceNode(state, piece);

  if (!from) {
    return [];
  }

  return ADJACENCY[from].filter((to) => {
    if (isOccupied(state, to, piece)) {
      return false;
    }

    if (piece.startsWith("hound")) {
      return canHoundMove(from, to);
    }

    return true;
  });
}

export function legalMovesForRole(state: BoardState, role: GameRole) {
  const pieces: PieceId[] = role === "hare" ? ["hare"] : ["hound-1", "hound-2", "hound-3"];

  return pieces.flatMap((piece) =>
    legalMovesForPiece(state, piece).map((to) => ({
      piece,
      from: getPieceNode(state, piece),
      to
    }))
  );
}

export function detectWinner(state: BoardState, houndStallCount: number): { winner: GameRole | null; reason: string | null } {
  const hareX = nodeX(state.hare);
  const leftMostHoundX = Math.min(...state.hounds.map(nodeX));

  if (hareX < leftMostHoundX || state.hare === "L") {
    return { winner: "hare", reason: "The hare slipped past the hounds." };
  }

  if (houndStallCount >= HOUND_STALL_LIMIT) {
    return { winner: "hare", reason: "The hounds stalled for too many sideways moves." };
  }

  if (legalMovesForPiece(state, "hare").length === 0) {
    return { winner: "hounds", reason: "The hounds trapped the hare." };
  }

  return { winner: null, reason: null };
}

export function applyMove(game: GameState, move: MoveInput): ValidationResult {
  if (game.winner) {
    return { ok: false, reason: "This game is already finished." };
  }

  if (move.role !== game.currentTurn) {
    return { ok: false, reason: "It is not your turn." };
  }

  if (move.role === "hare" && move.piece !== "hare") {
    return { ok: false, reason: "The hare player can only move the hare." };
  }

  if (move.role === "hounds" && !move.piece.startsWith("hound")) {
    return { ok: false, reason: "The hounds player can only move hounds." };
  }

  const actualFrom = getPieceNode(game.positions, move.piece);

  if (actualFrom !== move.from) {
    return { ok: false, reason: "The submitted move does not match the board state." };
  }

  const legalMoves = legalMovesForPiece(game.positions, move.piece);

  if (!legalMoves.includes(move.to)) {
    return { ok: false, reason: "That move is not legal." };
  }

  const nextPositions = structuredClone(game.positions);

  if (move.piece === "hare") {
    nextPositions.hare = move.to;
  } else {
    const index = Number(move.piece.replace("hound-", "")) - 1;
    nextPositions.hounds[index] = move.to;
  }

  const houndStallCount =
    move.role === "hounds" && nodeX(move.from) === nodeX(move.to) ? game.houndStallCount + 1 : 0;
  const win = detectWinner(nextPositions, houndStallCount);

  return {
    ok: true,
    state: {
      positions: nextPositions,
      currentTurn: win.winner ? game.currentTurn : game.currentTurn === "hare" ? "hounds" : "hare",
      houndStallCount,
      moveCount: game.moveCount + 1,
      winner: win.winner
    },
    winReason: win.reason
  };
}

export function serializeGameState(room: {
  positions: unknown;
  current_turn: GameRole;
  hound_stall_count: number;
  move_count: number;
  winner_role: GameRole | null;
}): GameState {
  return {
    positions: normalizeBoardState(room.positions),
    currentTurn: room.current_turn,
    houndStallCount: room.hound_stall_count,
    moveCount: room.move_count,
    winner: room.winner_role
  };
}

export function roleForProfile(room: { hare_player_id: string | null; hounds_player_id: string | null }, profileId: string) {
  if (room.hare_player_id === profileId) {
    return "hare" satisfies GameRole;
  }

  if (room.hounds_player_id === profileId) {
    return "hounds" satisfies GameRole;
  }

  return null;
}

export function nextTurnDeadline(turnSeconds: number) {
  return new Date(Date.now() + turnSeconds * 1000).toISOString();
}
