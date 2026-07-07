import "server-only";

import {
  addDaysInTimeZone,
  dateStringInTimeZone,
  resolveTimeZone,
  startOfDayInTimeZone,
  startOfWeekInTimeZone,
} from "@/lib/dates";
import type {
  DashboardCopilotInsight,
  DashboardMission,
  DashboardSystemStatus,
  DashboardTimeCategory,
  WeeklyMissionSnapshot,
} from "@/lib/types";
import type { Database } from "@/lib/types/database";
import type { createServerDbClient } from "@/lib/db/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createServerDbClient>>;

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TimeBlock = Database["public"]["Tables"]["time_blocks"]["Row"];
type Meal = Database["public"]["Tables"]["meals"]["Row"];
type WaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
type Workout = Database["public"]["Tables"]["workouts"]["Row"];
type PrayerLog = Database["public"]["Tables"]["prayer_logs"]["Row"];
type MeditationLog = Database["public"]["Tables"]["meditation_logs"]["Row"];
type ReadingLog = Database["public"]["Tables"]["reading_logs"]["Row"];
type DailyReview = Database["public"]["Tables"]["daily_reviews"]["Row"];
type AiInsight = Database["public"]["Tables"]["ai_insights"]["Row"];
type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];

export type DashboardData = {
  hero: {
    displayName: string;
    dayCompletion: number;
    focusState: string;
    statusLine: string;
  };
  mission: DashboardMission;
  statuses: DashboardSystemStatus[];
  timeDistribution: DashboardTimeCategory[];
  insight: DashboardCopilotInsight | null;
  dailyReview: DailyReview | null;
  weeklySnapshot: WeeklyMissionSnapshot;
  error: string | null;
};

const colors: Record<string, string> = {
  work: "#93c5fd",
  deep_work: "#67e8f9",
  admin: "#cbd5e1",
  meals: "#6ee7b7",
  training: "#a78bfa",
  reading: "#818cf8",
  prayer_meditation: "#c4b5fd",
  social: "#f0abfc",
  scrolling: "#fbbf24",
  rest: "#86efac",
  sleep: "#38bdf8",
  commute: "#60a5fa",
  other: "#94a3b8",
};

export async function getDashboardData(supabase: SupabaseServerClient, userId: string, email: string | null): Promise<DashboardData> {
  // Profile first: its timezone defines where "today" and "this week" start.
  const profileResult = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  const timeZone = resolveTimeZone(profileResult.data?.timezone);

  const now = new Date();
  const todayStart = startOfDayInTimeZone(now, timeZone);
  const tomorrowStart = addDaysInTimeZone(todayStart, 1, timeZone);
  const weekStart = startOfWeekInTimeZone(now, timeZone);
  const nextWeekStart = addDaysInTimeZone(weekStart, 7, timeZone);
  const todayDate = dateStringInTimeZone(now, timeZone);

  const [
    preferencesResult,
    tasksResult,
    todayTimeResult,
    weekTimeResult,
    mealsResult,
    weekMealsResult,
    waterResult,
    weekWaterResult,
    workoutsResult,
    prayerResult,
    meditationResult,
    readingResult,
    habitLogsResult,
    dailyReviewResult,
    insightResult,
  ] = await Promise.all([
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .or(`status.eq.open,status.eq.in_progress,status.eq.completed`)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", todayStart.toISOString())
      .lt("start_time", tomorrowStart.toISOString()),
    supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", weekStart.toISOString())
      .lt("start_time", nextWeekStart.toISOString()),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", todayStart.toISOString())
      .lt("logged_at", tomorrowStart.toISOString()),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", todayStart.toISOString())
      .lt("logged_at", tomorrowStart.toISOString()),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("prayer_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("meditation_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("reading_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", weekStart.toISOString())
      .lt("logged_at", nextWeekStart.toISOString()),
    supabase.from("daily_reviews").select("*").eq("user_id", userId).eq("review_date", todayDate).maybeSingle(),
    supabase.from("ai_insights").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
  ]);

  const errors = [
    profileResult.error,
    preferencesResult.error,
    tasksResult.error,
    todayTimeResult.error,
    weekTimeResult.error,
    mealsResult.error,
    weekMealsResult.error,
    waterResult.error,
    weekWaterResult.error,
    workoutsResult.error,
    prayerResult.error,
    meditationResult.error,
    readingResult.error,
    habitLogsResult.error,
    dailyReviewResult.error,
    insightResult.error,
  ].filter(Boolean);

  const preferences = preferencesResult.data;
  const tasks = tasksResult.data ?? [];
  const todayTimeBlocks = todayTimeResult.data ?? [];
  const weekTimeBlocks = weekTimeResult.data ?? [];
  const todayMeals = mealsResult.data ?? [];
  const weekWater = weekWaterResult.data ?? [];
  const todayWater = waterResult.data ?? [];
  const weekWorkouts = workoutsResult.data ?? [];
  const weekPrayer = prayerResult.data ?? [];
  const weekMeditation = meditationResult.data ?? [];
  const weekReading = readingResult.data ?? [];
  const weekHabitLogs = habitLogsResult.data ?? [];
  const latestInsight = insightResult.data?.[0] ?? null;
  const displayName = profileResult.data?.display_name || email?.split("@")[0] || "Commander";

  const statuses = getSystemStatuses({
    preferences,
    todayMeals,
    todayTimeBlocks,
    todayWater,
    weekWorkouts,
    weekPrayer,
    weekMeditation,
    weekReading,
  });
  const dayCompletion = Math.round(statuses.reduce((sum, status) => sum + status.progress, 0) / Math.max(statuses.length, 1));
  const deepWorkMinutes = sumMinutes(todayTimeBlocks.filter((block) => block.category === "deep_work"));
  const scrollingMinutes = sumMinutes(todayTimeBlocks.filter((block) => block.category === "scrolling"));

  return {
    hero: {
      displayName,
      dayCompletion,
      focusState: getFocusState(deepWorkMinutes, scrollingMinutes),
      statusLine: getStatusLine(dayCompletion, preferences),
    },
    mission: getMission(tasks, latestInsight, now, todayStart, tomorrowStart),
    statuses,
    timeDistribution: getTimeDistribution(todayTimeBlocks),
    insight: latestInsight ? toDashboardInsight(latestInsight) : null,
    dailyReview: dailyReviewResult.data ?? null,
    weeklySnapshot: getWeeklySnapshot({
      tasks,
      weekTimeBlocks,
      weekWater,
      weekWorkouts,
      weekPrayer,
      weekMeditation,
      weekReading,
      weekHabitLogs,
      preferences,
      weekStart,
      nextWeekStart,
    }),
    error: errors.map((error) => error?.message).join(" ") || null,
  };
}

function getMission(tasks: Task[], latestInsight: AiInsight | null, now: Date, todayStart: Date, tomorrowStart: Date): DashboardMission {
  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
  const dueToday = openTasks.filter((task) => inRange(task.due_at, todayStart, tomorrowStart));
  const highPriority = openTasks.filter((task) => task.priority === "high" || task.priority === "critical");
  const topPriorities = uniqueByTitle([...dueToday, ...highPriority])
    .slice(0, 3)
    .map((task) => task.title);
  const upcoming = openTasks
    .filter((task) => task.due_at && new Date(task.due_at).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.due_at ?? 0).getTime() - new Date(b.due_at ?? 0).getTime())[0];
  const completedToday = tasks.filter((task) => inRange(task.completed_at, todayStart, tomorrowStart)).length;

  return {
    topPriorities: topPriorities.length > 0 ? topPriorities : ["No urgent task signal yet. Choose one calm anchor for today."],
    nextEvent: {
      title: upcoming?.title ?? "No scheduled task",
      time: upcoming?.due_at ? formatTime(upcoming.due_at) : "Open orbit",
      context: upcoming?.due_at ? "Next upcoming task or reminder." : "Add due dates to let Astra sequence the day.",
    },
    mainWorkTask: openTasks.find((task) => task.category === "work")?.title ?? "No open work task tagged yet.",
    mainPersonalTask:
      openTasks.find((task) => task.category === "personal" || task.category === "health" || task.category === "spiritual")?.title ??
      "No open personal task tagged yet.",
    courseCorrection:
      latestInsight?.suggested_action ||
      latestInsight?.body ||
      (completedToday > 0
        ? "Keep the next action small enough to complete without forcing the system."
        : "Complete one visible task before adding more signal."),
  };
}

function getSystemStatuses({
  preferences,
  todayMeals,
  todayTimeBlocks,
  todayWater,
  weekWorkouts,
  weekPrayer,
  weekMeditation,
  weekReading,
}: {
  preferences: UserPreferences | null;
  todayMeals: Meal[];
  todayTimeBlocks: TimeBlock[];
  todayWater: WaterLog[];
  weekWorkouts: Workout[];
  weekPrayer: PrayerLog[];
  weekMeditation: MeditationLog[];
  weekReading: ReadingLog[];
}): DashboardSystemStatus[] {
  const waterMl = todayWater.reduce((sum, log) => sum + log.amount_ml, 0);
  const waterTarget = preferences?.water_target_ml ?? 2500;
  const readingMinutes = weekReading.reduce((sum, log) => sum + Number(log.minutes_read ?? 0), 0);
  const readingPages = weekReading.reduce((sum, log) => sum + Number(log.pages_read ?? 0), 0);
  const readingTarget = (preferences?.reading_target_minutes ?? 20) * 7;
  const workoutTarget = preferences?.workout_target_weekly ?? 3;
  const prayerCompletions = weekPrayer.filter((log) => log.completed).length;
  const meditationMinutes = weekMeditation.reduce((sum, log) => sum + Number(log.duration_minutes ?? 0), 0);
  const meditationTarget = (preferences?.meditation_target_minutes ?? 10) * 7;
  const sleepMinutes = sumMinutes(todayTimeBlocks.filter((block) => block.category === "sleep"));
  const screenMinutes = sumMinutes(todayTimeBlocks.filter((block) => block.category === "scrolling"));
  const screenLimit = preferences?.screen_time_limit_minutes ?? 240;

  return [
    {
      id: "hydration",
      name: "Hydration",
      current: formatLiters(waterMl),
      target: formatLiters(waterTarget),
      progress: progress(waterMl, waterTarget),
      message: waterMl >= waterTarget ? "Hydration target reached." : "Steady hydration keeps the system stable.",
      tone: "cyan",
    },
    {
      id: "nutrition",
      name: "Nutrition",
      current: `${todayMeals.length} meals`,
      target: "3 meals",
      progress: progress(todayMeals.length, 3),
      message: todayMeals.length > 0 ? "Fuel signal is active today." : "No meals logged yet today.",
      tone: "emerald",
    },
    {
      id: "training",
      name: "Training",
      current: `${weekWorkouts.length}`,
      target: `${workoutTarget}/week`,
      progress: progress(weekWorkouts.length, workoutTarget || 1),
      message: weekWorkouts.length > 0 ? "Training consistency is forming." : "No training signal yet this week.",
      tone: "violet",
    },
    {
      id: "reading",
      name: "Reading",
      current: readingPages > 0 ? `${readingPages} pages` : formatMinutes(readingMinutes),
      target: `${preferences?.reading_target_minutes ?? 20} min/day`,
      progress: progress(readingMinutes, readingTarget || 1),
      message: readingMinutes > 0 || readingPages > 0 ? "Reading signal is online." : "A small reading block would restart the signal.",
      tone: "blue",
    },
    {
      id: "prayer",
      name: "Prayer",
      current: `${prayerCompletions}`,
      target: "35/week",
      progress: progress(prayerCompletions, 35),
      message: prayerCompletions > 0 ? "Prayer anchors are being logged." : "No prayer anchor logged this week.",
      tone: "indigo",
    },
    {
      id: "meditation",
      name: "Meditation",
      current: formatMinutes(meditationMinutes),
      target: `${preferences?.meditation_target_minutes ?? 10} min/day`,
      progress: progress(meditationMinutes, meditationTarget || 1),
      message: meditationMinutes > 0 ? "Mindfulness signal is active." : "A brief sit is enough to log signal.",
      tone: "cyan",
    },
    {
      id: "sleep",
      name: "Sleep",
      current: formatMinutes(sleepMinutes),
      target: "8h",
      progress: progress(sleepMinutes, 480),
      message: sleepMinutes > 0 ? "Sleep tracked from Time Orbit." : "Track sleep in Time Orbit for recovery context.",
      tone: "emerald",
    },
    {
      id: "screen-time",
      name: "Screen Time",
      current: formatMinutes(screenMinutes),
      target: `< ${formatMinutes(screenLimit)}`,
      progress: Math.max(0, 100 - progress(screenMinutes, screenLimit || 1)),
      message: screenMinutes <= screenLimit ? "Still within the intended orbit." : "Distraction time is above today's limit.",
      tone: "amber",
    },
  ];
}

function getTimeDistribution(blocks: TimeBlock[]): DashboardTimeCategory[] {
  const grouped = blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.category] = (acc[block.category] ?? 0) + Number(block.duration_minutes ?? 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([, minutes]) => minutes > 0)
    .map(([category, minutes]) => ({
      name: formatCategory(category),
      hours: round(minutes / 60),
      fill: colors[category] ?? colors.other,
    }));
}

function getWeeklySnapshot({
  tasks,
  weekTimeBlocks,
  weekWater,
  weekWorkouts,
  weekPrayer,
  weekMeditation,
  weekReading,
  weekHabitLogs,
  preferences,
  weekStart,
  nextWeekStart,
}: {
  tasks: Task[];
  weekTimeBlocks: TimeBlock[];
  weekWater: WaterLog[];
  weekWorkouts: Workout[];
  weekPrayer: PrayerLog[];
  weekMeditation: MeditationLog[];
  weekReading: ReadingLog[];
  weekHabitLogs: Database["public"]["Tables"]["habit_logs"]["Row"][];
  preferences: UserPreferences | null;
  weekStart: Date;
  nextWeekStart: Date;
}): WeeklyMissionSnapshot {
  const weeklyTasks = tasks.filter((task) => inRange(task.due_at, weekStart, nextWeekStart) || inRange(task.completed_at, weekStart, nextWeekStart));
  const completedTasks = weeklyTasks.filter((task) => task.status === "completed" || inRange(task.completed_at, weekStart, nextWeekStart)).length;
  const readingMinutes = weekReading.reduce((sum, log) => sum + Number(log.minutes_read ?? 0), 0);
  const meditationMinutes = weekMeditation.reduce((sum, log) => sum + Number(log.duration_minutes ?? 0), 0);
  const prayerCompletion = weekPrayer.filter((log) => log.completed).length;
  const distractionMinutes = sumMinutes(weekTimeBlocks.filter((block) => block.category === "scrolling" || block.category === "social"));
  // Average over days elapsed so far this week, not a flat 7 — otherwise the
  // early-week average is misleadingly low.
  const daysElapsed = Math.min(7, Math.max(1, Math.ceil((Date.now() - weekStart.getTime()) / 86_400_000)));
  const hydrationAverage = Math.round(weekWater.reduce((sum, log) => sum + log.amount_ml, 0) / daysElapsed);

  return {
    taskCompletion: `${completedTasks}/${weeklyTasks.length}`,
    habitLogs: `${weekHabitLogs.length} logs`,
    trainingSessions: `${weekWorkouts.length}/${preferences?.workout_target_weekly ?? 3}`,
    readingMinutes: formatMinutes(readingMinutes),
    meditationMinutes: formatMinutes(meditationMinutes),
    prayerCompletion: `${prayerCompletion}/35`,
    hydrationAverage: formatLiters(hydrationAverage),
    distractionTime: formatMinutes(distractionMinutes),
  };
}

function toDashboardInsight(insight: AiInsight): DashboardCopilotInsight {
  return {
    title: insight.title,
    body: insight.body,
    confidence: Math.round(Number(insight.confidence ?? 0) * 100),
    suggestedAction: insight.suggested_action ?? "Keep tracking signals so Astra can refine the next course correction.",
  };
}

function getStatusLine(dayCompletion: number, preferences: UserPreferences | null) {
  if (preferences?.main_goal) return preferences.main_goal;
  if (dayCompletion >= 75) return "Today's systems are mostly aligned. Keep the next action simple.";
  if (dayCompletion >= 40) return "Astra has enough signal to guide the next small correction.";
  return "Signal history is still forming. Log a few anchors and keep the cockpit calm.";
}

function getFocusState(deepWorkMinutes: number, scrollingMinutes: number) {
  if (deepWorkMinutes >= 90 && scrollingMinutes <= 30) return "Deep Work Orbit";
  if (scrollingMinutes > deepWorkMinutes) return "Distraction Watch";
  if (deepWorkMinutes > 0) return "Focus Signal Active";
  return "Calibration Mode";
}

function uniqueByTitle(tasks: Task[]) {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    if (seen.has(task.title)) return false;
    seen.add(task.title);
    return true;
  });
}

function inRange(value: string | null, start: Date, end: Date) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
}

function progress(current: number, target: number) {
  return Math.min(100, Math.max(0, Math.round((current / Math.max(target, 1)) * 100)));
}

function sumMinutes(blocks: TimeBlock[]) {
  return blocks.reduce((sum, block) => sum + Number(block.duration_minutes ?? 0), 0);
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining}m`;
  if (!remaining) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function formatLiters(ml: number) {
  if (ml >= 1000) return `${round(ml / 1000)}L`;
  return `${ml}ml`;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function formatCategory(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
