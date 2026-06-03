import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
const scoreSchema = z.coerce.number().int().min(1, "Minimum score is 1.").max(10, "Maximum score is 10.");

export const dailyReviewFormSchema = z.object({
  reviewDate: dateSchema,
  whatWentWell: z.string().max(2000, "Keep this under 2000 characters.").optional(),
  whatDrainedEnergy: z.string().max(2000, "Keep this under 2000 characters.").optional(),
  whatToImprove: z.string().max(2000, "Keep this under 2000 characters.").optional(),
  moodScore: scoreSchema,
  energyScore: scoreSchema,
  focusScore: scoreSchema,
});

export const dailyReviewAiRequestSchema = z.object({
  reviewDate: dateSchema,
});

export const weeklyReportAiRequestSchema = z.object({
  weekStart: dateSchema,
});

export const aiDailySummarySchema = z.object({
  went_well: z.array(z.string()).min(1).max(3),
  patterns: z.array(z.string()).min(1).max(2),
  course_correction: z.string().min(1),
});

export const aiWeeklyReportSchema = z.object({
  weekly_summary: z.string().min(1),
  wins: z.array(z.string()).min(1).max(5),
  struggles: z.array(z.string()).min(1).max(5),
  patterns: z.array(z.string()).min(1).max(6),
  best_signal_of_the_week: z.string().min(1),
  biggest_energy_drain: z.string().min(1),
  suggested_course_corrections: z.array(z.string()).min(1).max(6),
  one_small_commitment_for_tomorrow: z.string().min(1),
});

export type DailyReviewFormInput = z.infer<typeof dailyReviewFormSchema>;
export type AiDailySummary = z.infer<typeof aiDailySummarySchema>;
export type AiWeeklyReport = z.infer<typeof aiWeeklyReportSchema>;
