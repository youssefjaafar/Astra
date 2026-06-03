import { redirect } from "next/navigation";

import { MealsModule } from "@/components/astra/meals";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const defaultWaterTargetMl = 2500;

export default async function MealsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [mealsResult, waterResult, preferencesResult] = await Promise.all([
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", todayStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", todayStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("user_preferences")
      .select("water_target_ml")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const initialError = [
    formatSetupError(mealsResult.error, "public.meals"),
    formatSetupError(waterResult.error, "public.water_logs"),
    formatSetupError(preferencesResult.error, "public.user_preferences"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <MealsModule
      initialError={initialError || null}
      initialMeals={mealsResult.data ?? []}
      initialWaterLogs={waterResult.data ?? []}
      initialWaterTargetMl={preferencesResult.data?.water_target_ml ?? defaultWaterTargetMl}
      userId={user.id}
    />
  );
}

function formatSetupError(error: { message: string; code?: string } | null, tableName: string) {
  if (!error) return null;
  return isMissingTableError(error) ? getDatabaseSetupMessage(tableName) : error.message;
}
