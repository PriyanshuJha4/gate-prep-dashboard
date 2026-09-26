# GATE 2027 CS Prep Dashboard

A multi-user prep dashboard for GATE 2027 Computer Science, built with Next.js and Tailwind. The app includes a shared syllabus tracker, weekly discipline grid, mock log trend, error log review, roadmap, profile settings, and group comparison view inspired by the brief you shared.

## Features

- User switching for friend-group style comparison
- Syllabus chapter checklist with per-subject progress bars
- Reverse calendar countdown and prep roadmap
- Weekly non-negotiables tracker with streak logic
- Mock score history trend view
- Error log pattern overview with reason tags
- Group leaderboard summary
- Resource, high-yield, and syllabus-change reference panels
- Responsive dark dashboard UI tuned for mobile and desktop

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Update the values in `.env.local` as needed.
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Supabase setup

Curriculum data in `lib/gateData.ts` is static reference content. User profiles and activity are stored in normalized Supabase tables. The migration seeds all subjects, chapters, and four default resources.

1. Create a Supabase project and enable Email authentication.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the project API settings.
3. In Supabase Auth > URL Configuration, allow the local and deployed `/reset-password` redirect URLs.
4. Apply `supabase/migrations/20260926000000_initial_schema.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI.
5. Set the same public project URL and anon key in Vercel environment variables, then deploy.

The app uses Supabase Auth, Row Level Security, normalized per-user tables, and Realtime subscriptions. Enable email/password in Supabase Auth. Browser storage is only an optimistic/offline cache; signed-in writes go through authenticated Supabase API requests. The Group view reads aggregate rows for signed-in users.

## Production notes

This project is structured to fit the Vercel deployment flow described in the brief:

- Next.js App Router
- Tailwind CSS for fast UI work
- Supabase Auth and Row Level Security
- PostgreSQL persistence through Supabase with realtime table subscriptions
- LocalStorage is used only as a temporary optimistic/offline cache

## Verification

The project is validated with a production build and ESLint:

```bash
npm run build
npm run lint
```
