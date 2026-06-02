import { Activity, AlertCircle, Flame, Gauge } from "lucide-react";

import { StatCard } from "@/components/astra";
import { getHabitSummary, type HabitWithProgress } from "@/components/astra/habits/habit-utils";

export function HabitSummaryCards({ habits }: { habits: HabitWithProgress[] }) {
  const summary = getHabitSummary(habits);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Gauge} subtitle="Completed life systems today" title="Today's completion" value={`${summary.completionRate}%`} />
      <StatCard icon={Activity} subtitle="Currently enabled" title="Active habits" value={String(summary.activeHabits)} />
      <StatCard icon={Flame} subtitle="Placeholder until streak engine lands" title="Streak highlight" value={summary.currentStreak} />
      <StatCard icon={AlertCircle} subtitle="Signals still available today" title="Missed signals" value={String(summary.missedSignals)} />
    </div>
  );
}
