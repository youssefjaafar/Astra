# Astra Go-Live Checklist

## Environment Variables

- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set only server-side if needed
- [ ] `AI_PROVIDER` set
- [ ] `OPENAI_API_KEY` set only server-side
- [ ] `.env.local` and production env files are not committed

## Supabase Setup

- [ ] Migrations applied
- [ ] `20260630120000_harden_auth_trigger_function.sql` applied
- [ ] Data API access verified
- [ ] RLS enabled on all Astra tables
- [ ] Owner policies verified
- [ ] Auth redirect URLs configured

## Auth Flow

- [ ] Login with password works
- [ ] Magic link works
- [ ] Signup works
- [ ] Email confirmation works if enabled
- [ ] Auth callback routes to onboarding/dashboard
- [ ] Logout works
- [ ] Session-expired redirects are understandable

## RLS Verification

- [ ] User A cannot read User B rows
- [ ] User A cannot update User B rows
- [ ] Inserts require matching `user_id`
- [ ] Updates cannot reassign `user_id`

## Modules

- [ ] Dashboard loads real data
- [ ] Tasks CRUD works
- [ ] Habits create/log/update works
- [ ] Time tracking CRUD works
- [ ] Meal logging CRUD works
- [ ] Water logging and undo works
- [ ] Workout logging CRUD works
- [ ] Daily Reviews save/update
- [ ] Weekly Reports handle AI unavailable state
- [ ] AI Copilot handles unavailable/quota state
- [ ] Settings profile/targets save

## Mobile Responsiveness

- [ ] `/dashboard` no horizontal overflow
- [ ] `/tasks` no horizontal overflow
- [ ] `/habits` no horizontal overflow
- [ ] `/time` no horizontal overflow
- [ ] `/meals` no horizontal overflow
- [ ] `/workouts` no horizontal overflow
- [ ] `/reviews` no horizontal overflow
- [ ] `/ai` no horizontal overflow
- [ ] `/settings` no horizontal overflow
- [ ] Bottom navigation works

## Deployment Verification

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes with seeded test credentials
- [ ] Vercel deployment succeeds
- [ ] Production logs show no recurring runtime errors
