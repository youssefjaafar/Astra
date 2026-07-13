# CLAUDE.md

Astra is a personal life operating system: tasks, habits, time tracking, nutrition, workouts, reviews, and AI insights in one app. Data + auth run on **local SQLite by default** (better-sqlite3, `data/astra.db`), with the original Supabase implementation preserved behind the `lib/db/` abstraction (`NEXT_PUBLIC_ASTRA_DB_PROVIDER=supabase` reactivates it).

Stack: Next.js 15 App Router, React 19, TypeScript (strict), better-sqlite3 (default provider) / Supabase (`@supabase/ssr`, dormant provider), Tailwind CSS 3 + shadcn-style primitives (new-york), Framer Motion, Recharts, Zod + React Hook Form, OpenAI-compatible AI provider.

## Commands

- `npm run dev` — dev server (requires `.env.local`; see `.env.example`)
- `npm run typecheck` — `tsc --noEmit`; **`npm run test` is an alias for this** — there is no unit test framework
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)
- `npm run build` — production build
- `npm run db:user -- create|reset-password <email> <password>` — manage local SQLite users (the only password-reset path in SQLite mode; also seeds the E2E user).
- `npm run test:e2e` — Playwright. The public demo/security spec always runs; authenticated CRUD coverage self-skips unless `ASTRA_TEST_EMAIL` and `ASTRA_TEST_PASSWORD` are set. Auto-starts its own dev server on port 3100 (`ASTRA_E2E_PORT` to change, `ASTRA_BASE_URL` to target an existing server).

## Layout

- `app/` — routes. Landing `page.tsx`; public static demo `demo/`; auth pages `login/`, `signup/`, `onboarding/`; protected modules `dashboard/ tasks/ habits/ time/ meals/ workouts/ reviews/ ai/ settings/` (each with `loading.tsx`); `auth/callback/route.ts` (code exchange); `api/ai/{quick-capture,daily-review,weekly-report,copilot}/route.ts`.
- `components/astra/<module>/` — per-module client components; shared primitives (GlassCard, StatCard, ProgressRing, SectionHeader, EmptyState, skeletons) re-exported from `components/astra/index.ts`. `components/ui/` shadcn primitives, `components/layout/` AppShell/Sidebar/Topbar/BottomNav, `components/auth/` auth forms.
- `lib/db/` — **the data layer every consumer imports**: `config.ts` (provider switch), `client.ts`/`server.ts` (provider-routed factories), `builder.ts` (supabase-shaped chainable builder), `types.ts` (`DbClient` interface), `sqlite/` (schema + metadata, connection, executor, local auth). `app/api/db/route.ts` executes browser ops with user scoping; `app/api/auth/[action]/route.ts` handles session/signin/signup/signout in SQLite mode.
- `lib/supabase/` — preserved Supabase clients (see below) + `errors.ts` (`isMissingTableError`). Only used when the provider is `supabase`; do not import directly from app code — go through `lib/db/`.
- `lib/validations/` — Zod schemas per domain; enum const arrays mirror DB CHECK constraints.
- `lib/types/database.ts` — **manually maintained** DB types (not generated).
- `lib/ai/` — `provider.ts` (server-only, the only place that talks to the AI provider), `copilot-context.ts`, `prompts/`.
- `lib/auth/` — `redirect.ts` (open-redirect guards), `errors.ts` (friendly auth error copy).
- `middleware.ts` — auth gatekeeper (see below). `supabase/migrations/` — SQL migrations, applied manually.

## Core pattern

Every protected page follows the same shape (see `app/tasks/page.tsx`): async **server component** exporting `dynamic = "force-dynamic"` → `createServerDbClient()` → `getUser()`, `redirect("/login")` if null → fetch scoped `.eq("user_id", user.id)` → pass data as props to a `"use client"` `<Module>Module.tsx` in `components/astra/<module>/` that owns state and mutates via the browser client. **No server actions** — client components write through the browser db client (which POSTs to `/api/db` in SQLite mode); AI work goes through `api/ai/*` route handlers.

The deliberate exception is `app/demo/page.tsx`: it is a public, statically generated, read-only showcase built only from `lib/mock-data` and local demo constants. It must never create a DB client, inspect/create an auth session, fetch `/api/db`, call `/api/ai/*`, or render a mutation-capable component. Demo CTAs may link to `/login` or `/signup`; locked module navigation must not silently enter protected routes.

## Public demo security boundary

- `/demo` is public and intentionally absent from both `protectedRoutes` and `config.matcher` in `middleware.ts`. `/dashboard` and every real module remain protected.
- Demo visitors stay unauthenticated. Do not implement the demo with a shared account, seeded credentials, Supabase anonymous sign-in, broader `anon` grants, or relaxed RLS policies.
- The demo Quick Capture is `DemoQuickCapture`, a static preview. Never reuse `DashboardQuickCapture` there: it writes `quick_captures`, calls the paid quick-capture endpoint, and can insert structured records.
- Prewritten demo AI content is presentation data, not generated at request time. All AI route handlers must continue verifying `auth.getUser()` before `generateJsonCompletion()` can run.
- Demo-aware shell branches (`AppShell`, `Sidebar`, `Topbar`, `BottomNav`) must not load profiles, sign out users, write data, or link locked modules to live workflows.
- Keep `tests/e2e/astra-public-demo.spec.ts` passing. It proves `/demo` opens without auth and makes no `/api/ai/*` or `/api/db` request, `/dashboard` still redirects to login, and anonymous requests to all paid AI routes return `401`.

## Database clients — pick the right one

- Browser / `"use client"` components: `createBrowserDbClient()` from `lib/db/client.ts`
- Server components / route handlers: `createServerDbClient()` from `lib/db/server.ts` (cookie-bound, `server-only`)
- Admin operations only (Supabase provider): `createSupabaseServiceRoleClient()` in `lib/supabase/server.ts` (uses `SUPABASE_SERVICE_ROLE_KEY`)

Both return the `DbClient` interface (`lib/db/types.ts`) — a typed subset of the supabase-js surface (`from().select().eq().order()…`, `auth.getUser()` etc.), so code reads identically under either provider. Never let `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` reach browser code; only `NEXT_PUBLIC_*` vars are browser-safe. Row ownership: in SQLite mode the executor stamps/scopes every operation with the session user (`/api/db` and the server client both enforce it); under Supabase it's RLS (`auth.uid() = user_id`). Always still scope queries by `user_id` explicitly.

Local auth (SQLite mode): `auth_users`/`auth_sessions` tables, scrypt password hashes, opaque 30-day session token in the `astra_session` httpOnly cookie. Middleware verifies sessions by fetching `/api/auth/session` (edge runtime can't touch SQLite). Magic links / email confirmation are Supabase-only; the forms hide those buttons via `supportsEmailAuthFlows()`.

## Sync invariants — change these together

1. **DB CHECK constraints ↔ Zod enums ↔ types**: enum values in `supabase/migrations/` CHECK constraints, the SQLite schema + column metadata in `lib/db/sqlite/schema.ts`, const arrays in `lib/validations/*.ts`, and `lib/types/database.ts` must stay in sync (types are hand-written, not generated).
2. **New protected route** → add to both `protectedRoutes` and `config.matcher` in `middleware.ts`, plus nav in `components/layout/` (Sidebar + BottomNav).
3. **E2E hooks**: the spec (`tests/e2e/astra-authenticated-crud.spec.ts`) finds cards by `data-testid` (`task-card`, `habit-card`, `time-block-card`, `meal-card`, `workout-card`, `review-card`) — keep these when refactoring card components.
4. **Public demo changes** → use only static fictional data, keep paid/data controls inert, and update `tests/e2e/astra-public-demo.spec.ts` whenever its route, shell, or security boundary changes.

## Gotchas

- `next.config.ts` disables the dev webpack cache **on purpose** (corrupted pack-cache errors) — don't "fix" it.
- `app/layout.tsx` injects a hydration-guard script stripping browser-extension attributes; `suppressHydrationWarning` is intentional.
- Middleware forces authenticated users **without a `user_preferences` row** to `/onboarding`; unauthenticated protected requests 307 to `/login?next=<path>`.
- Migrations are applied manually (`supabase link` + `supabase db push`) — never assume they're applied; `isMissingTableError` exists to handle that case gracefully.
- Anon key falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset (client, server, and middleware).
- Appearance settings live in `localStorage`, not the DB. Screen time ≈ `time_blocks.category = 'scrolling'`; sleep = `time_blocks.category = 'sleep'`.
- AI routes return safe status codes (503 missing key, 504 timeout, 502 bad response) and never leak provider details.
- A demo page that merely hides AI controls is not safe enough. The rendered demo component tree itself must contain no code path that can call AI or mutate data, and the server-side `401` checks remain defense in depth.

## Before Supabase/schema work

**`DATA_LAYER.md` is the reference for the SQLite/Supabase provider abstraction** (default provider, `lib/db/` shape, local auth, timezones, the `db:user` script). The `db-migration` skill covers schema changes across both providers. When touching the Supabase half, read the vendored skills in `.agents/skills/supabase/SKILL.md` and `.agents/skills/supabase-postgres-best-practices/SKILL.md` (pinned by `skills-lock.json` — don't edit them). Deployment/ops docs: `DATA_LAYER.md`, `SUPABASE_SETUP.md`, `VERCEL_DEPLOYMENT.md`, `PRODUCTION_NOTES.md`, `GO_LIVE_CHECKLIST.md`, `QA_REPORT.md`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
