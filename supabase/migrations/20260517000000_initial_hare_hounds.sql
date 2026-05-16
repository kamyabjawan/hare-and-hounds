create extension if not exists "pgcrypto";

do $$
begin
  create type public.game_role as enum ('hare', 'hounds');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_status as enum ('waiting', 'playing', 'finished', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_privacy as enum ('public', 'private');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.game_result as enum ('hare_win', 'hounds_win', 'timeout', 'draw');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique,
  username text,
  first_name text not null,
  last_name text,
  avatar_url text,
  elo integer not null default 1200 check (elo between 100 and 5000),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  status public.room_status not null default 'waiting',
  privacy public.room_privacy not null default 'private',
  created_by uuid not null references public.profiles(id) on delete cascade,
  hare_player_id uuid references public.profiles(id) on delete set null,
  hounds_player_id uuid references public.profiles(id) on delete set null,
  current_turn public.game_role not null default 'hounds',
  positions jsonb not null,
  hound_stall_count integer not null default 0 check (hound_stall_count >= 0),
  move_count integer not null default 0 check (move_count >= 0),
  turn_started_at timestamptz,
  turn_deadline timestamptz,
  turn_duration_seconds integer not null default 45 check (turn_duration_seconds between 20 and 120),
  winner_role public.game_role,
  result public.game_result,
  state_version integer not null default 1 check (state_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
  constraint game_rooms_two_distinct_players check (
    hare_player_id is null
    or hounds_player_id is null
    or hare_player_id <> hounds_player_id
  )
);

create table if not exists public.room_players (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.game_role not null,
  is_ready boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, profile_id),
  unique (room_id, role)
);

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  move_number integer not null check (move_number > 0),
  player_id uuid not null references public.profiles(id) on delete cascade,
  role public.game_role not null,
  piece text not null check (piece in ('hare', 'hound-1', 'hound-2', 'hound-3')),
  from_node text not null,
  to_node text not null,
  board_before jsonb not null,
  board_after jsonb not null,
  state_version integer not null check (state_version > 0),
  client_nonce text not null,
  created_at timestamptz not null default now(),
  unique (room_id, move_number),
  unique (room_id, client_nonce)
);

create table if not exists public.matchmaking_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  preferred_role public.game_role,
  status text not null default 'queued' check (status in ('queued', 'matched', 'cancelled')),
  room_id uuid references public.game_rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.elo_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  old_elo integer not null,
  new_elo integer not null,
  delta integer generated always as (new_elo - old_elo) stored,
  created_at timestamptz not null default now(),
  unique (room_id, profile_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_game_rooms_updated_at on public.game_rooms;
create trigger set_game_rooms_updated_at
before update on public.game_rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_matchmaking_queue_updated_at on public.matchmaking_queue;
create trigger set_matchmaking_queue_updated_at
before update on public.matchmaking_queue
for each row execute function public.set_updated_at();

create index if not exists profiles_elo_idx on public.profiles (elo desc, wins desc);
create index if not exists game_rooms_waiting_idx on public.game_rooms (status, privacy, created_at)
where status = 'waiting';
create index if not exists game_rooms_hare_player_idx on public.game_rooms (hare_player_id);
create index if not exists game_rooms_hounds_player_idx on public.game_rooms (hounds_player_id);
create index if not exists room_players_profile_idx on public.room_players (profile_id);
create index if not exists moves_room_order_idx on public.moves (room_id, move_number);
create index if not exists matchmaking_queue_status_idx on public.matchmaking_queue (status, created_at)
where status = 'queued';

alter table public.profiles enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.moves enable row level security;
alter table public.matchmaking_queue enable row level security;
alter table public.elo_events enable row level security;

drop policy if exists "profiles are visible for leaderboard" on public.profiles;
create policy "profiles are visible for leaderboard"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "players can update own profile settings" on public.profiles;
create policy "players can update own profile settings"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "participants can read their rooms" on public.game_rooms;
create policy "participants can read their rooms"
on public.game_rooms for select
to authenticated
using (
  created_by = (select auth.uid())
  or hare_player_id = (select auth.uid())
  or hounds_player_id = (select auth.uid())
  or (privacy = 'public' and status = 'waiting')
);

drop policy if exists "participants can read room players" on public.room_players;
create policy "participants can read room players"
on public.room_players for select
to authenticated
using (
  exists (
    select 1
    from public.game_rooms gr
    where gr.id = room_players.room_id
      and (
        gr.created_by = (select auth.uid())
        or gr.hare_player_id = (select auth.uid())
        or gr.hounds_player_id = (select auth.uid())
        or (gr.privacy = 'public' and gr.status = 'waiting')
      )
  )
);

drop policy if exists "participants can read moves" on public.moves;
create policy "participants can read moves"
on public.moves for select
to authenticated
using (
  exists (
    select 1
    from public.game_rooms gr
    where gr.id = moves.room_id
      and (
        gr.hare_player_id = (select auth.uid())
        or gr.hounds_player_id = (select auth.uid())
      )
  )
);

drop policy if exists "players can read own queue row" on public.matchmaking_queue;
create policy "players can read own queue row"
on public.matchmaking_queue for select
to authenticated
using (profile_id = (select auth.uid()));

drop policy if exists "players can read own elo events" on public.elo_events;
create policy "players can read own elo events"
on public.elo_events for select
to authenticated
using (profile_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.game_rooms, public.room_players, public.moves, public.matchmaking_queue, public.elo_events to authenticated;
grant update (settings, updated_at) on public.profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_rooms'
  ) then
    alter publication supabase_realtime add table public.game_rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_players'
  ) then
    alter publication supabase_realtime add table public.room_players;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'moves'
  ) then
    alter publication supabase_realtime add table public.moves;
  end if;
end $$;
