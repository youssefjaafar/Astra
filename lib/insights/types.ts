export type InsightOutcome = "mood" | "energy" | "focus";

/**
 * One calendar day (user timezone) with behaviors and outcomes joined.
 * Nullable fields distinguish "not logged" from "logged zero": sleepMinutes
 * stays null on days with no sleep block, and scores stay null without a
 * daily review.
 */
export type InsightDay = {
  date: string;
  hasReview: boolean;
  moodScore: number | null;
  energyScore: number | null;
  focusScore: number | null;
  journal: {
    whatWentWell: string | null;
    whatDrainedEnergy: string | null;
    whatToImprove: string | null;
  };
  tasksCompleted: number;
  habitLogCount: number;
  workoutCount: number;
  workoutMinutes: number;
  meditationMinutes: number;
  readingMinutes: number;
  prayerCount: number;
  mealCount: number;
  calories: number;
  waterMl: number;
  /** Last night's sleep, attributed to the wake day. Null = not logged. */
  sleepMinutes: number | null;
  scrollingMinutes: number;
};

/**
 * A same-day (lag 0) or previous-day (lag 1) split: mean outcome score on
 * days where the factor held vs. days where it didn't. Only emitted when
 * both sides meet the minimum sample size, so every comparison is honest.
 */
export type FactorComparison = {
  factorId: string;
  factorLabel: string;
  outcome: InsightOutcome;
  /** 0 = factor and score on the same day; 1 = factor on the previous day. */
  lag: 0 | 1;
  withDays: number;
  withoutDays: number;
  withMean: number;
  withoutMean: number;
  /** withMean - withoutMean, on the 1-10 score scale. */
  delta: number;
  /** 0-1, computed from sample size and effect size — never model-generated. */
  confidence: number;
};

export type GoalAlignment = {
  goalId: string;
  label: string;
  target: number;
  unit: string;
  period: "daily" | "weekly";
  periodsMet: number;
  periodsTotal: number;
  /** periodsMet / periodsTotal, 0 when there are no periods. */
  hitRate: number;
};

/** Days in the window on which each source has any data at all. */
export type InsightCoverage = {
  windowDays: number;
  reviewDays: number;
  journalDays: number;
  sleepLoggedDays: number;
  scrollingLoggedDays: number;
  workoutDays: number;
  waterLoggedDays: number;
  meditationDays: number;
  readingDays: number;
  prayerDays: number;
};

export type InsightStats = {
  window: { startDate: string; endDate: string; days: number };
  coverage: InsightCoverage;
  comparisons: FactorComparison[];
  goals: GoalAlignment[];
};
