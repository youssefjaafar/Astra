import type { Database } from "@/lib/types/database";
import type { WorkoutIntensity, WorkoutType } from "@/lib/validations/workouts";

export type AstraWorkout = Database["public"]["Tables"]["workouts"]["Row"];

export const workoutTypeLabels: Record<WorkoutType, string> = {
  strength: "Strength",
  cardio: "Cardio",
  judo: "Judo",
  mobility: "Mobility",
  walking: "Walking",
  custom: "Custom",
};

export const intensityLabels: Record<WorkoutIntensity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const intensityScores: Record<WorkoutIntensity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function getWeekStart(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function isThisWeek(value: string | null) {
  if (!value) return false;
  return new Date(value).getTime() >= getWeekStart().getTime();
}

export function getThisWeekWorkouts(workouts: AstraWorkout[]) {
  return workouts.filter((workout) => isThisWeek(workout.logged_at));
}

export function getTrainingSummary(workouts: AstraWorkout[], weeklyTarget: number) {
  const weekWorkouts = getThisWeekWorkouts(workouts);
  const totalMinutes = weekWorkouts.reduce((sum, workout) => sum + Number(workout.duration_minutes ?? 0), 0);
  const sorted = sortWorkoutsByTime(workouts);
  const lastWorkout = sorted[0] ?? null;
  const mostCommonType = getMostCommonType(weekWorkouts);
  const averageIntensity = getAverageIntensity(weekWorkouts);
  const targetProgress = weeklyTarget > 0 ? Math.min(100, Math.round((weekWorkouts.length / weeklyTarget) * 100)) : 0;

  return {
    workoutsThisWeek: weekWorkouts.length,
    weeklyTarget,
    totalMinutes,
    lastWorkout,
    mostCommonType,
    averageIntensity,
    targetProgress,
  };
}

export function getWorkoutGroups(workouts: AstraWorkout[]) {
  const sorted = sortWorkoutsByTime(workouts);

  return [
    { title: "Today", workouts: sorted.filter((workout) => isToday(workout.logged_at)) },
    { title: "This Week", workouts: sorted.filter((workout) => !isToday(workout.logged_at) && isThisWeek(workout.logged_at)) },
    { title: "Older", workouts: sorted.filter((workout) => !isThisWeek(workout.logged_at)) },
  ];
}

export function getWeeklyTrainingChartData(workouts: AstraWorkout[]) {
  const start = getWeekStart();

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const minutes = workouts
      .filter((workout) => {
        if (!workout.logged_at) return false;
        const time = new Date(workout.logged_at).getTime();
        return time >= dayStart.getTime() && time < dayEnd.getTime();
      })
      .reduce((sum, workout) => sum + Number(workout.duration_minutes ?? 0), 0);

    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day),
      minutes,
    };
  });
}

export function getConsistencyMessage(workoutsThisWeek: number, target: number) {
  if (target > 0 && workoutsThisWeek >= target) return "Training signal active.";
  if (target > 0 && workoutsThisWeek === target - 1) return "One more session completes this week's target.";
  if (workoutsThisWeek > 0) return "You are building consistency.";
  return "Start with one movement session and keep the system calm.";
}

export function sortWorkoutsByTime(workouts: AstraWorkout[]) {
  return [...workouts].sort((a, b) => new Date(b.logged_at ?? 0).getTime() - new Date(a.logged_at ?? 0).getTime());
}

export function formatMinutes(minutes: number | null) {
  const value = Number(minutes ?? 0);
  if (value <= 0) return "0m";
  const hours = Math.floor(value / 60);
  const remaining = value % 60;
  if (!hours) return `${remaining}m`;
  if (!remaining) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function formatWorkoutDate(value: string | null) {
  if (!value) return "Time not logged";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toDatetimeLocal(value: string | null) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getMostCommonType(workouts: AstraWorkout[]) {
  const counts = workouts.reduce<Record<string, number>>((acc, workout) => {
    const type = workout.workout_type ?? "custom";
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});
  const [type] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];
  return type ? workoutTypeLabels[type as WorkoutType] : "No signal yet";
}

function getAverageIntensity(workouts: AstraWorkout[]) {
  const scored = workouts
    .map((workout) => (workout.intensity ? intensityScores[workout.intensity] : null))
    .filter((score): score is number => score !== null);

  if (scored.length === 0) return "Not logged";

  const average = scored.reduce((sum, score) => sum + score, 0) / scored.length;
  if (average >= 2.5) return "High";
  if (average >= 1.5) return "Medium";
  return "Low";
}
