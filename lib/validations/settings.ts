import { z } from "zod";

const optionalNonNegativeInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(0, "Use zero or higher.").optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive("Use a positive value.").optional(),
);

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM.").nullable().optional();

export const profileSettingsSchema = z.object({
  displayName: z.string().max(120, "Keep the display name under 120 characters.").optional(),
  timezone: z.string().min(1, "Timezone is required.").max(80, "Keep the timezone under 80 characters."),
});

export const dailyTargetsSchema = z.object({
  wakeTime: timeSchema,
  sleepTime: timeSchema,
  waterTargetMl: optionalPositiveInteger,
  readingTargetMinutes: optionalNonNegativeInteger,
  workoutTargetWeekly: optionalNonNegativeInteger,
  meditationTargetMinutes: optionalNonNegativeInteger,
  screenTimeLimitMinutes: optionalNonNegativeInteger,
  prayerTrackingEnabled: z.boolean(),
});

export const aiBehaviorSettingsSchema = z.object({
  aiTone: z.enum(["calm", "direct", "strict", "encouraging"]),
  aiRecommendationStyle: z.enum(["minimal", "balanced", "detailed"]),
  dailyPlanningEnabled: z.boolean(),
  weeklyReportEnabled: z.boolean(),
  courseCorrectionEnabled: z.boolean(),
});

export const appearanceSettingsSchema = z.object({
  cockpitIntensity: z.enum(["calm", "balanced", "immersive"]),
  motionLevel: z.enum(["low", "normal", "high"]),
  backgroundStyle: z.enum(["starfield", "nebula", "minimal-dark"]),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type DailyTargetsInput = z.infer<typeof dailyTargetsSchema>;
export type AIBehaviorSettingsInput = z.infer<typeof aiBehaviorSettingsSchema>;
export type AppearanceSettingsInput = z.infer<typeof appearanceSettingsSchema>;
