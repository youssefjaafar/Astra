import { Compass, Gauge, Orbit, TimerOff } from "lucide-react";

import { StatCard } from "@/components/astra";
import { formatMinutes, getTimeInsights, type AstraTimeBlock } from "@/components/astra/time/time-utils";

export function TimeInsightCards({ blocks }: { blocks: AstraTimeBlock[] }) {
  const insights = getTimeInsights(blocks);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Orbit} subtitle="Largest logged orbit today" title="Most used category" value={insights.mostUsed} />
      <StatCard icon={TimerOff} subtitle="Scrolling and social combined" title="Distraction time" value={formatMinutes(insights.distraction)} />
      <StatCard icon={Gauge} subtitle="Work/focus against distraction" title="Focus ratio" value={insights.ratio} />
      <StatCard icon={Compass} subtitle="Placeholder until full-day capture" title="Untracked time" value={formatMinutes(insights.untracked)} />
    </div>
  );
}
