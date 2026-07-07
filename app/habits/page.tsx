import { redirect } from "next/navigation";

import { HabitsModule } from "@/components/astra/habits";
import { addDaysInTimeZone, resolveTimeZone, startOfDayInTimeZone } from "@/lib/dates";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profileResult = await supabase.from("profiles").select("timezone").eq("user_id", user.id).maybeSingle();
  const timeZone = resolveTimeZone(profileResult.data?.timezone);
  const todayStart = startOfDayInTimeZone(new Date(), timeZone);
  const sevenDaysAgo = addDaysInTimeZone(todayStart, -6, timeZone);

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
