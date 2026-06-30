# Supabase Setup

This guide prepares Astra's Supabase backend for production.

## 1. Create Project

1. Create a Supabase project.
2. Store the project URL and anon key for Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Store the service role key only in server environments if needed:
   - `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service role key in browser code or any `NEXT_PUBLIC_*` variable.

## 2. Run Migrations

Install and authenticate the Supabase CLI, then run:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Required migrations live in `supabase/migrations` and create:

- `profiles`
- `user_preferences`
- `tasks`
- `habits`
- `habit_logs`
- `time_blocks`
- `meals`
- `water_logs`
- `workouts`
- `prayer_logs`
- `meditation_logs`
- `reading_logs`
- `daily_reviews`
- `weekly_reviews`
- `ai_insights`
- `quick_captures`

## 3. Verify RLS

All user-owned tables should have RLS enabled. Verify in SQL:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Every Astra table should show `rowsecurity = true`.

Confirm policies are owner-scoped:

```sql
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Policies should restrict authenticated users with `auth.uid() = user_id` or equivalent owner checks.

## 4. Verify Data API Access

If your Supabase project's Data API settings do not automatically expose SQL-created tables, grant access after confirming RLS is enabled:

```sql
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
```

Do not grant broad access without RLS.

## 5. Auth Setup

In Supabase Auth settings:

- Site URL local: `http://localhost:3000`
- Site URL production: `https://<your-production-domain>`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://<your-production-domain>/auth/callback`
  - Any Vercel preview URLs you intentionally test

The app uses `/auth/callback?next=/dashboard` for login and `/auth/callback?next=/onboarding` for signup.

## 6. Test Auth

1. Sign up with a test account.
2. Confirm email if confirmation is enabled.
3. Complete onboarding.
4. Confirm `/dashboard` loads.
5. Log out and log back in.
6. Confirm another account cannot read or mutate the first account's rows.

## 7. Optional Seed Data

Astra does not ship public shared demo data. For a single authenticated user, seed defaults through the UI or with SQL using that user's `auth.users.id`, then verify RLS still blocks other users.
