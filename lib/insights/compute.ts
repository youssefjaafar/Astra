// Layer 1 of the insight engine: deterministic statistics over the user's
// own logs. No AI calls here — the LLM layer narrates these numbers, it never
// computes them, so every delta and confidence value is reproducible.

import { dateStringInTimeZone } from "@/lib/dates";
import type { Database } from "@/lib/types/database";
import type {
  FactorComparison,
  GoalAlignment,
  InsightCoverage,
  InsightDay,
  InsightOutcome,
  InsightStats,
} from "./types";

type Tables = Database["public"]["Tables"];

export type InsightSignals = {
  reviews: Tables["daily_reviews"]["Row"][];
  tasks: Tables["tasks"]["Row"][];
  habitLogs: Tables["habit_logs"]["Row"][];
  timeBlocks: Tables["time_blocks"]["Row"][];
  meals: Tables["meals"]["Row"][];
  waterLogs: Tables["water_logs"]["Row"][];
  workouts: Tables["workouts"]["Row"][];
  prayerLogs: Tables["prayer_logs"]["Row"][];
  meditationLogs: Tables["meditation_logs"]["Row"][];
  readingLogs: Tables["reading_logs"]["Row"][];
};

type UserPreferences = Tables["user_preferences"]["Row"];

export const DEFAULT_WINDOW_DAYS = 28;
// Trigger gate: below a week of debriefs, any split is guaranteed to fail
// MIN_DAYS_PER_SIDE anyway, so the engine refuses to run instead of returning
// an empty-but-billable AI call.
export const MIN_REVIEW_DAYS_FOR_INSIGHTS = 7;
// Below 5 days per side a mean difference is mostly noise; comparisons that
// don't clear this bar are dropped entirely rather than reported with a
// tiny-sample disclaimer.
export const MIN_DAYS_PER_SIDE = 5;
const GOOD_SLEEP_MINUTES = 7 * 60;

const OUTCOME_KEYS: Record<InsightOutcome, "moodScore" | "energyScore" | "focusScore"> = {
  mood: "moodScore",
  energy: "energyScore",
  focus: "focusScore",
};

type FactorDefinition = {
  id: string;
  label: string;
  lag: 0 | 1;
  /** Null means the day has no data for this factor and is excluded. */
  predicate: (day: InsightDay) => boolean | null;
};

function emptyDay(date: string): InsightDay {
  return {
    date,
    hasReview: false,
    moodScore: null,
    energyScore: null,
    focusScore: null,
    journal: { whatWentWell: null, whatDrainedEnergy: null, whatToImprove: null },
    tasksCompleted: 0,
    habitLogCount: 0,
    workoutCount: 0,
    workoutMinutes: 0,
    meditationMinutes: 0,
    readingMinutes: 0,
    prayerCount: 0,
    mealCount: 0,
    calories: 0,
    waterMl: 0,
    sleepMinutes: null,
    scrollingMinutes: 0,
  };
}

/** Pure calendar-date arithmetic on a "YYYY-MM-DD" string; no timezone involved. */
function addDaysToDateString(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function blockMinutes(block: Tables["time_blocks"]["Row"]): number | null {
  if (typeof block.duration_minutes === "number") return block.duration_minutes;
  if (block.end_time) {
    return Math.max(0, (new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) / 60_000);
  }
  return null;
}

export function buildInsightDays(
  signals: InsightSignals,
  windowDates: string[],
  timeZone: string,
): InsightDay[] {
  const byDate = new Map(windowDates.map((date) => [date, emptyDay(date)]));
  const dayFor = (timestamp: string | null) =>
    timestamp ? byDate.get(dateStringInTimeZone(new Date(timestamp), timeZone)) : undefined;

  for (const review of signals.reviews) {
    const day = byDate.get(review.review_date);
    if (!day) continue;
    day.hasReview = true;
    day.moodScore = review.mood_score;
    day.energyScore = review.energy_score;
    day.focusScore = review.focus_score;
    day.journal = {
      whatWentWell: review.what_went_well,
      whatDrainedEnergy: review.what_drained_energy,
      whatToImprove: review.what_to_improve,
    };
  }

  for (const task of signals.tasks) {
    const day = dayFor(task.completed_at);
    if (day) day.tasksCompleted += 1;
  }
  for (const log of signals.habitLogs) {
    const day = dayFor(log.logged_at);
    if (day) day.habitLogCount += 1;
  }
  for (const meal of signals.meals) {
    const day = dayFor(meal.logged_at);
    if (!day) continue;
    day.mealCount += 1;
    day.calories += meal.calories ?? 0;
  }
  for (const log of signals.waterLogs) {
    const day = dayFor(log.logged_at);
    if (day) day.waterMl += log.amount_ml;
  }
  for (const workout of signals.workouts) {
    const day = dayFor(workout.logged_at);
    if (!day) continue;
    day.workoutCount += 1;
    day.workoutMinutes += workout.duration_minutes ?? 0;
  }
  for (const log of signals.prayerLogs) {
    if (log.completed === false) continue;
    const day = dayFor(log.logged_at);
    if (day) day.prayerCount += 1;
  }
  for (const log of signals.meditationLogs) {
    const day = dayFor(log.logged_at);
    if (day) day.meditationMinutes += log.duration_minutes;
  }
  for (const log of signals.readingLogs) {
    const day = dayFor(log.logged_at);
    if (day) day.readingMinutes += log.minutes_read ?? 0;
  }

  for (const block of signals.timeBlocks) {
    const minutes = blockMinutes(block);
    if (minutes === null || minutes <= 0) continue;
    if (block.category === "sleep") {
      // Sleep counts toward the day the block ends (the wake day), so
      // "slept well" lines up with the day the score describes.
      const wakeTimestamp = block.end_time ?? block.start_time;
      const day = dayFor(wakeTimestamp);
      if (day) day.sleepMinutes = (day.sleepMinutes ?? 0) + minutes;
    } else if (block.category === "scrolling") {
      const day = dayFor(block.start_time);
      if (day) day.scrollingMinutes += minutes;
    }
  }

  return windowDates.map((date) => byDate.get(date)!);
}

function buildFactors(preferences: UserPreferences | null): FactorDefinition[] {
  const factors: FactorDefinition[] = [
    { id: "workout_day", label: "Worked out that day", lag: 0, predicate: (d) => d.workoutCount > 0 },
    { id: "meditation_day", label: "Meditated that day", lag: 0, predicate: (d) => d.meditationMinutes > 0 },
    { id: "reading_day", label: "Read that day", lag: 0, predicate: (d) => d.readingMinutes > 0 },
    {
      id: "slept_7h_plus",
      label: "Slept 7h+ the night before",
      lag: 0,
      predicate: (d) => (d.sleepMinutes === null ? null : d.sleepMinutes >= GOOD_SLEEP_MINUTES),
    },
  ];

  if (preferences?.prayer_tracking_enabled) {
    factors.push({ id: "prayer_day", label: "Logged prayers that day", lag: 0, predicate: (d) => d.prayerCount > 0 });
  }
  const waterTarget = preferences?.water_target_ml ?? null;
  if (waterTarget) {
    factors.push({
      id: "water_target_met",
      label: "Hit the water target",
      lag: 0,
      predicate: (d) => d.waterMl >= waterTarget,
    });
  }
  const screenLimit = preferences?.screen_time_limit_minutes ?? null;
  if (screenLimit) {
    factors.push(
      {
        id: "screen_limit_exceeded",
        label: "Exceeded the screen-time limit",
        lag: 0,
        predicate: (d) => d.scrollingMinutes > screenLimit,
      },
      {
        id: "prev_day_screen_limit_exceeded",
        label: "Exceeded the screen-time limit the day before",
        lag: 1,
        predicate: (d) => d.scrollingMinutes > screenLimit,
      },
    );
  }

  return factors;
}

function mean(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round(value: number, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function compareFactor(
  days: InsightDay[],
  byDate: Map<string, InsightDay>,
  factor: FactorDefinition,
  outcome: InsightOutcome,
): FactorComparison | null {
  const withScores: number[] = [];
  const withoutScores: number[] = [];

  for (const day of days) {
    const score = day[OUTCOME_KEYS[outcome]];
    if (score === null) continue;
    const basis = factor.lag === 1 ? byDate.get(addDaysToDateString(day.date, -1)) : day;
    if (!basis) continue;
    const held = factor.predicate(basis);
    if (held === null) continue;
    (held ? withScores : withoutScores).push(score);
  }

  if (withScores.length < MIN_DAYS_PER_SIDE || withoutScores.length < MIN_DAYS_PER_SIDE) return null;

  const withMean = mean(withScores);
  const withoutMean = mean(withoutScores);
  const delta = withMean - withoutMean;
  // Sample factor saturates at 10 days per side; effect factor saturates at a
  // 2-point swing on the 1-10 scale. Both are needed: a big delta on few days
  // and a tiny delta on many days are equally weak claims.
  const sampleFactor = Math.min(1, Math.min(withScores.length, withoutScores.length) / 10);
  const effectFactor = Math.min(1, Math.abs(delta) / 2);

  return {
    factorId: factor.id,
    factorLabel: factor.label,
    outcome,
    lag: factor.lag,
    withDays: withScores.length,
    withoutDays: withoutScores.length,
    withMean: round(withMean),
    withoutMean: round(withoutMean),
    delta: round(delta),
    confidence: round(sampleFactor * effectFactor),
  };
}

function buildGoals(days: InsightDay[], preferences: UserPreferences | null): GoalAlignment[] {
  if (!preferences) return [];
  const goals: GoalAlignment[] = [];

  const daily = (
    goalId: string,
    label: string,
    target: number,
    unit: string,
    met: (day: InsightDay) => boolean,
  ) => {
    const periodsMet = days.filter(met).length;
    goals.push({
      goalId,
      label,
      target,
      unit,
      period: "daily",
      periodsMet,
      periodsTotal: days.length,
      hitRate: days.length ? round(periodsMet / days.length) : 0,
    });
  };

  if (preferences.water_target_ml) {
    const target = preferences.water_target_ml;
    daily("water", "Water intake", target, "ml", (d) => d.waterMl >= target);
  }
  if (preferences.reading_target_minutes) {
    const target = preferences.reading_target_minutes;
    daily("reading", "Reading", target, "minutes", (d) => d.readingMinutes >= target);
  }
  if (preferences.meditation_target_minutes) {
    const target = preferences.meditation_target_minutes;
    daily("meditation", "Meditation", target, "minutes", (d) => d.meditationMinutes >= target);
  }
  if (preferences.screen_time_limit_minutes) {
    const limit = preferences.screen_time_limit_minutes;
    daily("screen_time", "Screen time under limit", limit, "minutes", (d) => d.scrollingMinutes <= limit);
  }

  if (preferences.workout_target_weekly) {
    const target = preferences.workout_target_weekly;
    // Only complete Sunday-based weeks (matching getWeekStart elsewhere) are
    // scored; a partial week can't fairly miss a weekly target.
    const weekCounts = new Map<string, { workouts: number; daysPresent: number }>();
    for (const day of days) {
      const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
      const weekStart = addDaysToDateString(day.date, -weekday);
      const entry = weekCounts.get(weekStart) ?? { workouts: 0, daysPresent: 0 };
      entry.workouts += day.workoutCount;
      entry.daysPresent += 1;
      weekCounts.set(weekStart, entry);
    }
    const fullWeeks = [...weekCounts.values()].filter((week) => week.daysPresent === 7);
    const periodsMet = fullWeeks.filter((week) => week.workouts >= target).length;
    goals.push({
      goalId: "workouts_weekly",
      label: "Workouts per week",
      target,
      unit: "sessions",
      period: "weekly",
      periodsMet,
      periodsTotal: fullWeeks.length,
      hitRate: fullWeeks.length ? round(periodsMet / fullWeeks.length) : 0,
    });
  }

  return goals;
}

function buildCoverage(days: InsightDay[]): InsightCoverage {
  const count = (predicate: (day: InsightDay) => boolean) => days.filter(predicate).length;
  return {
    windowDays: days.length,
    reviewDays: count((d) => d.hasReview),
    journalDays: count(
      (d) => Boolean(d.journal.whatWentWell || d.journal.whatDrainedEnergy || d.journal.whatToImprove),
    ),
    sleepLoggedDays: count((d) => d.sleepMinutes !== null),
    scrollingLoggedDays: count((d) => d.scrollingMinutes > 0),
    workoutDays: count((d) => d.workoutCount > 0),
    waterLoggedDays: count((d) => d.waterMl > 0),
    meditationDays: count((d) => d.meditationMinutes > 0),
    readingDays: count((d) => d.readingMinutes > 0),
    prayerDays: count((d) => d.prayerCount > 0),
  };
}

export function computeInsightStats(
  days: InsightDay[],
  preferences: UserPreferences | null,
): InsightStats {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const comparisons: FactorComparison[] = [];

  for (const factor of buildFactors(preferences)) {
    for (const outcome of Object.keys(OUTCOME_KEYS) as InsightOutcome[]) {
      const comparison = compareFactor(days, byDate, factor, outcome);
      if (comparison) comparisons.push(comparison);
    }
  }
  comparisons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    window: {
      startDate: days[0]?.date ?? "",
      endDate: days[days.length - 1]?.date ?? "",
      days: days.length,
    },
    coverage: buildCoverage(days),
    comparisons,
    goals: buildGoals(days, preferences),
  };
}
