import type { HabitSignal } from "@/lib/types";

export const habits: HabitSignal[] = [
  { id: "water", label: "Hydration System", value: "1.8L", target: "3.0L", progress: 60, tone: "cyan" },
  { id: "reading", label: "Reading Signal", value: "12 pages", target: "20 pages", progress: 60, tone: "blue" },
  { id: "meditation", label: "Mindfulness", value: "8 min", target: "10 min", progress: 80, tone: "violet" },
  { id: "prayer", label: "Spiritual Anchor", value: "2/3", target: "3 anchors", progress: 67, tone: "indigo" },
  { id: "sleep", label: "Sleep", value: "7h 10m", target: "7h 30m", progress: 95, tone: "emerald" },
  { id: "energy", label: "Energy", value: "7/10", target: "steady", progress: 70, tone: "amber" },
];
