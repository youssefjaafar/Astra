import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  displayName: z.string().min(1, "Add a display name.").max(80, "Keep the name under 80 characters."),
  timezone: z.string().min(1, "Choose a timezone."),
  mainGoal: z.string().max(500, "Keep the main goal under 500 characters.").optional(),
  wakeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM time."),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM time."),
  waterTargetMl: z.coerce.number().int().positive("Water target must be positive."),
  readingTargetMinutes: z.coerce.number().int().min(0, "Reading target cannot be negative."),
  workoutTargetWeekly: z.coerce.number().int().min(0, "Workout target cannot be negative."),
  meditationTargetMinutes: z.coerce.number().int().min(0, "Meditation target cannot be negative."),
  prayerTrackingEnabled: z.boolean(),
  screenTimeLimitMinutes: z.coerce.number().int().min(0, "Screen time target cannot be negative."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
