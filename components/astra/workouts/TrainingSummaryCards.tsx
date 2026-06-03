import { Activity, CalendarCheck, Clock3, Dumbbell, Gauge, Target } from "lucide-react";

import { StatCard } from "@/components/astra";
import { formatMinutes, getTrainingSummary, type AstraWorkout } from "@/components/astra/workouts/workout-utils";

type TrainingSummaryCardsProps = {
  workouts: AstraWorkout[];
  weeklyTarget: number;
};

export function TrainingSummaryCards({ workouts, weeklyTarget }: TrainingSummaryCardsProps) {
  const summary = getTrainingSummary(workouts, weeklyTarget);
  const weeklyTargetValue = summary.weeklyTarget > 0 ? String(summary.weeklyTarget) : "Not set";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard icon={CalendarCheck} subtitle="Current weekly signal" title="This week" value={String(summary.workoutsThisWeek)} />
      <StatCard icon={Target} subtitle="Preference target" title="Weekly target" value={weeklyTargetValue} />
      <StatCard icon={Clock3} subtitle="Total training duration" title="Training minutes" value={formatMinutes(summary.totalMinutes)} />
      <StatCard icon={Dumbbell} subtitle="Latest completed session" title="Last workout" value={summary.lastWorkout?.title ?? "No signal yet"} />
      <StatCard icon={Activity} subtitle="Most common this week" title="Common type" value={summary.mostCommonType} />
      <StatCard icon={Gauge} subtitle="Based on logged intensity" title="Average intensity" value={summary.averageIntensity} />
    </div>
  );
}
