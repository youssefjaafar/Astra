# Astra QA Report

Date: 2026-06-04

## Summary

Stability QA completed for build correctness, TypeScript, Supabase query safety, auth routing, CRUD mutation scoping, AI route error handling, form validation, authenticated Playwright CRUD coverage, and mobile navigation smoke checks.

## Fixes Applied

- Hardened AI provider handling:
  - Missing AI provider keys now return a safe `503` message instead of exposing environment variable names.
  - Provider quota/billing failures now return safe user-facing messages instead of raw provider details.
  - Provider calls now time out with a controlled `504` response instead of hanging routes.
  - Provider non-JSON responses now return `502`.
  - Provider malformed JSON content now returns `502`.
  - Malformed request JSON now returns `400` on AI routes.
- Added authenticated Playwright E2E coverage:
  - Logs in with seeded Supabase test credentials supplied through environment variables.
  - Covers browser create/update/delete flows for Tasks, Time Orbit, Nutrition, and Training.
  - Covers create/log/update/deactivate for Habits, where destructive delete is not exposed in the UI.
  - Covers Daily Review create/update, AI Copilot error/success handling, Settings updates, and mobile bottom navigation smoke.
  - Uses stable `data-testid` hooks on repeated cards to avoid accidental interaction with existing user data.
- Improved chart stability:
  - Added a measured `SafeResponsiveContainer` wrapper for Recharts panels.
  - Removed Recharts `width(-1)` / `height(-1)` terminal warnings during route changes.
- Improved Settings resilience:
  - Normalized Supabase `time` values from `HH:MM:SS` to `HH:MM` before form validation.
  - AI behavior settings fall back to localStorage with a migration-aware success message if the live database is missing the personalization columns.
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
- Previous `ASTRA_TEST_EMAIL=... ASTRA_TEST_PASSWORD=... npm run test:e2e` passed with the seeded live Supabase test account.
- Latest production-readiness E2E retry was blocked at login by browser Supabase Auth `Failed to fetch`; rerun from a network environment that can reach the configured Supabase Auth endpoint.

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

- Email confirmation and new-account signup still require inbox access.
- Quick Capture confirmation into every destination table still depends on a healthy AI provider response; quota-limited AI is handled gracefully.
- AI generation quality still requires a configured provider account with available quota.
- Apply `20260603133311_add_settings_personalization_preferences.sql` to the live Supabase project to persist AI behavior settings in `user_preferences` instead of local fallback.

## Notes

- Supabase changelog reviewed. Relevant platform note: newer Supabase projects may require explicit Data API exposure/grants for SQL-created public tables. RLS remains required and is present in the migrations.
- No new product features were added in this QA pass; changes focus on stability, testability, and graceful failure handling.
