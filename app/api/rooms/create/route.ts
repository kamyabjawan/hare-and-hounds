import { NextResponse } from "next/server";
import type { GameRole, RoomPrivacy } from "@/types/database";
import { verifyRequestSession } from "@/lib/auth/session";
import { chooseRole, createWaitingRoom } from "@/lib/game/server";

export async function POST(request: Request) {
  try {
    const session = await verifyRequestSession(request);
    const body = (await request.json()) as {
      privacy?: RoomPrivacy;
      preferredRole?: GameRole | "random";
      turnSeconds?: number;
    };

    const room = await createWaitingRoom({
      profileId: session.profileId,
      privacy: body.privacy === "private" ? "private" : "public",
      role: chooseRole(body.preferredRole),
      turnSeconds: body.turnSeconds
    });

    return NextResponse.json({ roomId: room.id, code: room.code });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create room." },
      { status: 400 }
    );
  }
}
