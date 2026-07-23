import { getDbProvider } from "@/lib/db/config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * Health check endpoint. Keeps the Supabase DB warm by doing a simple query.
 * Called by a scheduled task every 5 days to prevent DB inactivity lock.
 */
export async function GET() {
  try {
    if (getDbProvider() === "supabase") {
      const db = createSupabaseServiceRoleClient();
      // Simple query to verify Supabase connection
      await db.from("profiles").select("count", { count: "exact" }).limit(1);
    }
    return Response.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
