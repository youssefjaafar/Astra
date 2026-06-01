import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase publishable/anon key.");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
