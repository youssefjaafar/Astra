import { z } from "zod";

export const timeCategories = [
  "work",
  "deep_work",
  "admin",
  "meals",
  "training",
  "reading",
  "prayer_meditation",
  "social",
  "scrolling",
  "rest",
  "sleep",
  "commute",
  "other",
] as const;

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1, "Duration must be at least 1 minute.").optional(),
);

const optionalQualityScore = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1, "Quality starts at 1.").max(10, "Quality tops out at 10.").optional(),
);

export const timeBlockFormSchema = z
  .object({
    title: z.string().min(1, "Add a title for this time signal.").max(160, "Keep the title under 160 characters."),
    category: z.enum(timeCategories),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: optionalPositiveInteger,
    qualityScore: optionalQualityScore,
    notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
  })
  .refine((value) => Boolean(value.durationMinutes || value.startTime), {
    message: "Add a start time or duration.",
    path: ["durationMinutes"],
  })
  .refine(
    (value) => {
      if (!value.startTime || !value.endTime) return true;
      return new Date(value.endTime).getTime() > new Date(value.startTime).getTime();
    },
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    },
  );

export type TimeCategory = (typeof timeCategories)[number];
export type TimeBlockFormInput = z.infer<typeof timeBlockFormSchema>;
