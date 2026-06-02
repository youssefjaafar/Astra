"use client";

import { GlassCard, SectionHeader } from "@/components/astra";
import { getSevenDayHistory, type AstraHabit, type HabitLog } from "@/components/astra/habits/habit-utils";
import { cn } from "@/lib/utils";

type HabitHistoryProps = {
  habits: AstraHabit[];
  logs: HabitLog[];
};

export function HabitHistory({ habits, logs }: HabitHistoryProps) {
  const history = getSevenDayHistory(habits.filter((habit) => habit.is_active), logs);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="7-Day Signal History" subtitle="A light scan of consistency, without noise." />
      <div className="mt-5 grid grid-cols-7 gap-2">
        {history.map((day) => (
          <div className="space-y-2 text-center" key={day.label}>
            <div
              className={cn(
                "mx-auto flex h-14 w-full items-end overflow-hidden rounded-md border border-white/10 bg-white/[0.04] transition",
                day.active && "border-cyan-300/35 bg-cyan-300/10",
              )}
            >
              <div
                className="w-full rounded-b-md bg-cyan-300/70"
                style={{ height: `${Math.max(day.completion, day.active ? 16 : 0)}%` }}
              />
            </div>
            <p className="text-xs font-medium text-slate-300">{day.label}</p>
            <p className="text-[11px] text-slate-500">{day.completion}%</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
