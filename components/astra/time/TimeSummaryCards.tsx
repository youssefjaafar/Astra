import { Brain, Clock3, Dumbbell, Moon, ScrollText, TimerReset } from "lucide-react";

import { StatCard } from "@/components/astra";
import { formatMinutes, getTimeSummary, type AstraTimeBlock } from "@/components/astra/time/time-utils";

export function TimeSummaryCards({ blocks }: { blocks: AstraTimeBlock[] }) {
  const summary = getTimeSummary(blocks);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard icon={Clock3} subtitle="Logged into today's orbit" title="Tracked today" value={formatMinutes(summary.total)} />
      <StatCard icon={Brain} subtitle="Protected focus signal" title="Deep work" value={formatMinutes(summary.deepWork)} />
      <StatCard icon={TimerReset} subtitle="Scrolling and social drift" title="Distraction" value={formatMinutes(summary.scrolling)} />
      <StatCard icon={Dumbbell} subtitle="Training and recovery time" title="Training/health" value={formatMinutes(summary.training)} />
      <StatCard icon={ScrollText} subtitle="Reading and learning signal" title="Reading" value={formatMinutes(summary.reading)} />
      <StatCard icon={Moon} subtitle="Prayer and meditation anchor" title="Spiritual time" value={formatMinutes(summary.prayerMeditation)} />
    </div>
  );
}
