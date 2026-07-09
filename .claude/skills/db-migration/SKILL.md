---
name: db-migration
description: Make a schema change in Astra across both DB providers — the default SQLite schema AND the preserved Supabase migration — keeping RLS/GRANTs, the SQLite CHECK/metadata, and the hand-written types and Zod enums in sync.
---

# Schema changes in Astra

Astra runs on **local SQLite by default**, with Supabase preserved behind `lib/db/` (see `DATA_LAYER.md`). A schema change must land in **both** providers or it silently no-ops on whichever one is active. There is no codegen and no SQLite migration runner — every mirror is hand-maintained.

Read `DATA_LAYER.md` first. For the Supabase half, also read `.agents/skills/supabase/SKILL.md` (security checklist) and, for performance-sensitive changes, `.agents/skills/supabase-postgres-best-practices/SKILL.md`.

## The mirrors — all change in the same commit

1. **`lib/db/sqlite/schema.ts`** (default provider):
   - `SCHEMA_SQL` — the `create table if not exists` / `create index if not exists` DDL. Mirror the CHECK constraints from the Postgres version. Use SQLite types: `text` for uuid/timestamptz/date/time, `integer` for booleans (`0/1`, default `1`/`0`), `real` for numeric. FKs reference `auth_users(id)`, not `auth.users`.
   - `TABLES` — column metadata: every column mapped to a `ColumnKind` (`text|integer|real|boolean|json`) and `hasUpdatedAt`. This drives value coercion and unknown-column rejection; a column missing here is invisible to the executor.
   - Add a composite `(user_id, <time-or-status column>)` index matching the query shape, like the existing ones.
2. **`supabase/migrations/YYYYMMDDHHMMSS_short_description.sql`** (preserved provider) — follow `20260601183000_initial_astra_schema.sql`. New table needs: `user_id uuid not null references auth.users (id) on delete cascade` + index; `enable row level security` + owner policies (`auth.uid() = user_id`) for all four verbs; **Data API GRANTs** to `authenticated` (see `SUPABASE_SETUP.md` step 4 — missing GRANTs surface as `isMissingTableError`). Enum-like columns → CHECK constraints, not Postgres enums.
3. **`lib/types/database.ts`** — the table's `Row`/`Insert`/`Update` types (hand-written).
4. **`lib/validations/<domain>.ts`** — Zod schema + const enum arrays (e.g. `taskCategories`) that **exactly match the CHECK values in both schemas**.

If you touch an existing CHECK constraint, grep its values across `lib/validations/`, both schema files, and UI option lists in `components/astra/`.

## Apply

- **SQLite (default):** `SCHEMA_SQL` runs at boot with `if not exists`, so it does **not** ALTER an existing `data/astra.db`. For a new table it just appears; for a changed/added column on an existing local DB, delete `data/astra.db` to recreate (local dev only — there is no data to preserve). Confirm `ASTRA_SQLITE_PATH` if set.
- **Supabase (preserved):** never auto-applied. `supabase link --project-ref <ref>` then `supabase db push`. If the CLI isn't available or you're not authorized, stop and tell the user which file to apply — a working app does not prove it's live (`isMissingTableError` degrades gracefully).

## Verify

- `npm run typecheck` catches type/mirror drift.
- Exercise the module in the dev server (default SQLite; `verify` skill). To test the Supabase path, set `NEXT_PUBLIC_ASTRA_DB_PROVIDER=supabase` against a project where the migration is applied.
- New preference columns: confirm the `/onboarding` redirect still holds — `user_preferences` existence drives it in `middleware.ts`.
