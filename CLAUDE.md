# CLAUDE.md

Astra is a personal life operating system: tasks, habits, time tracking, nutrition, workouts, reviews, and AI insights in one app, backed by Supabase Auth + Postgres.

Stack: Next.js 15 App Router, React 19, TypeScript (strict), Supabase (`@supabase/ssr`), Tailwind CSS 3 + shadcn-style primitives (new-york), Framer Motion, Recharts, Zod + React Hook Form, OpenAI-compatible AI provider.

## Commands

- `npm run dev` — dev server (requires `.env.local`; see `.env.example`)
- `npm run typecheck` — `tsc --noEmit`; **`npm run test` is an alias for this** — there is no unit test framework
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)
- `npm run build` — production build
- `npm run test:e2e` — Playwright. **Self-skips unless `ASTRA_TEST_EMAIL` and `ASTRA_TEST_PASSWORD` are set** (needs a seeded live Supabase user). Auto-starts its own dev server on port 3100 (`ASTRA_E2E_PORT` to change, `ASTRA_BASE_URL` to target an existing server). A "passing" run with creds unset ran zero tests.

## Layout

- `app/` — routes. Landing `page.tsx`; auth pages `login/`, `signup/`, `onboarding/`; protected modules `dashboard/ tasks/ habits/ time/ meals/ workouts/ reviews/ ai/ settings/` (each with `loading.tsx`); `auth/callback/route.ts` (code exchange); `api/ai/{quick-capture,daily-review,weekly-report,copilot}/route.ts`.
- `components/astra/<module>/` — per-module client components; shared primitives (GlassCard, StatCard, ProgressRing, SectionHeader, EmptyState, skeletons) re-exported from `components/astra/index.ts`. `components/ui/` shadcn primitives, `components/layout/` AppShell/Sidebar/Topbar/BottomNav, `components/auth/` auth forms.
- `lib/supabase/` — the three clients (see below) + `errors.ts` (`isMissingTableError`).
- `lib/validations/` — Zod schemas per domain; enum const arrays mirror DB CHECK constraints.
- `lib/types/database.ts` — **manually maintained** DB types (not generated).
- `lib/ai/` — `provider.ts` (server-only, the only place that talks to the AI provider), `copilot-context.ts`, `prompts/`.
- `lib/auth/` — `redirect.ts` (open-redirect guards), `errors.ts` (friendly auth error copy).
- `middleware.ts` — auth gatekeeper (see below). `supabase/migrations/` — SQL migrations, applied manually.

## Core pattern

Every protected page follows the same shape (see `app/tasks/page.tsx`): async **server component** exporting `dynamic = "force-dynamic"` → `createSupabaseServerClient()` → `getUser()`, `redirect("/login")` if null → fetch scoped `.eq("user_id", user.id)` → pass data as props to a `"use client"` `<Module>Module.tsx` in `components/astra/<module>/` that owns state and mutates via the browser client. **No server actions** — client components write directly through the browser Supabase client; AI work goes through `api/ai/*` route handlers.

## Supabase clients — pick the right one

- Browser / `"use client"` components: `createSupabaseBrowserClient()` from `lib/supabase/client.ts`
- Server components / route handlers: `createSupabaseServerClient()` from `lib/supabase/server.ts` (cookie-bound, `server-only`)
- Admin operations only: `createSupabaseServiceRoleClient()` (same file; uses `SUPABASE_SERVICE_ROLE_KEY`)

Never let `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` reach browser code; only `NEXT_PUBLIC_*` vars are browser-safe. All tables use RLS with owner policies (`auth.uid() = user_id`) — always scope queries by `user_id`.

## Sync invariants — change these together

1. **DB CHECK constraints ↔ Zod enums ↔ types**: enum values in `supabase/migrations/` CHECK constraints, const arrays in `lib/validations/*.ts`, and `lib/types/database.ts` must stay in sync (types are hand-written, not generated).
2. **New protected route** → add to both `protectedRoutes` and `config.matcher` in `middleware.ts`, plus nav in `components/layout/` (Sidebar + BottomNav).
3. **E2E hooks**: the spec (`tests/e2e/astra-authenticated-crud.spec.ts`) finds cards by `data-testid` (`task-card`, `habit-card`, `time-block-card`, `meal-card`, `workout-card`, `review-card`) — keep these when refactoring card components.

## Gotchas

- `next.config.ts` disables the dev webpack cache **on purpose** (corrupted pack-cache errors) — don't "fix" it.
- `app/layout.tsx` injects a hydration-guard script stripping browser-extension attributes; `suppressHydrationWarning` is intentional.
- Middleware forces authenticated users **without a `user_preferences` row** to `/onboarding`; unauthenticated protected requests 307 to `/login?next=<path>`.
- Migrations are applied manually (`supabase link` + `supabase db push`) — never assume they're applied; `isMissingTableError` exists to handle that case gracefully.
- Anon key falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset (client, server, and middleware).
- Appearance settings live in `localStorage`, not the DB. Screen time ≈ `time_blocks.category = 'scrolling'`; sleep = `time_blocks.category = 'sleep'`.
- AI routes return safe status codes (503 missing key, 504 timeout, 502 bad response) and never leak provider details.

## Before Supabase/schema work

Read the vendored skills in `.agents/skills/supabase/SKILL.md` and `.agents/skills/supabase-postgres-best-practices/SKILL.md` (pinned by `skills-lock.json` — don't edit them). Deployment/ops docs: `SUPABASE_SETUP.md`, `VERCEL_DEPLOYMENT.md`, `PRODUCTION_NOTES.md`, `GO_LIVE_CHECKLIST.md`, `QA_REPORT.md`.
