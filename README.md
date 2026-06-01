# Astra

Astra is a calm futuristic personal life operating system built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion, Recharts, Zod, React Hook Form, and Supabase PostgreSQL.

## Run locally

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` when integrations are ready:

```bash
cp .env.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

Only `NEXT_PUBLIC_*` values are safe for browser code. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Copy the service role key into `.env.local` only for trusted server-side operations.
4. Apply the migration in `supabase/migrations/20260601183000_initial_astra_schema.sql`.

With the Supabase CLI, the typical flow is:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The initial migration creates tables for profiles, tasks, habits, time tracking, meals, water, workouts, prayer, meditation, reading, reviews, AI insights, and quick captures. Row Level Security is enabled on every table so authenticated users can only access their own rows.

The second migration creates `user_preferences`, which stores onboarding targets such as wake time, sleep time, hydration, reading, workouts, meditation, prayer tracking, and screen-time limits. The app uses the presence of a `user_preferences` row to decide whether onboarding is complete.

Supabase helper clients live in:

- `lib/supabase/client.ts` for browser/client components using the anon key
- `lib/supabase/server.ts` for server-side clients and service-role usage

Manual database types live in `lib/types/database.ts`.

## Auth Flow

- `/login` supports email/password login and magic link login.
- `/signup` creates a Supabase Auth user and redirects to `/onboarding`.
- `/onboarding` stores the user profile and initial preferences.
- Main app routes are protected by `middleware.ts`.
- Unauthenticated users are redirected to `/login`.
- Authenticated users without onboarding preferences are redirected to `/onboarding`.
- The app shell shows the display name, current date, Astra Online status, navigation, and logout.

## AI Quick Capture

The dashboard Quick Capture flow stores the raw text in `quick_captures`, calls the server-only parser at `/api/ai/quick-capture`, then waits for user confirmation before writing a structured record.

The AI provider is isolated in `lib/ai/provider.ts`. By default it uses an OpenAI-compatible chat completions endpoint:

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=<server-only key>`
- `OPENAI_BASE_URL=https://api.openai.com/v1`
- `OPENAI_MODEL=gpt-4o-mini`

Do not expose `OPENAI_API_KEY` to client code.
