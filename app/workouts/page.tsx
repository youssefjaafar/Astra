import { Activity, Dumbbell, TimerReset } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { workoutHistory } from "@/lib/mock-data";

export default function WorkoutsPage() {
  return (
    <>
      <PageHeader
        description="Track workout plans and history, then let the weekly review spot patterns without overcomplicating training."
        eyebrow="Training Log"
        signal="2 sessions queued"
        title="Workout Tracker"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard helper="Weekly target: 3" icon={Dumbbell} label="Training Sessions" progress={67} tone="violet" value="2/3" />
        <MetricCard helper="Last session complete" icon={TimerReset} label="Training Time" progress={70} tone="cyan" value="150m" />
        <MetricCard helper="Energy is stable" icon={Activity} label="Recovery Signal" progress={76} tone="emerald" value="Good" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionGrid description="Plans are clear, history stays easy to scan." title="Workout Plan">
          {workoutHistory.map((workout) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={workout.day}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{workout.day}: {workout.plan}</p>
                  <p className="mt-1 text-sm text-slate-400">{workout.duration}</p>
                </div>
                <Badge tone={workout.status === "Complete" ? "emerald" : "blue"}>{workout.status}</Badge>
              </div>
            </div>
          ))}
        </SectionGrid>

        <SectionGrid description="Use the smallest useful log after each session." title="Training Notes">
          {["Main lift moved well", "Chest volume felt high", "Schedule next session before noon"].map((note) => (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300" key={note}>
              {note}
            </p>
          ))}
        </SectionGrid>
      </div>
    </>
  );
}
