import { BookOpen, Dumbbell, Moon, Radar, ShieldCheck, TimerOff } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import type { WeeklyMissionSnapshot as WeeklyMissionSnapshotType } from "@/lib/types";

const snapshotItems = [
  { key: "habitConsistency", label: "Habit consistency", icon: ShieldCheck },
  { key: "trainingSessions", label: "Training sessions", icon: Dumbbell },
  { key: "readingTime", label: "Reading time", icon: BookOpen },
  { key: "averageSleep", label: "Average sleep", icon: Moon },
  { key: "distractionTime", label: "Distraction time", icon: TimerOff },
  { key: "bestSignal", label: "Best signal of the week", icon: Radar },
] as const;

export function WeeklyMissionSnapshot({ snapshot }: { snapshot: WeeklyMissionSnapshotType }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader title="Weekly Mission Snapshot" subtitle="A compact preview of the pattern layer." />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {snapshotItems.map((item) => {
          const Icon = item.icon;
          return (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={item.key}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-200" />
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-white">{snapshot[item.key]}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
