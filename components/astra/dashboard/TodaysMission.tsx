import { CalendarClock, Compass, UserRound, Workflow } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { DashboardMission } from "@/lib/types";

export function TodaysMission({ mission }: { mission: DashboardMission }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader title="Today's Mission" subtitle="The useful shape of the day, reduced to signal." />
      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-3">
          {mission.topPriorities.map((priority, index) => (
            <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4" key={priority}>
              <Badge tone={index === 0 ? "cyan" : "neutral"}>{index + 1}</Badge>
              <p className="text-sm leading-6 text-slate-200">{priority}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <MissionSignal
            icon={CalendarClock}
            label="Next Scheduled Event"
            title={`${mission.nextEvent.time} / ${mission.nextEvent.title}`}
            body={mission.nextEvent.context}
          />
          <MissionSignal icon={Workflow} label="Main Work Task" title={mission.mainWorkTask} />
          <MissionSignal icon={UserRound} label="Main Personal Task" title={mission.mainPersonalTask} />
          <MissionSignal icon={Compass} label="Course Correction" title={mission.courseCorrection} tone="violet" />
        </div>
      </div>
    </GlassCard>
  );
}

type MissionSignalProps = {
  icon: React.ElementType;
  label: string;
  title: string;
  body?: string;
  tone?: "cyan" | "violet";
};

function MissionSignal({ icon: Icon, label, title, body, tone = "cyan" }: MissionSignalProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
          <Icon className={tone === "cyan" ? "h-4 w-4 text-cyan-200" : "h-4 w-4 text-violet-200"} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-white">{title}</p>
          {body ? <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p> : null}
        </div>
      </div>
    </div>
  );
}
