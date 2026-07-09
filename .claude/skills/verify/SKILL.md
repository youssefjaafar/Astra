---
name: verify
description: Verify a code change in Astra end-to-end — static checks, driving the affected route in the dev server, build, and when to run Playwright E2E.
---

# Verifying changes in Astra

## Fast loop (every change)

```bash
npm run typecheck   # tsc --noEmit — `npm run test` is an alias for this
npm run lint
```

There is no unit test framework. If these pass, the only remaining risk is runtime behavior — verify it by driving the app, not by re-running static checks.

## Behavior check (any change with a runtime surface)

```bash
npm run dev
```

`.env.local` already exists. The default DB provider is **local SQLite** (`data/astra.db`, auto-created on first request) — no external service needed to log in. Seed/reset a local user with `npm run db:user -- create <email> <password>` (see `DATA_LAYER.md`). Then exercise the affected route:

- All module routes (`/dashboard`, `/tasks`, `/habits`, `/time`, `/meals`, `/workouts`, `/reviews`, `/ai`, `/settings`) **require login** — unauthenticated requests 307 to `/login?next=<path>`. A 307 from `curl` proves middleware works, not that the page renders.
- To check a protected page actually renders, log in through the browser (or POST `/api/auth/signin`, then reuse the `astra_session` cookie in `curl`). Users without a `user_preferences` row get forced to `/onboarding` — a redirect there is middleware behavior, not a bug in your change.
- API routes under `/api/ai/*` require an authenticated session cookie and return 401 otherwise; 503 means the AI provider key is missing, which is a config state, not a code failure.
- "Missing table" errors (`isMissingTableError` in `lib/supabase/errors.ts`, works for both providers) mean the schema isn't applied — for SQLite delete `data/astra.db` to recreate; for Supabase the migration isn't pushed. See the `db-migration` skill.
- To verify the preserved Supabase path, set `NEXT_PUBLIC_ASTRA_DB_PROVIDER=supabase` with the Supabase env vars; otherwise you're testing SQLite.

## Full check (before commit / anything touching build config, server components, or middleware)

```bash
npm run build
```

Dev mode masks server/client component boundary mistakes that the production build catches.

## E2E (schema, auth flow, or cross-module changes)

```bash
ASTRA_TEST_EMAIL=<email> ASTRA_TEST_PASSWORD=<password> npm run test:e2e
```

- **The suite skips itself entirely when those two vars are unset.** Exit code 0 without them means zero tests ran — never report that as E2E coverage.
- In the default SQLite mode, the test user is local: seed it once with `npm run db:user -- create "$ASTRA_TEST_EMAIL" "$ASTRA_TEST_PASSWORD"`, pointing `ASTRA_SQLITE_PATH` at the DB the test server uses. (In Supabase mode the creds must be a seeded live Supabase user instead.)
- Playwright auto-starts its own dev server on port 3100 (`ASTRA_E2E_PORT` overrides; set `ASTRA_BASE_URL` to target an already-running server).
- The spec locates cards by `data-testid` (`task-card`, `habit-card`, `time-block-card`, `meal-card`, `workout-card`, `review-card`) — if you renamed or restructured a card component, check those hooks survived.
