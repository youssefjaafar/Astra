import "server-only";

import {
  addDaysInTimeZone,
  dateStringInTimeZone,
  resolveTimeZone,
  startOfDayInTimeZone,
} from "@/lib/dates";
import type { createServerDbClient } from "@/lib/db/server";
import {
  buildInsightDays,
  computeInsightStats,
  DEFAULT_WINDOW_DAYS,
  type InsightSignals,
} from "./compute";
import type { InsightDay, InsightStats } from "./types";
import type { Database } from "@/lib/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createServerDbClient>>;

export type FetchInsightStatsResult = {
  stats: InsightStats;
  days: InsightDay[];
  timeZone: string;
  preferences: Database["public"]["Tables"]["user_preferences"]["Row"] | null;
  error: string;
};

export async function fetchInsightStats(
  supabase: SupabaseServerClient,
  userId: string,
  options?: { windowDays?: number },
): Promise<FetchInsightStatsResult> {
  const windowDays = options?.windowDays ?? DEFAULT_WINDOW_DAYS;

  const profileResult = await supabase.from("profiles").select("timezone").eq("user_id", userId).maybeSingle();
  const timeZone = resolveTimeZone(profileResult.data?.timezone);

  const now = new Date();
  const todayStart = startOfDayInTimeZone(now, timeZone);
  const endExclusive = addDaysInTimeZone(todayStart, 1, timeZone);
  const windowStart = addDaysInTimeZone(todayStart, -(windowDays - 1), timeZone);
  // Sleep blocks usually start the evening before the wake day they count
  // toward, so time_blocks are fetched from one day earlier than the window.
  const blocksStart = addDaysInTimeZone(windowStart, -1, timeZone);

  const start = windowStart.toISOString();
  const end = endExclusive.toISOString();
  const startDateString = dateStringInTimeZone(windowStart, timeZone);
  const endDateStringExclusive = dateStringInTimeZone(endExclusive, timeZone);

  const [
    preferencesResult,
    reviewsResult,
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
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", userId)
      .gte("review_date", startDateString)
      .lt("review_date", endDateStringExclusive),
    supabase.from("tasks").select("*").eq("user_id", userId).gte("completed_at", start).lt("completed_at", end),
    supabase.from("habit_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", blocksStart.toISOString())
      .lt("start_time", end),
    supabase.from("meals").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("water_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("workouts").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("prayer_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("meditation_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
    supabase.from("reading_logs").select("*").eq("user_id", userId).gte("logged_at", start).lt("logged_at", end),
  ]);

  const errors = [
    profileResult.error,
    preferencesResult.error,
    reviewsResult.error,
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

  const signals: InsightSignals = {
    reviews: reviewsResult.data ?? [],
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

  const windowDates: string[] = [];
  for (let offset = 0; offset < windowDays; offset += 1) {
    windowDates.push(dateStringInTimeZone(addDaysInTimeZone(windowStart, offset, timeZone), timeZone));
  }

  const days = buildInsightDays(signals, windowDates, timeZone);
  const stats = computeInsightStats(days, preferencesResult.data ?? null);

  return {
    stats,
    days,
    timeZone,
    preferences: preferencesResult.data ?? null,
    error: errors.map((error) => error?.message).join(" "),
  };
}
