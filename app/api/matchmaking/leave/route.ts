import { NextResponse } from "next/server";
import { verifyRequestSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const session = await verifyRequestSession(request);
    const supabase = createSupabaseAdminClient();

    await supabase.from("matchmaking_queue").delete().eq("profile_id", session.profileId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to leave matchmaking." },
      { status: 400 }
    );
  }
}
