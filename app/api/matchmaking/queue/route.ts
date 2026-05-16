import { NextResponse } from "next/server";
import type { GameRole } from "@/types/database";
import { verifyRequestSession } from "@/lib/auth/session";
import { chooseRole, createWaitingRoom, joinWaitingRoom } from "@/lib/game/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const session = await verifyRequestSession(request);
    const body = (await request.json()) as { preferredRole?: GameRole | "random" };
    const preferredRole = chooseRole(body.preferredRole);
    const supabase = createSupabaseAdminClient();

    const { data: rooms, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("status", "waiting")
      .eq("privacy", "public")
      .neq("created_by", session.profileId)
      .order("created_at", { ascending: true })
      .limit(12);

    if (error) {
      throw new Error(error.message);
    }

    const compatibleRoom = rooms.find((room) =>
      preferredRole === "hare" ? !room.hare_player_id : !room.hounds_player_id
    );

    if (compatibleRoom) {
      const room = await joinWaitingRoom(compatibleRoom, session.profileId);
      await supabase
        .from("matchmaking_queue")
        .upsert({ profile_id: session.profileId, status: "matched", room_id: room.id, preferred_role: preferredRole });
      return NextResponse.json({ roomId: room.id, code: room.code });
    }

    const room = await createWaitingRoom({
      profileId: session.profileId,
      privacy: "public",
      role: preferredRole
    });

    await supabase
      .from("matchmaking_queue")
      .upsert({ profile_id: session.profileId, status: "queued", room_id: room.id, preferred_role: preferredRole });

    return NextResponse.json({ roomId: room.id, code: room.code });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to enter matchmaking." },
      { status: 400 }
    );
  }
}
