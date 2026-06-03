import { z } from "zod";

export const workoutTypes = ["strength", "cardio", "judo", "mobility", "walking", "custom"] as const;
export const workoutIntensities = ["low", "medium", "high"] as const;

const positiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number({ required_error: "Add a duration." }).int().positive("Duration must be positive."),
);

export const workoutFormSchema = z.object({
  title: z.string().min(1, "Add a workout title.").max(160, "Keep the title under 160 characters."),
  workoutType: z.enum(workoutTypes),
  durationMinutes: positiveInteger,
  intensity: z.enum(workoutIntensities),
  loggedAt: z.string().optional(),
  notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
});

export type WorkoutType = (typeof workoutTypes)[number];
export type WorkoutIntensity = (typeof workoutIntensities)[number];
export type WorkoutFormInput = z.infer<typeof workoutFormSchema>;
