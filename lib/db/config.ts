export type DbProvider = "sqlite" | "supabase";

/**
 * Active database provider.
 *
 * Resolution order:
 * 1. Explicit NEXT_PUBLIC_ASTRA_DB_PROVIDER ("sqlite" | "supabase") always wins.
 * 2. If Supabase is configured (NEXT_PUBLIC_SUPABASE_URL set), stay on Supabase —
 *    an existing deployment must never silently switch to an empty local DB.
 * 3. Otherwise default to local SQLite.
 */
export function getDbProvider(): DbProvider {
  const explicit = process.env.NEXT_PUBLIC_ASTRA_DB_PROVIDER;
  if (explicit === "supabase") return "supabase";
  if (explicit === "sqlite") return "sqlite";
  return process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "sqlite";
}

/** Email-based flows (magic links, confirmation resend) need a hosted auth service. */
export function supportsEmailAuthFlows(): boolean {
  return getDbProvider() === "supabase";
}
