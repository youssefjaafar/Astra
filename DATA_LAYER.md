# Data layer — SQLite (default) & Supabase (preserved)

Astra's data + auth run through a provider abstraction in `lib/db/`. **Local SQLite is the default**; the original Supabase implementation is preserved and reactivates by config with no code changes. Every app consumer imports from `lib/db/` and sees one interface — the `DbClient` shape in `lib/db/types.ts`, a typed subset of the supabase-js surface (`from().select().eq().order()…`, `auth.getUser()` etc.) — so page/module code reads identically under either provider.

## Provider selection — `lib/db/config.ts`

`getDbProvider()` resolves in this order:

1. `NEXT_PUBLIC_ASTRA_DB_PROVIDER` (`"sqlite"` | `"supabase"`) — explicit, always wins.
2. Else, if `NEXT_PUBLIC_SUPABASE_URL` is set → **supabase** (an existing deployment must never silently fall back to an empty local DB).
3. Else → **sqlite**.

`supportsEmailAuthFlows()` is `true` only under Supabase; the login/signup forms hide magic-link / resend-confirmation buttons when it's false (SQLite mode has no mail service).

## The two entry points

- Browser / `"use client"`: `createBrowserDbClient()` from `lib/db/client.ts`
- Server components / route handlers: `createServerDbClient()` from `lib/db/server.ts` (`server-only`, cookie-bound)

Both return a `DbClient`. In **Supabase mode** each returns the preserved `lib/supabase/*` client, cast to `DbClient`. In **SQLite mode**:

- The **server** client talks to SQLite directly (via the executor), reading the session user from the cookie and enforcing it on every op.
- The **browser** client is a thin HTTP shim: `from(...)` builds a serializable operation and POSTs it to `/api/db`; `auth.*` calls hit `/api/auth/*`. SQLite only exists server-side, so the browser never touches it. The SQLite browser client is a module singleton (it's stateless — builders are created per `from()`).

Never import `lib/supabase/*` directly from app code — always go through `lib/db/`.

## Query builder — `lib/db/builder.ts`

A chainable, thenable builder that only accumulates a `DbOperation` (table, action, filters, order, limit, returning, single-mode…). An injected **executor** runs it: direct SQLite on the server, `fetch("/api/db")` in the browser. Awaiting is memoized, so `await`-ing the same builder twice does not re-run the operation.

Supported subset: `select/insert/update/upsert/delete`, `eq/neq/gt/gte/lt/lte/is`, `or(...)` (only `col.eq.val,…` OR-of-equals segments), `order({ ascending, nullsFirst })`, `limit`, `single()`, `maybeSingle()`, `.select()` after a mutation for `RETURNING`.

## SQLite engine — `lib/db/sqlite/`

- **`connection.ts`** — one better-sqlite3 connection cached on `globalThis` (survives HMR). Pragmas: `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`. **`prepareCached(sql)`** returns a bounded-cache prepared statement — all hot paths use it to skip re-parsing. **Refuses to open on serverless hosts** (`VERCEL`/`AWS_LAMBDA_FUNCTION_NAME`/`NETLIFY`) because their filesystem is ephemeral — see `VERCEL_DEPLOYMENT.md`.
- **`schema.ts`** — `SCHEMA_SQL` (the `create table/index if not exists` DDL, CHECK constraints mirrored from the Postgres migrations) applied at boot, plus `TABLES` column metadata (`ColumnKind` per column) that drives value coercion. Composite `(user_id, <time column>)` indexes match the dominant query shape.
- **`executor.ts`** — compiles a `DbOperation` to SQL with **PostgREST-compatible semantics**: `enforceUserId` stamps/scopes every op to the session user (the RLS equivalent — a spoofed `user_id` in the payload is overridden); `single()`/`maybeSingle()` cardinality violations return code `PGRST116`; constraint failures map to Postgres codes (`23505`/`23514`/`23503`); a missing table returns `42P01` and an unknown column `42703` (so `isMissingTableError` still works and typos error instead of silently dropping). Booleans stored as `0/1`, JSON columns stringified. Multi-row inserts run in a transaction.
- **`auth.ts`** — local auth: `auth_users` / `auth_sessions` tables, scrypt password hashes (`scrypt:<salt>:<hash>`), an opaque 30-day session token stored **hashed** and set in the `astra_session` httpOnly cookie. Cookie `secure` flag derives from `NEXT_PUBLIC_APP_URL`'s protocol (so `http://` LAN self-hosting doesn't drop the cookie).

## Auth surface & middleware

- `/api/auth/[action]` — `session` (GET, read-only probe used by the browser client and middleware), `signin` / `signup` / `signout` (POST). Signin/signup are rate-limited (10 / 15 min per email, in-memory) and wrapped so DB errors return a friendly 500.
- `middleware.ts` is provider-aware. SQLite mode can't touch the DB from the edge runtime, so it verifies sessions by fetching `/api/auth/session`, with a 30s in-memory cache of fully-onboarded sessions and a prefetch fast-path (prefetch requests skip the session round-trip). Supabase mode keeps the original cookie-bound `@supabase/ssr` flow byte-for-byte.

## Timezones — `lib/dates.ts`

Server code must **not** use `setHours(0,0,0,0)` etc. — that yields the *server's* midnight and shifts every daily/weekly window for users in other zones. Use the profile-timezone helpers (`startOfDayInTimeZone`, `startOfWeekInTimeZone`, `addDaysInTimeZone`, `dateStringInTimeZone`, `midnightInTimeZone`, `resolveTimeZone`). `Intl.DateTimeFormat` instances are cached per timezone (construction is the expensive part).

## Local user management — no password reset in SQLite mode

There is no email-based reset. Use the script (also the E2E seeding path):

```bash
npm run db:user -- create <email> <password> [displayName]
npm run db:user -- reset-password <email> <newPassword>
```

Honors `ASTRA_SQLITE_PATH` (default `data/astra.db`); the DB file must already exist (start the app once).

## Local DB lifecycle

`data/astra.db` (gitignored) is created and its schema applied on first request. **There is no SQLite migration runner** — `schema.ts` uses `create … if not exists`, so adding a column to an *existing* local DB does not ALTER it. In local dev, delete `data/astra.db` to recreate from the current `SCHEMA_SQL`. See the `db-migration` skill for the full change flow across both providers.
