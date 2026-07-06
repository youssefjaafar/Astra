import { redirect } from "next/navigation";

import { WorkoutsModule } from "@/components/astra/workouts";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

const defaultWeeklyTarget = 3;

export default async function WorkoutsPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [workoutsResult, preferencesResult] = await Promise.all([
    supabase.from("workouts").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }),
    supabase.from("user_preferences").select("workout_target_weekly").eq("user_id", user.id).maybeSingle(),
  ]);

  const initialError = [
    formatSetupError(workoutsResult.error, "public.workouts"),
    formatSetupError(preferencesResult.error, "public.user_preferences"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <WorkoutsModule
      initialError={initialError || null}
      initialWeeklyTarget={preferencesResult.data?.workout_target_weekly ?? defaultWeeklyTarget}
      initialWorkouts={workoutsResult.data ?? []}
      userId={user.id}
    />
  );
}

function formatSetupError(error: { message: string; code?: string } | null, tableName: string) {
  if (!error) return null;
  return isMissingTableError(error) ? getDatabaseSetupMessage(tableName) : error.message;
}
