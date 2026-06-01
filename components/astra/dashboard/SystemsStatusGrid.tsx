import {
  BookOpen,
  Brain,
  Dumbbell,
  Droplets,
  Moon,
  Salad,
  ScrollText,
  TimerOff,
} from "lucide-react";

import { GlassCard, ProgressRing, SectionHeader } from "@/components/astra";
import { Progress } from "@/components/ui/progress";
import type { DashboardSystemStatus } from "@/lib/types";

const statusIcons = {
  hydration: Droplets,
  nutrition: Salad,
  training: Dumbbell,
  reading: BookOpen,
  prayer: ScrollText,
  meditation: Brain,
  sleep: Moon,
  "screen-time": TimerOff,
};

export function SystemsStatusGrid({ statuses }: { statuses: DashboardSystemStatus[] }) {
  return (
    <section>
      <SectionHeader
        title="Systems Status"
        subtitle="The core life systems for today. Supportive, visible, and intentionally calm."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => {
          const Icon = statusIcons[status.id];

          return (
            <GlassCard className="p-4" key={status.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-white">{status.name}</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {status.current} <span className="text-sm font-normal text-slate-500">/ {status.target}</span>
                  </p>
                </div>
                <ProgressRing label="sync" size={76} tone={status.tone} value={status.progress} />
              </div>
              <Progress className="mt-4" tone={status.tone} value={status.progress} />
              <p className="mt-3 text-sm leading-6 text-slate-400">{status.message}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
