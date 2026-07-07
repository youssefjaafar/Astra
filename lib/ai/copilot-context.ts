import "server-only";

import {
  addDaysInTimeZone,
  resolveTimeZone,
  startOfDayInTimeZone,
  startOfWeekInTimeZone,
} from "@/lib/dates";
import type { createServerDbClient } from "@/lib/db/server";
import type { CopilotContextSummary } from "@/components/astra/ai/ai-utils";

type SupabaseServerClient = Awaited<ReturnType<typeof createServerDbClient>>;

export async function fetchCopilotContext(supabase: SupabaseServerClient, userId: string) {
  const profileResult = await supabase.from("profiles").select("timezone").eq("user_id", userId).maybeSingle();
  const timeZone = resolveTimeZone(profileResult.data?.timezone);

  const now = new Date();
  const todayStart = startOfDayInTimeZone(now, timeZone);
  const tomorrowStart = addDaysInTimeZone(todayStart, 1, timeZone);
  const weekStart = startOfWeekInTimeZone(now, timeZone);
  const recentStart = addDaysInTimeZone(todayStart, -13, timeZone);

  const [
    tasksResult,
    timeBlocksResult,
    mealsResult,
    waterLogsResult,
    habitsResult,
    habitLogsResult,
    workoutsResult,
    prayerLogsResult,
    meditationLogsResult,
    readingLogsResult,
    dailyReviewsResult,
    weeklyReviewResult,
    preferencesResult,
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(40),
    supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", todayStart.toISOString())
      .lt("start_time", tomorrowStart.toISOString())
      .order("start_time", { ascending: true }),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", todayStart.toISOString())
      .lt("logged_at", tomorrowStart.toISOString())
      .order("logged_at", { ascending: true }),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", todayStart.toISOString())
      .lt("logged_at", tomorrowStart.toISOString()),
    supabase.from("habits").select("*").eq("user_id", userId).eq("is_active", true).order("created_at", { ascending: false }),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("prayer_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("meditation_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("reading_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .order("logged_at", { ascending: false }),
    supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", userId)
      .gte("review_date", recentStart.toISOString().slice(0, 10))
      .order("review_date", { ascending: false })
      .limit(7),
    supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("week_start", { ascending: false }).limit(1),
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const errors = [
    tasksResult.error,
    timeBlocksResult.error,
    mealsResult.error,
    waterLogsResult.error,
    habitsResult.error,
    habitLogsResult.error,
    workoutsResult.error,
    prayerLogsResult.error,
    meditationLogsResult.error,
    readingLogsResult.error,
    dailyReviewsResult.error,
    weeklyReviewResult.error,
    preferencesResult.error,
  ].filter(Boolean);

  const context = {
    currentDate: now.toISOString(),
    period: {
      todayStart: todayStart.toISOString(),
      tomorrowStart: tomorrowStart.toISOString(),
      weekStart: weekStart.toISOString(),
    },
    userPreferences: preferencesResult.data,
    today: {
      tasks: summarizeTasks(tasksResult.data ?? [], todayStart, tomorrowStart),
      timeBlocks: timeBlocksResult.data ?? [],
      meals: mealsResult.data ?? [],
      waterMl: (waterLogsResult.data ?? []).reduce((sum, log) => sum + log.amount_ml, 0),
      waterLogCount: waterLogsResult.data?.length ?? 0,
    },
    thisWeek: {
      activeHabits: habitsResult.data ?? [],
      habitLogs: habitLogsResult.data ?? [],
      workouts: workoutsResult.data ?? [],
      prayerLogs: prayerLogsResult.data ?? [],
      meditationLogs: meditationLogsResult.data ?? [],
      readingLogs: readingLogsResult.data ?? [],
    },
    reviews: {
      recentDaily: dailyReviewsResult.data ?? [],
      latestWeekly: weeklyReviewResult.data?.[0] ?? null,
    },
  };

  const summary: CopilotContextSummary = {
    todayTasks: context.today.tasks.length,
    todayTimeBlocks: context.today.timeBlocks.length,
    todayMeals: context.today.meals.length,
    todayWaterLogs: context.today.waterLogCount,
    thisWeekHabits: context.thisWeek.habitLogs.length,
    thisWeekWorkouts: context.thisWeek.workouts.length,
    recentReviews: context.reviews.recentDaily.length,
    hasWeeklyReview: Boolean(context.reviews.latestWeekly),
    hasPreferences: Boolean(context.userPreferences),
    relatedPeriodStart: weekStart.toISOString(),
    relatedPeriodEnd: now.toISOString(),
  };

  return {
    context,
    summary,
    error: errors.map((error) => error?.message).join(" "),
  };
}

function summarizeTasks(
  tasks: Array<{
    title: string;
    status: string | null;
    priority: string | null;
    due_at: string | null;
    completed_at: string | null;
  }>,
  todayStart: Date,
  tomorrowStart: Date,
) {
  return tasks
    .filter((task) => {
      return (
        inRange(task.due_at, todayStart, tomorrowStart) ||
        inRange(task.completed_at, todayStart, tomorrowStart) ||
        (task.status !== "completed" && task.status !== "cancelled")
      );
    })
    .slice(0, 20)
    .map((task) => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      due_at: task.due_at,
      completed_at: task.completed_at,
    }));
}

function inRange(value: string | null, start: Date, end: Date) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
}
