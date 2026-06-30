# Production Notes

Date: 2026-06-30

## What Changed

- Added production environment documentation and `.env.example` coverage.
- Added Vercel deployment instructions.
- Added Supabase setup and RLS verification guide.
- Added go-live checklist.
- Added app-level, global, and not-found error boundaries.
- Updated auth email redirects to use `NEXT_PUBLIC_APP_URL` with a safe local fallback.
- Hardened the Supabase auth trigger function with a migration that revokes direct execute access from public API roles.
- Added confirmation prompts for destructive local and data-delete actions.
- Confirmed AI provider errors fail gracefully with bounded timeout behavior.
- Confirmed chart rendering uses a measured responsive wrapper to avoid layout warnings during route changes.

## Checks Run

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run test` passed.

Authenticated E2E command:

```bash
ASTRA_TEST_EMAIL=<seeded-user-email> ASTRA_TEST_PASSWORD=<seeded-user-password> npm run test:e2e
```

Latest E2E attempt was blocked before app CRUD by Supabase auth returning `Failed to fetch` in the browser login flow. A prior authenticated CRUD run had passed; rerun E2E from a network environment that can reach the configured Supabase Auth endpoint before final launch.

## Remaining Limitations

- AI output quality depends on provider quota and available tracked data.
- Appearance settings are still localStorage-backed.
- Screen time is approximated from `time_blocks.category = 'scrolling'`.
- Sleep is tracked from `time_blocks.category = 'sleep'`.
- Supabase CLI was not installed in this workspace, so the final hardening migration was created directly in `supabase/migrations`.

## Recommended Next Improvements

- Native mobile app
- iPhone Screen Time integration
- Push notifications
- Calendar integration
- Wearable integration
- Recurring reminders
- Offline mode
