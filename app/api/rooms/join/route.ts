import { NextResponse } from "next/server";
import { verifyRequestSession } from "@/lib/auth/session";
import { joinWaitingRoom } from "@/lib/game/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const session = await verifyRequestSession(request);
    const { code, roomId } = (await request.json()) as { code?: string; roomId?: string };

    if (!code && !roomId) {
      throw new Error("Enter a room code.");
    }

    const supabase = createSupabaseAdminClient();
    const query = supabase.from("game_rooms").select("*").eq("status", "waiting");
    const { data: room, error } = roomId
      ? await query.eq("id", roomId).single()
      : await query.eq("code", code?.trim().toUpperCase() ?? "").single();

    if (error || !room) {
      throw new Error("Room not found or already started.");
    }

    const joinedRoom = await joinWaitingRoom(room, session.profileId);
    return NextResponse.json({ roomId: joinedRoom.id, code: joinedRoom.code });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to join room." },
      { status: 400 }
    );
  }
}
