import "server-only";

import type { GameRole, GameRoom, Profile, RoomPrivacy } from "@/types/database";
import { INITIAL_BOARD_STATE } from "@/lib/game/board";
import { DEFAULT_TURN_SECONDS, nextTurnDeadline } from "@/lib/game/engine";
import { calculateMatchElo } from "@/lib/game/elo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function chooseRole(preferredRole: GameRole | "random" | undefined): GameRole {
  if (preferredRole === "hare" || preferredRole === "hounds") {
    return preferredRole;
  }

  return Math.random() > 0.5 ? "hare" : "hounds";
}

export function opponentRole(role: GameRole): GameRole {
  return role === "hare" ? "hounds" : "hare";
}

export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function createWaitingRoom(options: {
  profileId: string;
  role: GameRole;
  privacy: RoomPrivacy;
  turnSeconds?: number;
}) {
  const supabase = createSupabaseAdminClient();
  const turnSeconds = Math.min(Math.max(options.turnSeconds ?? DEFAULT_TURN_SECONDS, 20), 120);
  let room: GameRoom | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await supabase
      .from("game_rooms")
      .insert({
        code: generateRoomCode(),
        privacy: options.privacy,
        status: "waiting",
        created_by: options.profileId,
        hare_player_id: options.role === "hare" ? options.profileId : null,
        hounds_player_id: options.role === "hounds" ? options.profileId : null,
        current_turn: "hounds",
        positions: INITIAL_BOARD_STATE,
        hound_stall_count: 0,
        move_count: 0,
        turn_duration_seconds: turnSeconds,
        state_version: 1
      })
      .select()
      .single();

    if (!error && data) {
      room = data;
      break;
    }

    if (!error?.message.includes("duplicate")) {
      throw new Error(error?.message ?? "Unable to create room.");
    }
  }

  if (!room) {
    throw new Error("Unable to allocate a unique room code.");
  }

  const { error: playerError } = await supabase.from("room_players").insert({
    room_id: room.id,
    profile_id: options.profileId,
    role: options.role,
    is_ready: true,
    joined_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString()
  });

  if (playerError) {
    throw new Error(playerError.message);
  }

  return room;
}

export async function joinWaitingRoom(room: GameRoom, profileId: string) {
  const supabase = createSupabaseAdminClient();

  if (room.status !== "waiting") {
    throw new Error("This room is no longer waiting for a player.");
  }

  if (room.hare_player_id === profileId || room.hounds_player_id === profileId) {
    return room;
  }

  const role = room.hare_player_id ? "hounds" : "hare";
  const now = new Date().toISOString();
  const deadline = nextTurnDeadline(room.turn_duration_seconds);

  const { data: updatedRoom, error } = await supabase
    .from("game_rooms")
    .update({
      status: "playing",
      hare_player_id: role === "hare" ? profileId : room.hare_player_id,
      hounds_player_id: role === "hounds" ? profileId : room.hounds_player_id,
      turn_started_at: now,
      turn_deadline: deadline,
      updated_at: now,
      state_version: room.state_version + 1
    })
    .eq("id", room.id)
    .eq("status", "waiting")
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: playerError } = await supabase.from("room_players").insert({
    room_id: room.id,
    profile_id: profileId,
    role,
    is_ready: true,
    joined_at: now,
    last_seen_at: now
  });

  if (playerError) {
    throw new Error(playerError.message);
  }

  return updatedRoom;
}

export async function applyEloForFinishedRoom(room: Pick<GameRoom, "id" | "hare_player_id" | "hounds_player_id" | "winner_role">) {
  if (!room.hare_player_id || !room.hounds_player_id || !room.winner_role) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [room.hare_player_id, room.hounds_player_id]);

  if (error) {
    throw new Error(error.message);
  }

  const hare = profiles.find((profile) => profile.id === room.hare_player_id);
  const hounds = profiles.find((profile) => profile.id === room.hounds_player_id);

  if (!hare || !hounds) {
    return;
  }

  const ratings = calculateMatchElo(hare.elo, hounds.elo, room.winner_role);
  await Promise.all([
    updateProfileRecord(hare, ratings.hare, room.winner_role === "hare"),
    updateProfileRecord(hounds, ratings.hounds, room.winner_role === "hounds")
  ]);
}

async function updateProfileRecord(profile: Profile, elo: number, won: boolean) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      elo,
      wins: profile.wins + (won ? 1 : 0),
      losses: profile.losses + (won ? 0 : 1),
      games_played: profile.games_played + 1,
      updated_at: new Date().toISOString()
    })
    .eq("id", profile.id);

  if (error) {
    throw new Error(error.message);
  }
}
