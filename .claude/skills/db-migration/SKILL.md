---
name: db-migration
description: Make a Supabase schema change in Astra — write the migration, keep RLS/GRANTs correct, and sync the hand-written types and Zod enums that mirror the schema.
---

# Schema changes in Astra

Before starting, read `.agents/skills/supabase/SKILL.md` (security checklist) and, for performance-sensitive changes, `.agents/skills/supabase-postgres-best-practices/SKILL.md`.

## 1. Write the migration

Create `supabase/migrations/YYYYMMDDHHMMSS_short_description.sql` (match the existing naming, e.g. `20260603133311_add_settings_personalization_preferences.sql`). Follow the style of `20260601183000_initial_astra_schema.sql`.

For any **new table**:

- `user_id uuid not null references auth.users (id) on delete cascade` + index on `user_id`
- `alter table ... enable row level security;` and owner policies (`auth.uid() = user_id`) for select/insert/update/delete — every user table in this app is RLS-owner-scoped
- **Data API GRANTs**: newer Supabase projects do not auto-expose SQL-created tables — grant to `authenticated` explicitly (see `SUPABASE_SETUP.md` step 4). Missing GRANTs surface in-app as "missing table" errors via `isMissingTableError`.

For **enum-like columns**, use CHECK constraints (the existing pattern), not Postgres enums.

## 2. Sync the mirrors (mandatory, same commit)

The schema is duplicated in two hand-maintained places — there is no codegen:

- `lib/types/database.ts` — add/adjust the table's `Row`/`Insert`/`Update` types
- `lib/validations/<domain>.ts` — Zod schema + const enum arrays (e.g. `taskCategories`) that must exactly match the CHECK constraint values

If you touch an existing CHECK constraint, grep for its values across `lib/validations/` and any UI option lists in `components/astra/` that render them.

## 3. Apply

Migrations are **never auto-applied**. Apply to the target project with:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

If the CLI isn't available or you're not authorized against the project, stop and tell the user which migration file to apply — don't assume it's live. The app tolerates unapplied migrations gracefully (`isMissingTableError` → setup messaging), so a "working" app does not prove the migration was applied.

## 4. Verify

- `npm run typecheck` (catches type/mirror drift)
- Exercise the affected module in the dev server against a project where the migration is applied (see the `verify` skill)
- New preference columns: confirm middleware behavior still holds — `user_preferences` existence drives the `/onboarding` redirect in `middleware.ts`
