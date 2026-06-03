import type { Database } from "@/lib/types/database";
import type { MealType } from "@/lib/validations/nutrition";

export type AstraMeal = Database["public"]["Tables"]["meals"]["Row"];
export type WaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
export type UserPreference = Database["public"]["Tables"]["user_preferences"]["Row"];

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  shake: "Shake",
  other: "Other",
};

export function getNutritionSummary(meals: AstraMeal[], waterLogs: WaterLog[], waterTargetMl: number) {
  const calories = sumMeals(meals, "calories");
  const protein = sumMeals(meals, "protein_g");
  const carbs = sumMeals(meals, "carbs_g");
  const fat = sumMeals(meals, "fat_g");
  const waterMl = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const hydrationProgress = waterTargetMl > 0 ? Math.round((waterMl / waterTargetMl) * 100) : 0;

  return {
    calories,
    protein,
    carbs,
    fat,
    mealsLogged: meals.length,
    waterMl,
    waterTargetMl,
    hydrationProgress: Math.min(100, hydrationProgress),
  };
}

export function getMacroDistribution(meals: AstraMeal[]) {
  const protein = sumMeals(meals, "protein_g");
  const carbs = sumMeals(meals, "carbs_g");
  const fat = sumMeals(meals, "fat_g");

  return [
    { name: "Protein", grams: protein, fill: "#6ee7b7" },
    { name: "Carbs", grams: carbs, fill: "#67e8f9" },
    { name: "Fat", grams: fat, fill: "#a78bfa" },
  ].filter((item) => item.grams > 0);
}

export function getHydrationMessage(waterMl: number, targetMl: number) {
  const ratio = targetMl > 0 ? waterMl / targetMl : 0;

  if (ratio >= 1) return "Hydration flow stable.";
  if (ratio >= 0.55) return "Good progress. Keep the flow steady.";
  return "System needs more fluid intake.";
}

export function getProteinMessage(protein: number, target: number) {
  const ratio = target > 0 ? protein / target : 0;

  if (ratio >= 1) return "Protein signal complete. Training fuel is online.";
  if (ratio >= 0.6) return "Good protein progress. One useful meal can close the gap.";
  return "Add a simple protein anchor when the next meal comes online.";
}

export function formatMilliliters(value: number) {
  if (value >= 1000) {
    const liters = value / 1000;
    return `${Number.isInteger(liters) ? liters.toFixed(0) : liters.toFixed(1)}L`;
  }

  return `${value}ml`;
}

export function formatNumber(value: number, suffix = "") {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}${suffix}`;
}

export function formatMealTime(value: string | null) {
  if (!value) return "Time not logged";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function toDatetimeLocal(value: string | null) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function sortMealsByTime(meals: AstraMeal[]) {
  return [...meals].sort((a, b) => new Date(b.logged_at ?? 0).getTime() - new Date(a.logged_at ?? 0).getTime());
}

function sumMeals(meals: AstraMeal[], key: "calories" | "protein_g" | "carbs_g" | "fat_g") {
  return meals.reduce((sum, meal) => sum + Number(meal[key] ?? 0), 0);
}
