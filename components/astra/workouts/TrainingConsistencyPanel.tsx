import { Orbit } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Progress } from "@/components/ui/progress";
import { getConsistencyMessage, getTrainingSummary, type AstraWorkout } from "@/components/astra/workouts/workout-utils";

type TrainingConsistencyPanelProps = {
  workouts: AstraWorkout[];
  weeklyTarget: number;
};

export function TrainingConsistencyPanel({ workouts, weeklyTarget }: TrainingConsistencyPanelProps) {
  const summary = getTrainingSummary(workouts, weeklyTarget);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Training Consistency" subtitle="Weekly movement target, kept calm and practical." />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-white">
            {summary.workoutsThisWeek}/{summary.weeklyTarget}
          </p>
          <p className="mt-2 text-sm text-slate-500">Streak: calibration pending</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-cyan-300/10">
          <Orbit className="h-5 w-5 text-cyan-200" />
        </div>
      </div>
      <Progress className="mt-5" tone="cyan" value={summary.targetProgress} />
      <p className="mt-4 text-sm leading-6 text-slate-400">
        {getConsistencyMessage(summary.workoutsThisWeek, summary.weeklyTarget)}
      </p>
    </GlassCard>
  );
}
