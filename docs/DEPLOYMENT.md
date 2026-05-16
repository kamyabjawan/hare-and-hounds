# Deployment Guide

## 1. Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run:

```sql
-- Paste supabase/migrations/20260517000000_initial_hare_hounds.sql
```

3. In **Database > Replication**, confirm realtime is enabled for:
   - `public.game_rooms`
   - `public.room_players`
   - `public.moves`

4. In **Project Settings > API**, copy:
   - Project URL
   - Publishable or anon key
   - Service role key
   - JWT secret

The service role key and JWT secret must only be used in server-side environment variables.

## 2. Telegram Bot Setup

1. Create a bot with BotFather.
2. Set the Mini App domain to your deployed URL.
3. Add a menu button or inline keyboard button that opens the Web App.
4. Put the bot token in `TELEGRAM_BOT_TOKEN`.

The app validates Telegram `initData` on the server before issuing a short-lived Supabase-compatible JWT.

## 3. Environment Variables

Set these in local `.env.local` and in your hosting provider:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot
NEXT_PUBLIC_DEMO_MODE=false

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
TELEGRAM_BOT_TOKEN=123456:telegram_bot_token
ALLOW_DEV_LOGIN=false
```

For local browser testing outside Telegram, set:

```bash
NEXT_PUBLIC_DEMO_MODE=true
ALLOW_DEV_LOGIN=true
```

Never enable `ALLOW_DEV_LOGIN` in production.

## 4. Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. For true Telegram auth, use a tunneling URL such as Cloudflare Tunnel or ngrok and configure that URL in BotFather.

## 5. Production Build

```bash
npm run check
npm run build
npm run start
```

Recommended hosting:

- Vercel for the Next.js app.
- Supabase managed Postgres and Realtime.
- A custom HTTPS domain connected to both Vercel and BotFather.

## 6. Security Model

- Telegram `initData` is validated with the bot token on the server.
- The browser receives a short-lived JWT signed with the Supabase JWT secret.
- RLS uses `auth.uid()` from the JWT subject, which maps to `profiles.id`.
- Clients subscribe to realtime state but submit moves to `/api/rooms/[roomId]/move`.
- The move API reloads the authoritative room state and applies the shared TypeScript engine before updating the room.
- The service role key is used only by server routes.

## 7. Realtime Flow

1. Room page loads the current `game_rooms`, `room_players`, and `moves` rows.
2. The page subscribes to Postgres changes for that room.
3. A player submits a move optimistically from the UI.
4. The server verifies role, turn, state version, legal move, timer, and win conditions.
5. Supabase broadcasts room and move inserts to both clients.

## 8. Production Optimizations

- Keep `turn_duration_seconds` between 20 and 120 seconds to avoid abandoned room buildup.
- Add a scheduled cleanup job for old `waiting` rooms and stale `matchmaking_queue` rows.
- Use Supabase pooler settings for serverless hosting.
- Track API errors and rejected moves in your observability tool.
- Add rate limiting by Telegram ID or profile ID on auth and move routes.
- Keep JWT expiry short for competitive matches.
- Use Vercel Edge Config or a server-side feature flag for emergency matchmaking shutdowns.

## 9. Database Maintenance

Useful cleanup SQL:

```sql
delete from public.matchmaking_queue
where updated_at < now() - interval '20 minutes'
  and status = 'queued';

update public.game_rooms
set status = 'cancelled'
where status = 'waiting'
  and created_at < now() - interval '30 minutes';
```

For high-traffic launches, add read replicas for analytics and keep gameplay writes on the primary database.
