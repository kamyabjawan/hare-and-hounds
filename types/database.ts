export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type GameRole = "hare" | "hounds";
export type RoomStatus = "waiting" | "playing" | "finished" | "cancelled";
export type RoomPrivacy = "public" | "private";
export type GameResult = "hare_win" | "hounds_win" | "timeout" | "draw";

export type Profile = {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  elo: number;
  wins: number;
  losses: number;
  games_played: number;
  settings: Json;
  created_at: string;
  updated_at: string;
};

export type GameRoom = {
  id: string;
  code: string;
  status: RoomStatus;
  privacy: RoomPrivacy;
  created_by: string;
  hare_player_id: string | null;
  hounds_player_id: string | null;
  current_turn: GameRole;
  positions: Json;
  hound_stall_count: number;
  move_count: number;
  turn_started_at: string | null;
  turn_deadline: string | null;
  turn_duration_seconds: number;
  winner_role: GameRole | null;
  result: GameResult | null;
  state_version: number;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
};

export type RoomPlayer = {
  room_id: string;
  profile_id: string;
  role: GameRole;
  is_ready: boolean;
  joined_at: string;
  last_seen_at: string;
};

export type MoveRow = {
  id: string;
  room_id: string;
  move_number: number;
  player_id: string;
  role: GameRole;
  piece: string;
  from_node: string;
  to_node: string;
  board_before: Json;
  board_after: Json;
  state_version: number;
  client_nonce: string;
  created_at: string;
};

export type MatchmakingQueue = {
  id: string;
  profile_id: string;
  preferred_role: GameRole | null;
  status: "queued" | "matched" | "cancelled";
  room_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EloEvent = {
  id: string;
  room_id: string;
  profile_id: string;
  old_elo: number;
  new_elo: number;
  delta: number;
  created_at: string;
};

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<Profile, Partial<Profile> & Pick<Profile, "telegram_id" | "first_name">, Partial<Profile>>;
      game_rooms: TableDefinition<
        GameRoom,
        Partial<GameRoom> & Pick<GameRoom, "created_by" | "positions">,
        Partial<GameRoom>
      >;
      room_players: TableDefinition<RoomPlayer, RoomPlayer, Partial<RoomPlayer>>;
      moves: TableDefinition<
        MoveRow,
        Omit<MoveRow, "id" | "created_at"> & { id?: string; created_at?: string },
        Partial<MoveRow>
      >;
      matchmaking_queue: TableDefinition<
        MatchmakingQueue,
        Partial<MatchmakingQueue> & Pick<MatchmakingQueue, "profile_id">,
        Partial<MatchmakingQueue>
      >;
      elo_events: TableDefinition<
        EloEvent,
        Omit<EloEvent, "id" | "delta" | "created_at"> & { id?: string; created_at?: string },
        Partial<EloEvent>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      game_role: GameRole;
      room_status: RoomStatus;
      room_privacy: RoomPrivacy;
      game_result: GameResult;
    };
    CompositeTypes: Record<string, never>;
  };
};
