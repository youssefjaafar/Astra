import type { Database } from "@/lib/types/database";
import type { HabitCategory } from "@/lib/validations/habits";

export type AstraHabit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type PrayerLog = Database["public"]["Tables"]["prayer_logs"]["Row"];

export type HabitWithProgress = AstraHabit & {
  todayValue: number;
  progress: number;
  complete: boolean;
};

export function withHabitProgress(habits: AstraHabit[], logs: HabitLog[]) {
  return habits.map((habit) => {
    const todayValue = logs
      .filter((log) => log.habit_id === habit.id && isToday(log.logged_at))
      .reduce((sum, log) => sum + Number(log.value ?? 0), 0);
    const target = Number(habit.target_value ?? 1);
    const progress = target > 0 ? Math.min(100, Math.round((todayValue / target) * 100)) : todayValue > 0 ? 100 : 0;

    return {
      ...habit,
      todayValue,
      progress,
      complete: progress >= 100,
    };
  });
}

export function getHabitSummary(habits: HabitWithProgress[]) {
  const activeHabits = habits.filter((habit) => habit.is_active);
  const completed = activeHabits.filter((habit) => habit.complete).length;
  const completionRate = activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0;
  const missed = activeHabits.filter((habit) => !habit.complete).length;
  const streakHabit = activeHabits.find((habit) => habit.complete) ?? activeHabits[0] ?? null;

  return {
    completionRate,
    activeHabits: activeHabits.length,
    currentStreak: streakHabit ? `${streakHabit.name}: steady signal` : "No streak yet",
    missedSignals: missed,
  };
}

export function getSupportiveMessage(category: HabitCategory, complete: boolean) {
  if (complete) return "Signal complete. Keep the orbit calm.";

  const messages: Record<HabitCategory, string> = {
    hydration: "Steady. Continue the flow.",
    nutrition: "Keep the next meal simple and useful.",
    training: "A small session still counts.",
    reading: "Protect one quiet block.",
    prayer: "Return to the anchor gently.",
    meditation: "A few calm minutes can reset the system.",
    sleep: "Recovery is a mission system too.",
    focus: "Guard the next clean interval.",
    custom: "One small signal is enough.",
  };

  return messages[category];
}

export function getSevenDayHistory(habits: AstraHabit[], logs: HabitLog[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return days.map((date) => {
    const dayLogs = logs.filter((log) => sameDay(log.logged_at, date));
    const loggedHabitIds = new Set(dayLogs.map((log) => log.habit_id).filter(Boolean));
    const completion = habits.length > 0 ? Math.round((loggedHabitIds.size / habits.length) * 100) : 0;

    return {
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      date,
      completion,
      active: loggedHabitIds.size > 0,
    };
  });
}

export function isToday(value: string | null) {
  if (!value) return false;
  return sameDay(value, new Date());
}

export function sameDay(value: string | null, date: Date) {
  if (!value) return false;
  const source = new Date(value);
  return source.getFullYear() === date.getFullYear() && source.getMonth() === date.getMonth() && source.getDate() === date.getDate();
}

export function formatHabitProgress(habit: HabitWithProgress) {
  const target = Number(habit.target_value ?? 1);
  const unit = habit.unit ? ` ${habit.unit}` : "";
  return `${formatNumber(habit.todayValue)} / ${formatNumber(target)}${unit}`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
