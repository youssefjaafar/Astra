import { z } from "zod";

export const workoutTypes = ["strength", "cardio", "judo", "mobility", "walking", "custom"] as const;
export const workoutIntensities = ["low", "medium", "high"] as const;

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive("Duration must be positive.").optional(),
);

export const workoutFormSchema = z.object({
  title: z.string().min(1, "Add a workout title.").max(160, "Keep the title under 160 characters."),
  workoutType: z.enum(workoutTypes),
  durationMinutes: optionalPositiveInteger,
  intensity: z.enum(workoutIntensities).nullable().optional(),
  loggedAt: z.string().optional(),
  notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
});

export type WorkoutType = (typeof workoutTypes)[number];
export type WorkoutIntensity = (typeof workoutIntensities)[number];
export type WorkoutFormInput = z.infer<typeof workoutFormSchema>;
