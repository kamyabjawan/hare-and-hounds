import { NextResponse } from "next/server";
import { verifyRequestSession } from "@/lib/auth/session";
import { applyEloForFinishedRoom, opponentRole } from "@/lib/game/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await context.params;
    await verifyRequestSession(request);
    const supabase = createSupabaseAdminClient();
    const { data: room, error } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();

    if (error || !room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "playing" || !room.turn_deadline) {
      return NextResponse.json({ ok: true });
    }

    if (new Date(room.turn_deadline).getTime() > Date.now()) {
      return NextResponse.json({ ok: true });
    }

    const winner = opponentRole(room.current_turn);
    const { data: updatedRoom, error: updateError } = await supabase
      .from("game_rooms")
      .update({
        status: "finished",
        winner_role: winner,
        result: "timeout",
        finished_at: new Date().toISOString(),
        turn_deadline: null,
        state_version: room.state_version + 1
      })
      .eq("id", room.id)
      .eq("status", "playing")
      .select()
      .single();

    if (updateError || !updatedRoom) {
      throw new Error("Unable to finalize timeout.");
    }

    await applyEloForFinishedRoom(updatedRoom);

    return NextResponse.json({ ok: true, winner });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resolve timeout." },
      { status: 400 }
    );
  }
}
