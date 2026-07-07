import { addDaysInTimeZone, midnightInTimeZone } from "@/lib/dates";
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

// Local calendar date, NOT toISOString().slice(0,10): the ISO slice returns
// the UTC date, which is yesterday for evening users in UTC-negative zones
// and tomorrow for late-night users in UTC-positive zones.
export function toDateString(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Pure calendar-date arithmetic on a "YYYY-MM-DD" string; no timezone involved. */
export function addDaysToDateString(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

// Range helpers interpret the date string in the runtime's local timezone by
// default (correct in the browser, where local time IS the user's time). On
// the server, pass the profile timezone so boundaries match the user's day.
export function getDayRange(dateString: string, timeZone?: string) {
  if (timeZone) {
    const start = midnightInTimeZone(dateString, timeZone);
    return { start, end: addDaysInTimeZone(start, 1, timeZone) };
  }
  const start = new Date(`${dateString}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

export function getWeekRange(weekStart: string, timeZone?: string) {
  if (timeZone) {
    const start = midnightInTimeZone(weekStart, timeZone);
    return {
      start,
      end: addDaysInTimeZone(start, 6, timeZone),
      endExclusive: addDaysInTimeZone(start, 7, timeZone),
    };
  }
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

export function filterSignalsForDay(signals: ReviewSignals, dateString: string, timeZone?: string) {
  const { start, end } = getDayRange(dateString, timeZone);

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

export function getDailySignalSummary(signals: ReviewSignals, dateString: string, timeZone?: string) {
  const day = filterSignalsForDay(signals, dateString, timeZone);
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

// review_date comparisons are pure calendar-date string matches, so the week's
// day strings come from string arithmetic — no timezone conversions involved.
export function getScoreChartData(reviews: DailyReview[], weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const dateString = addDaysToDateString(weekStart, index);
    const review = reviews.find((item) => item.review_date === dateString);

    return {
      day: weekdayLabel(dateString),
      mood: review?.mood_score ?? null,
      energy: review?.energy_score ?? null,
      focus: review?.focus_score ?? null,
    };
  });
}

export function getWeeklyTimeDistribution(signals: ReviewSignals, weekStart: string, timeZone?: string) {
  const { start, endExclusive } = getWeekRange(weekStart, timeZone);
  const blocks = signals.timeBlocks.filter((block) => inRange(block.start_time, start, endExclusive));
  const grouped = blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.category] = (acc[block.category] ?? 0) + Number(block.duration_minutes ?? 0);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, minutes]) => ({ category, minutes }));
}

export function getWeeklyTrainingData(signals: ReviewSignals, weekStart: string, timeZone?: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const dateString = addDaysToDateString(weekStart, index);
    const dayWorkouts = filterSignalsForDay(signals, dateString, timeZone).workouts;
    return {
      day: weekdayLabel(dateString),
      minutes: dayWorkouts.reduce((sum, workout) => sum + Number(workout.duration_minutes ?? 0), 0),
    };
  });
}

export function getWeeklyHabitCompletionData(signals: ReviewSignals, weekStart: string, timeZone?: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const dateString = addDaysToDateString(weekStart, index);
    const day = filterSignalsForDay(signals, dateString, timeZone);
    return {
      day: weekdayLabel(dateString),
      completions: day.habitLogs.length + day.prayerLogs.filter((log) => log.completed).length,
    };
  });
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

function weekdayLabel(dateString: string) {
  return weekdayFormatter.format(new Date(`${dateString}T00:00:00Z`));
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
