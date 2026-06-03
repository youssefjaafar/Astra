"use client";

import { BookOpen, Clock3, Droplets, Dumbbell, Focus, Moon, Timer, type LucideIcon } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import type { AstraHabit, UserPreferences } from "@/components/astra/settings/settings-utils";

type TrackingDefaultsSettingsProps = {
  preferences: UserPreferences | null;
  habits: AstraHabit[];
};

export function TrackingDefaultsSettings({ preferences, habits }: TrackingDefaultsSettingsProps) {
  const focusHabit = habits.find((habit) => habit.category === "focus");
  const sleepHabit = habits.find((habit) => habit.category === "sleep");

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Tracking Defaults" subtitle="Common system targets Astra uses when reading your daily signal." />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DefaultCard icon={Droplets} label="Hydration" value={`${preferences?.water_target_ml ?? 2500} ml`} />
        <DefaultCard icon={BookOpen} label="Reading" value={`${preferences?.reading_target_minutes ?? 20} min/day`} />
        <DefaultCard icon={Moon} label="Meditation" value={`${preferences?.meditation_target_minutes ?? 10} min/day`} />
        <DefaultCard icon={Dumbbell} label="Training" value={`${preferences?.workout_target_weekly ?? 3} sessions/week`} />
        <DefaultCard icon={Focus} label="Focus" value={formatHabitTarget(focusHabit)} />
        <DefaultCard icon={Clock3} label="Sleep" value={formatHabitTarget(sleepHabit)} />
        <DefaultCard icon={Timer} label="Screen time" value={`${preferences?.screen_time_limit_minutes ?? 240} min/day`} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">
        Edit the Supabase-backed targets above in the Targets tab. Habit-specific focus and sleep targets come from active habit records.
      </p>
    </GlassCard>
  );
}

function DefaultCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-slate-950/60">
          <Icon className="h-4 w-4 text-cyan-200" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{label}</span>
          <span className="block truncate text-xs text-slate-500">{value}</span>
        </span>
      </span>
    </div>
  );
}

function formatHabitTarget(habit: AstraHabit | undefined) {
  if (!habit) return "No active target";
  if (habit.target_value === null) return habit.target_frequency ?? "Active";
  return `${habit.target_value} ${habit.unit ?? "units"} ${habit.target_frequency ?? ""}`.trim();
}
