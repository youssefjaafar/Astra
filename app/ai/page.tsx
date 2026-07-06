import { redirect } from "next/navigation";

import { AICopilotModule } from "@/components/astra/ai";
import { fetchCopilotContext } from "@/lib/ai/copilot-context";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [insightsResult, contextResult] = await Promise.all([
    supabase.from("ai_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    fetchCopilotContext(supabase, user.id),
  ]);

  const initialError = [formatSetupError(insightsResult.error, "public.ai_insights"), contextResult.error]
    .filter(Boolean)
    .join(" ");

  return (
    <AICopilotModule
      initialContextSummary={contextResult.summary}
      initialError={initialError || null}
      initialInsights={insightsResult.data ?? []}
      userId={user.id}
    />
  );
}

function formatSetupError(error: { message: string; code?: string } | null, tableName: string) {
  if (!error) return null;
  return isMissingTableError(error) ? getDatabaseSetupMessage(tableName) : error.message;
}
