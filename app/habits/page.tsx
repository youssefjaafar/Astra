import { redirect } from "next/navigation";

import { HabitsModule } from "@/components/astra/habits";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [habitsResult, habitLogsResult, prayerLogsResult] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", sevenDaysAgo.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("prayer_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", todayStart.toISOString())
      .order("logged_at", { ascending: false }),
  ]);

  const initialError = [habitsResult.error?.message, habitLogsResult.error?.message, prayerLogsResult.error?.message]
    .filter(Boolean)
    .join(" ");

  return (
    <HabitsModule
      initialError={initialError || null}
      initialHabitLogs={habitLogsResult.data ?? []}
      initialHabits={habitsResult.data ?? []}
      initialPrayerLogs={prayerLogsResult.data ?? []}
      userId={user.id}
    />
  );
}
