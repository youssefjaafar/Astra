import type { Database } from "@/lib/types/database";

export type DailyReview = Database["public"]["Tables"]["daily_reviews"]["Row"];
export type WeeklyReview = Database["public"]["Tables"]["weekly_reviews"]["Row"];
export type ReviewTask = Database["public"]["Tables"]["tasks"]["Row"];
export type ReviewHabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type ReviewTimeBlock = Database["public"]["Tables"]["time_blocks"]["Row"];
export type ReviewMeal = Database["public"]["Tables"]["meals"]["Row"];
export type ReviewWaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
export type ReviewWorkout = Database["public"]["Tables"]["workouts"]["Row"];
export type ReviewPrayerLog = Database["public"]["Tables"]["prayer_logs"]["Row"];
export type ReviewMeditationLog = Database["public"]["Tables"]["meditation_logs"]["Row"];
export type ReviewReadingLog = Database["public"]["Tables"]["reading_logs"]["Row"];

export type ReviewSignals = {
  tasks: ReviewTask[];
  habitLogs: ReviewHabitLog[];
  timeBlocks: ReviewTimeBlock[];
  meals: ReviewMeal[];
  waterLogs: ReviewWaterLog[];
  workouts: ReviewWorkout[];
  prayerLogs: ReviewPrayerLog[];
  meditationLogs: ReviewMeditationLog[];
  readingLogs: ReviewReadingLog[];
};

export function todayDateString() {
  return toDateString(new Date());
}

export function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDayRange(dateString: string) {
  const start = new Date(`${dateString}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

export function getWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, endExclusive: new Date(end.getTime() + 24 * 60 * 60 * 1000) };
}

export function getWeekStart(date = new Date()) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return toDateString(start);
}

export function filterSignalsForDay(signals: ReviewSignals, dateString: string) {
  const { start, end } = getDayRange(dateString);

  return {
    tasks: signals.tasks.filter((task) => task.completed_at && inRange(task.completed_at, start, end)),
    habitLogs: signals.habitLogs.filter((log) => inRange(log.logged_at, start, end)),
    timeBlocks: signals.timeBlocks.filter((block) => inRange(block.start_time, start, end)),
    meals: signals.meals.filter((meal) => inRange(meal.logged_at, start, end)),
    waterLogs: signals.waterLogs.filter((log) => inRange(log.logged_at, start, end)),
    workouts: signals.workouts.filter((workout) => inRange(workout.logged_at, start, end)),
    prayerLogs: signals.prayerLogs.filter((log) => inRange(log.logged_at, start, end)),
    meditationLogs: signals.meditationLogs.filter((log) => inRange(log.logged_at, start, end)),
    readingLogs: signals.readingLogs.filter((log) => inRange(log.logged_at, start, end)),
  };
}

export function getDailySignalSummary(signals: ReviewSignals, dateString: string) {
  const day = filterSignalsForDay(signals, dateString);
  const totalTrackedMinutes = day.timeBlocks.reduce((sum, block) => sum + Number(block.duration_minutes ?? 0), 0);
  const deepWorkMinutes = day.timeBlocks
    .filter((block) => block.category === "deep_work")
    .reduce((sum, block) => sum + Number(block.duration_minutes ?? 0), 0);
  const distractionMinutes = day.timeBlocks
    .filter((block) => block.category === "scrolling" || block.category === "social")
    .reduce((sum, block) => sum + Number(block.duration_minutes ?? 0), 0);
  const waterMl = day.waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const prayerCompleted = day.prayerLogs.filter((log) => log.completed).length;
  const meditationMinutes = day.meditationLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
  const readingMinutes = day.readingLogs.reduce((sum, log) => sum + Number(log.minutes_read ?? 0), 0);
  const readingPages = day.readingLogs.reduce((sum, log) => sum + Number(log.pages_read ?? 0), 0);

  return {
    tasksCompleted: day.tasks.length,
    totalTrackedMinutes,
    deepWorkMinutes,
    distractionMinutes,
    mealsLogged: day.meals.length,
    waterMl,
    workouts: day.workouts.length,
    prayerCompleted,
    meditationMinutes,
    readingMinutes,
    readingPages,
  };
}

export function getScoreChartData(reviews: DailyReview[], weekStart: string) {
  const { start } = getWeekRange(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateString = toDateString(date);
    const review = reviews.find((item) => item.review_date === dateString);

    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      mood: review?.mood_score ?? null,
      energy: review?.energy_score ?? null,
      focus: review?.focus_score ?? null,
    };
  });
}

export function getWeeklyTimeDistribution(signals: ReviewSignals, weekStart: string) {
  const { start, endExclusive } = getWeekRange(weekStart);
  const blocks = signals.timeBlocks.filter((block) => inRange(block.start_time, start, endExclusive));
  const grouped = blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.category] = (acc[block.category] ?? 0) + Number(block.duration_minutes ?? 0);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, minutes]) => ({ category, minutes }));
}

export function getWeeklyTrainingData(signals: ReviewSignals, weekStart: string) {
  const { start } = getWeekRange(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateString = toDateString(date);
    const dayWorkouts = filterSignalsForDay(signals, dateString).workouts;
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      minutes: dayWorkouts.reduce((sum, workout) => sum + Number(workout.duration_minutes ?? 0), 0),
    };
  });
}

export function getWeeklyHabitCompletionData(signals: ReviewSignals, weekStart: string) {
  const { start } = getWeekRange(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateString = toDateString(date);
    const day = filterSignalsForDay(signals, dateString);
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      completions: day.habitLogs.length + day.prayerLogs.filter((log) => log.completed).length,
    };
  });
}

export function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining}m`;
  if (!remaining) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function formatLiters(ml: number) {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`;
  return `${ml}ml`;
}

function inRange(value: string | null, start: Date, end: Date) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
}
