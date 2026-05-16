# Hare & Hounds Telegram Web App

A production-oriented Telegram Mini App game built with Next.js 15, TypeScript, Tailwind CSS, Supabase Realtime, Zustand, Framer Motion, and a server-verified Hare & Hounds rules engine.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apply the SQL in `supabase/migrations/20260517000000_initial_hare_hounds.sql` to your Supabase project, then open the app from your Telegram bot's Mini App button.

For deployment, security notes, and production settings, see `docs/DEPLOYMENT.md`.
