import { z } from "zod";

export const mealTypes = ["breakfast", "lunch", "dinner", "snack", "shake", "other"] as const;

const optionalNonNegativeNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, "Value cannot be negative.").optional(),
);

export const mealFormSchema = z.object({
  mealType: z.enum(mealTypes),
  title: z.string().min(1, "Add a meal title.").max(160, "Keep the title under 160 characters."),
  calories: optionalNonNegativeNumber,
  proteinG: optionalNonNegativeNumber,
  carbsG: optionalNonNegativeNumber,
  fatG: optionalNonNegativeNumber,
  loggedAt: z.string().optional(),
  notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
});

export const waterLogSchema = z.object({
  amountMl: z.coerce.number().int().positive("Water amount must be positive."),
});

export type MealType = (typeof mealTypes)[number];
export type MealFormInput = z.infer<typeof mealFormSchema>;
export type WaterLogInput = z.infer<typeof waterLogSchema>;
