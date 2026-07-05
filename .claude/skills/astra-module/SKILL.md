---
name: astra-module
description: Add a new module/route or significant feature to Astra following the established server-page → client-module pattern, with all the integration points (middleware, nav, validation, testids) that are easy to miss.
---

# Adding a module or feature to Astra

Copy the pattern of an existing module end-to-end; `tasks` is the cleanest reference. The checklist below is ordered so nothing gets orphaned.

## 1. Server page — `app/<module>/page.tsx`

Model on `app/tasks/page.tsx`:

- `export const dynamic = "force-dynamic";`
- async server component: `createSupabaseServerClient()` → `getUser()` → `redirect("/login")` if null
- fetch initial data scoped `.eq("user_id", user.id)`, pass `initialError` (from `error?.message`) and initial data as props
- add a sibling `app/<module>/loading.tsx` using skeletons from `components/astra/index.ts` (`PageSkeleton`, `CardGridSkeleton`, …)

## 2. Client module — `components/astra/<module>/<Module>Module.tsx`

- `"use client"`; owns all interactivity with `useState`/`useMemo` seeded from props — no Redux/Zustand, **no server actions**
- mutations go through `createSupabaseBrowserClient()` (`lib/supabase/client.ts`) with optimistic local-state updates; always include `user_id` on inserts (RLS)
- forms: React Hook Form + `zodResolver` with the schema from step 3
- build UI from shared primitives (`GlassCard`, `StatCard`, `SectionHeader`, `EmptyState` via `components/astra/index.ts`) and `components/ui/` shadcn primitives — don't hand-roll cards/buttons
- put `data-testid="<thing>-card"` on list-item cards (existing convention: `task-card`, `habit-card`, `meal-card`, …) so E2E can target them
- handle the unapplied-migration case: check errors with `isMissingTableError` (`lib/supabase/errors.ts`) and show setup messaging rather than a crash

## 3. Validation — `lib/validations/<module>.ts`

Zod schema + inferred types + const enum arrays whose values **exactly match the DB CHECK constraints**. New tables → follow the `db-migration` skill first.

## 4. Wiring (the easy-to-forget part)

- `middleware.ts`: add the route to **both** `protectedRoutes` and `config.matcher`
- Nav: add entries in `components/layout/` — Sidebar **and** BottomNav (mobile)
- Types: `lib/types/database.ts` for any new tables/columns (hand-maintained)
- If the dashboard should surface the module, extend `lib/dashboard/data.ts`

## 5. AI features (if applicable)

Never call the provider from components. Add a route handler under `app/api/ai/<feature>/route.ts` that: Zod-parses the request, auth-checks via server client, builds context, calls `generateJsonCompletion` from `lib/ai/provider.ts`, and re-validates the AI's JSON output with Zod before returning. Prompt builders live in `lib/ai/prompts/`.

## 6. Verify

Run the `verify` skill: typecheck + lint, drive the new route logged-in in the dev server, and `npm run build` (dev mode masks server/client boundary mistakes).
