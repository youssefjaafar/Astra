# Astra

Astra is a calm futuristic personal life operating system. It brings tasks, habits, time tracking, nutrition, training, reviews, AI insights, and settings into one mission-control cockpit backed by Supabase.

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Auth and Postgres
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion
- Recharts
- Zod
- React Hook Form
- OpenAI-compatible AI provider

## Environment Variables

Create `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Only `NEXT_PUBLIC_*` values are safe for browser code. Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` server-only.

## Supabase Setup

Apply the migrations in `supabase/migrations`:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The schema includes profiles, preferences, tasks, habits, time blocks, meals, water logs, workouts, prayer, meditation, reading, daily reviews, weekly reviews, AI insights, and quick captures. Row Level Security is enabled so authenticated users can only access their own rows.

Recent preference fields include AI tone/style and AI feature toggles:

- `ai_tone`
- `ai_recommendation_style`
- `daily_planning_enabled`
- `weekly_report_enabled`
- `course_correction_enabled`

Manual database types live in `lib/types/database.ts`.

## AI Setup

AI provider access is isolated in `lib/ai/provider.ts`. Current AI routes:

- `/api/ai/quick-capture`
- `/api/ai/daily-review`
- `/api/ai/weekly-report`
- `/api/ai/copilot`

The browser never receives AI provider keys.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
```

## Main Modules

- `/dashboard`: real daily command center using Supabase data
- `/tasks`: task planning and completion
- `/habits`: habits, prayer, meditation, and reading support
- `/time`: Time Orbit tracking
- `/meals`: nutrition and hydration
- `/workouts`: Training Log
- `/reviews`: Daily Debrief and Weekly Mission Report
- `/ai`: AI Copilot and saved insights
- `/settings`: profile, targets, AI behavior, appearance, and data controls

## Auth Flow

- `/login` supports email/password and magic links.
- `/signup` creates the Supabase user.
- `/onboarding` creates profile and preferences.
- `middleware.ts` protects app routes.
- Users without preferences are routed to onboarding.

## Quick Capture

Dashboard Quick Capture:

1. Saves raw text to `quick_captures`.
2. Calls the server-side AI parser.
3. Displays interpreted output.
4. Lets the user confirm or cancel.
5. Inserts confirmed data into the correct table.
6. Refreshes the dashboard after confirmation.

## Known Limitations

- Appearance preferences are currently stored in `localStorage`.
- AI responses depend on available tracked data and configured provider keys.
- Screen time is approximated from `time_blocks.category = 'scrolling'`.
- Sleep is tracked through `time_blocks.category = 'sleep'`.
- Some integrations are represented as planned future work.

## Roadmap

- Native mobile app
- iPhone Screen Time integration
- Calendar integration
- Push notifications
- Wearable integration
- Deeper AI planning memory
- Supabase-backed appearance preferences
