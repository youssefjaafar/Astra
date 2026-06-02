import { z } from "zod";

export const habitCategories = [
  "hydration",
  "nutrition",
  "training",
  "reading",
  "prayer",
  "meditation",
  "sleep",
  "focus",
  "custom",
] as const;

export const habitFrequencies = ["daily", "weekly", "custom"] as const;

export const habitFormSchema = z.object({
  name: z.string().min(1, "Add a system name.").max(100, "Keep the name under 100 characters."),
  category: z.enum(habitCategories),
  targetFrequency: z.enum(habitFrequencies),
  targetValue: z.coerce.number().min(0, "Target cannot be negative.").optional(),
  unit: z.string().max(40, "Keep the unit short.").optional(),
  isActive: z.boolean(),
});

export const habitLogSchema = z.object({
  value: z.coerce.number().positive("Log a positive value."),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
});

export const readingLogSchema = z.object({
  bookTitle: z.string().max(160, "Keep the book title under 160 characters.").optional(),
  pagesRead: z.coerce.number().int().min(0, "Pages cannot be negative.").optional(),
  minutesRead: z.coerce.number().int().min(0, "Minutes cannot be negative.").optional(),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
}).refine((value) => Boolean(value.pagesRead || value.minutesRead), {
  message: "Log pages or minutes.",
  path: ["minutesRead"],
});

export const meditationLogSchema = z.object({
  durationMinutes: z.coerce.number().int().positive("Meditation duration must be positive."),
  technique: z.string().max(100, "Keep the technique under 100 characters.").optional(),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
});

export type HabitFormInput = z.infer<typeof habitFormSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type ReadingLogInput = z.infer<typeof readingLogSchema>;
export type MeditationLogInput = z.infer<typeof meditationLogSchema>;
export type HabitCategory = (typeof habitCategories)[number];
export type HabitFrequency = (typeof habitFrequencies)[number];
