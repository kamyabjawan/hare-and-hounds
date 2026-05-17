"use client";

import { motion } from "framer-motion";
import { BOARD_EDGES, BOARD_POINTS, pointFor } from "@/lib/game/board";
import { legalMovesForPiece, normalizeBoardState, roleForProfile } from "@/lib/game/engine";
import type { GameRoom } from "@/types/database";
import type { NodeId, PieceId } from "@/lib/game/types";
import { cn } from "@/lib/utils/cn";
import { useHaptics } from "@/hooks/use-haptics";
import { useSound } from "@/hooks/use-sound";
import { useSubmitMove } from "@/hooks/use-submit-move";
import { useSessionStore } from "@/stores/session-store";
import { useGameStore } from "@/stores/game-store";

type GameBoardProps = {
  room: GameRoom;
};

export function GameBoard({ room }: GameBoardProps) {
  const profile = useSessionStore((state) => state.profile);
  const selectedPiece = useGameStore((state) => state.selectedPiece);
  const setSelectedPiece = useGameStore((state) => state.setSelectedPiece);
  const { submitMove, isSubmitting, error } = useSubmitMove(room.id);
  const haptic = useHaptics();
  const playSound = useSound();
  const board = normalizeBoardState(room.positions);
  const role = profile ? roleForProfile(room, profile.id) : null;
  const activePieceIds: PieceId[] = role === "hare" ? ["hare"] : role === "hounds" ? ["hound-1", "hound-2", "hound-3"] : [];
  const canMove = role !== null && room.status === "playing" && room.current_turn === role && !isSubmitting;
  const legalTargets = selectedPiece ? legalMovesForPiece(board, selectedPiece as PieceId) : [];

  function pieceNode(piece: PieceId) {
    if (piece === "hare") {
      return board.hare;
    }

    return board.hounds[Number(piece.replace("hound-", "")) - 1];
  }

  async function handleNodeClick(node: NodeId) {
    if (!canMove || !selectedPiece) {
      return;
    }

    const from = pieceNode(selectedPiece as PieceId);

    if (!legalTargets.includes(node)) {
      haptic("error");
      playSound("error");
      return;
    }

    const ok = await submitMove(
      {
        role,
        piece: selectedPiece as PieceId,
        from,
        to: node
      },
      room.state_version
    );

    if (ok) {
      setSelectedPiece(null);
      haptic("medium");
      playSound("move");
    }
  }

  function handlePieceClick(piece: PieceId) {
    if (!canMove || !activePieceIds.includes(piece)) {
      return;
    }

    setSelectedPiece(selectedPiece === piece ? null : piece);
    haptic("light");
  }

  return (
    <section className="space-y-3">
      <div className="glass relative overflow-hidden rounded-lg p-3">
        <svg viewBox="0 0 400 240" role="img" aria-label="Hare and Hounds board" className="aspect-[5/3] w-full">
          <defs>
            <filter id="pieceGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.34" />
            </filter>
          </defs>

          {BOARD_EDGES.map(([from, to]) => {
            const a = pointFor(from);
            const b = pointFor(to);
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            );
          })}

          {BOARD_POINTS.map((point) => {
            const isTarget = legalTargets.includes(point.id);
            return (
              <motion.g
                key={point.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => void handleNodeClick(point.id)}
                className={cn(canMove && selectedPiece ? "cursor-pointer" : "")}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isTarget ? 15 : 9}
                  fill={isTarget ? "rgba(78,230,168,0.28)" : "rgba(255,255,255,0.22)"}
                  stroke={isTarget ? "#4EE6A8" : "rgba(255,255,255,0.38)"}
                  strokeWidth={isTarget ? 3 : 2}
                />
              </motion.g>
            );
          })}

          <Piece
            id="hare"
            node={board.hare}
            label="H"
            color="#FFB547"
            selected={selectedPiece === "hare"}
            disabled={!canMove || role !== "hare"}
            onClick={handlePieceClick}
          />

          {board.hounds.map((node, index) => {
            const piece = `hound-${index + 1}` as PieceId;
            return (
              <Piece
                key={piece}
                id={piece}
                node={node}
                label={`${index + 1}`}
                color="#61C6FF"
                selected={selectedPiece === piece}
                disabled={!canMove || role !== "hounds"}
                onClick={handlePieceClick}
              />
            );
          })}
        </svg>
      </div>
      {error ? <p className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{error}</p> : null}
    </section>
  );
}

function Piece({
  id,
  node,
  label,
  color,
  selected,
  disabled,
  onClick
}: {
  id: PieceId;
  node: NodeId;
  label: string;
  color: string;
  selected: boolean;
  disabled: boolean;
  onClick: (piece: PieceId) => void;
}) {
  const point = pointFor(node);

  return (
    <motion.g
      layout
      initial={false}
      animate={{ x: point.x, y: point.y, scale: selected ? 1.12 : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      onClick={(event) => {
        event.stopPropagation();
        onClick(id);
      }}
      className={cn(disabled ? "cursor-default" : "cursor-pointer")}
      filter="url(#pieceGlow)"
    >
      <circle r={19} fill={color} stroke={selected ? "#ffffff" : "rgba(255,255,255,0.5)"} strokeWidth={selected ? 4 : 2} />
      <text
        y="5"
        textAnchor="middle"
        className="select-none fill-ink text-sm font-black"
        aria-hidden="true"
      >
        {label}
      </text>
    </motion.g>
  );
}
