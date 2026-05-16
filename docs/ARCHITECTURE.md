# Architecture

## Client

- Next.js App Router pages render the Telegram Mini App shell.
- Zustand stores session, local settings, and live room state.
- Framer Motion animates page transitions and board-piece movement.
- The board is SVG, with legal targets computed by `lib/game/engine.ts`.
- Sound effects are generated with the Web Audio API.

## Server

- `/api/auth/telegram` validates Telegram `initData`, upserts a profile, and signs a Supabase-compatible JWT.
- `/api/rooms/create` creates public or private waiting rooms.
- `/api/rooms/join` joins a waiting private/public room by code.
- `/api/matchmaking/queue` pairs compatible public waiting rooms or creates a new one.
- `/api/rooms/[roomId]/move` is the anti-cheat boundary for all gameplay changes.
- `/api/rooms/[roomId]/timeout` finalizes games when a turn timer expires.

## Game Engine

`lib/game/engine.ts` is framework-independent and shared by UI and server routes. It owns:

- board normalization
- piece occupancy
- legal move generation
- hound forward/sideways movement rules
- hare escape detection
- hounds trap detection
- hound stall detection
- next-turn calculation

## Supabase

Tables:

- `profiles`
- `game_rooms`
- `room_players`
- `moves`
- `matchmaking_queue`
- `elo_events`

Realtime:

- `game_rooms` updates synchronize status, board state, timers, and winner.
- `room_players` changes synchronize room occupancy.
- `moves` inserts synchronize the move log.

RLS:

- Leaderboard profiles are public.
- Room data is visible to participants and public waiting-room candidates.
- Move logs are visible to participants.
- Writes that affect matches are performed by verified server routes using the service role.
