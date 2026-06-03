# Astra QA Report

Date: 2026-06-03

## Summary

Stability QA completed for build correctness, TypeScript, Supabase query safety, auth routing, CRUD mutation scoping, AI route error handling, form validation, and basic route smoke checks.

## Fixes Applied

- Hardened AI provider handling:
  - Missing AI provider keys now return a safe `503` message instead of exposing environment variable names.
  - Provider non-JSON responses now return `502`.
  - Provider malformed JSON content now returns `502`.
  - Malformed request JSON now returns `400` on AI routes.
- Improved onboarding accessibility:
  - Added explicit `id` and `htmlFor` links for onboarding form labels and fields.
- Confirmed existing stability fixes remain in place:
  - Client Supabase updates/deletes are scoped by `user_id`.
  - Active timer localStorage is scoped per user.
  - Time Orbit optional numeric validation handles blank fields correctly.
  - Dev Webpack filesystem cache remains disabled to avoid corrupted pack cache errors during module switching.

## Verification

Automated checks:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed.
- `npm run build` passed.

Smoke checks:

- Unauthenticated `/dashboard` returns `307` to `/login?next=%2Fdashboard`.
- `POST /api/ai/copilot` with malformed JSON returns `400` and `{"error":"Invalid JSON request body."}`.

Supabase/RLS review:

- Public tables in migrations have RLS enabled.
- Ownership policies use authenticated user ownership checks.
- Client mutations include `user_id` filters where the user ID is available.
- No service role key usage was found in client components.
- AI keys are only referenced from server-only AI provider code.

## Remaining Manual QA Limits

The following require a real authenticated browser session and seeded Supabase data:

- Full signup, email confirmation, login, logout, and onboarding happy path.
- Full CRUD flows across Tasks, Habits, Time Orbit, Nutrition, Training, Reviews, AI Copilot, and Settings.
- Quick Capture end-to-end confirmation into each destination table.
- AI generation with a real configured provider key.
- Mobile/tablet visual verification in a browser.

## Notes

- Supabase changelog reviewed. Relevant platform note: newer Supabase projects may require explicit Data API exposure/grants for SQL-created public tables. RLS remains required and is present in the migrations.
- No new product features were added in this QA pass.
