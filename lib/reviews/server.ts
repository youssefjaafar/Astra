import "server-only";

import type { createServerDbClient } from "@/lib/db/server";
import type { ReviewSignals } from "@/components/astra/reviews/review-utils";

type SupabaseServerClient = Awaited<ReturnType<typeof createServerDbClient>>;

type DateRange = {
  start: Date;
  endExclusive: Date;
};

export async function fetchReviewSignals(supabase: SupabaseServerClient, userId: string, range: DateRange) {
  const start = range.start.toISOString();
  const end = range.endExclusive.toISOString();

  const [
    tasksResult,
    habitLogsResult,
    timeBlocksResult,
    mealsResult,
    waterLogsResult,
    workoutsResult,
    prayerLogsResult,
    meditationLogsResult,
    readingLogsResult,
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).gte("completed_at", start).lt("completed_at", end),
    supabase.from("habit_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("time_blocks").select("*").eq("user_id", userId).gte("start_time", start).lt("start_time", end),
    supabase.from("meals").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("water_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("workouts").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("prayer_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("meditation_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("reading_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
  ]);

  const errors = [
    tasksResult.error,
    habitLogsResult.error,
    timeBlocksResult.error,
    mealsResult.error,
    waterLogsResult.error,
    workoutsResult.error,
    prayerLogsResult.error,
    meditationLogsResult.error,
    readingLogsResult.error,
  ].filter(Boolean);

  const signals: ReviewSignals = {
    tasks: tasksResult.data ?? [],
    habitLogs: habitLogsResult.data ?? [],
    timeBlocks: timeBlocksResult.data ?? [],
    meals: mealsResult.data ?? [],
    waterLogs: waterLogsResult.data ?? [],
    workouts: workoutsResult.data ?? [],
    prayerLogs: prayerLogsResult.data ?? [],
    meditationLogs: meditationLogsResult.data ?? [],
    readingLogs: readingLogsResult.data ?? [],
  };

  return {
    signals,
    error: errors.map((error) => error?.message).join(" "),
  };
}
