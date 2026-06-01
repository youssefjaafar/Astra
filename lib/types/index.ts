import { z } from "zod";

export type SignalTone = "cyan" | "blue" | "violet" | "indigo" | "emerald" | "amber";

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export type Task = {
  id: string;
  title: string;
  area: "Work" | "Personal" | "Reminder";
  priority: "High" | "Medium" | "Low";
  due: string;
  complete: boolean;
};

export type HabitSignal = {
  id: string;
  label: string;
  value: string;
  target: string;
  progress: number;
  tone: SignalTone;
};

export type TimeBlock = {
  label: string;
  hours: number;
  fill: string;
};

export type MealEntry = {
  meal: string;
  entry: string;
  protein: string;
  status: "Logged" | "Planned";
};

export type WorkoutEntry = {
  day: string;
  plan: string;
  duration: string;
  status: "Complete" | "Queued";
};

export type WaterLog = {
  id: string;
  amountMl: number;
  loggedAt: string;
};

export type ReviewPrompt = {
  title: string;
  prompt: string;
};

export type AiInsight = {
  title: string;
  summary: string;
  tone: SignalTone;
};

export const quickCaptureSchema = z.object({
  entry: z.string().min(3, "Capture at least a few words."),
});

export type QuickCaptureInput = z.infer<typeof quickCaptureSchema>;
