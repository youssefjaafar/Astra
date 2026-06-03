import type { Database } from "@/lib/types/database";

export type AIInsight = Database["public"]["Tables"]["ai_insights"]["Row"];

export type CopilotContextSummary = {
  todayTasks: number;
  todayTimeBlocks: number;
  todayMeals: number;
  todayWaterLogs: number;
  thisWeekHabits: number;
  thisWeekWorkouts: number;
  recentReviews: number;
  hasWeeklyReview: boolean;
  hasPreferences: boolean;
  relatedPeriodStart: string;
  relatedPeriodEnd: string;
};

export function formatInsightDate(value: string | null) {
  if (!value) return "Date unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatConfidence(value: number | null) {
  if (value === null) return "Confidence not set";
  return `${Math.round(value * 100)}% confidence`;
}
