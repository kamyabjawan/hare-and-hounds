import { NextResponse } from "next/server";
import type { GameRole } from "@/types/database";
import type { MoveInput, NodeId, PieceId } from "@/lib/game/types";
import { verifyRequestSession } from "@/lib/auth/session";
import { applyMove, nextTurnDeadline, roleForProfile, serializeGameState } from "@/lib/game/engine";
import { applyEloForFinishedRoom } from "@/lib/game/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await context.params;
    const session = await verifyRequestSession(request);
    const body = (await request.json()) as {
      role: GameRole;
      piece: PieceId;
      from: NodeId;
      to: NodeId;
      stateVersion: number;
      clientNonce: string;
    };

    const supabase = createSupabaseAdminClient();
    const { data: room, error } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();

    if (error || !room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "playing") {
      throw new Error("This room is not active.");
    }

    if (room.state_version !== body.stateVersion) {
      throw new Error("Your board is behind the live game state.");
    }

    const role = roleForProfile(room, session.profileId);

    if (!role || role !== body.role) {
      throw new Error("You are not assigned to that side.");
    }

    const gameState = serializeGameState(room);
    const move: MoveInput = {
      role,
      piece: body.piece,
      from: body.from,
      to: body.to
    };
    const result = applyMove(gameState, move);

    if (!result.ok) {
      throw new Error(result.reason);
    }

    const now = new Date().toISOString();
    const winnerRole = result.state.winner;
    const nextVersion = room.state_version + 1;
    const { data: updatedRoom, error: updateError } = await supabase
      .from("game_rooms")
      .update({
        positions: result.state.positions,
        current_turn: result.state.currentTurn,
        hound_stall_count: result.state.houndStallCount,
        move_count: result.state.moveCount,
        winner_role: winnerRole,
        result: winnerRole === "hare" ? "hare_win" : winnerRole === "hounds" ? "hounds_win" : null,
        status: winnerRole ? "finished" : "playing",
        finished_at: winnerRole ? now : null,
        turn_started_at: winnerRole ? room.turn_started_at : now,
        turn_deadline: winnerRole ? null : nextTurnDeadline(room.turn_duration_seconds),
        state_version: nextVersion,
        updated_at: now
      })
      .eq("id", room.id)
      .eq("state_version", body.stateVersion)
      .select()
      .single();

    if (updateError || !updatedRoom) {
      throw new Error("Move conflicted with a newer game state.");
    }

    const { error: moveError } = await supabase.from("moves").insert({
      room_id: room.id,
      move_number: result.state.moveCount,
      player_id: session.profileId,
      role,
      piece: body.piece,
      from_node: body.from,
      to_node: body.to,
      board_before: gameState.positions,
      board_after: result.state.positions,
      state_version: nextVersion,
      client_nonce: body.clientNonce
    });

    if (moveError) {
      throw new Error(moveError.message);
    }

    if (winnerRole) {
      await applyEloForFinishedRoom(updatedRoom);
    }

    return NextResponse.json({ ok: true, room: updatedRoom, winReason: result.winReason });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Move rejected." },
      { status: 400 }
    );
  }
}
