"use client";

import { Activity, Footprints, Loader2, Shield, StretchHorizontal, Waves, X } from "lucide-react";
import { useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { workoutTypeLabels } from "@/components/astra/workouts/workout-utils";
import type { WorkoutIntensity, WorkoutType } from "@/lib/validations/workouts";

export type QuickWorkoutOption = {
  title: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  intensity: WorkoutIntensity;
};

const quickOptions: QuickWorkoutOption[] = [
  { title: "Strength", workoutType: "strength", durationMinutes: 45, intensity: "medium" },
  { title: "Cardio", workoutType: "cardio", durationMinutes: 30, intensity: "medium" },
  { title: "Judo", workoutType: "judo", durationMinutes: 90, intensity: "high" },
  { title: "Walking", workoutType: "walking", durationMinutes: 30, intensity: "low" },
  { title: "Mobility", workoutType: "mobility", durationMinutes: 15, intensity: "low" },
];

const icons: Record<WorkoutType, typeof Activity> = {
  strength: Shield,
  cardio: Activity,
  judo: Waves,
  mobility: StretchHorizontal,
  walking: Footprints,
  custom: Activity,
};

type QuickWorkoutButtonsProps = {
  onQuickLog: (option: QuickWorkoutOption) => Promise<void>;
};

export function QuickWorkoutButtons({ onQuickLog }: QuickWorkoutButtonsProps) {
  const [selected, setSelected] = useState<QuickWorkoutOption | null>(null);
  const [saving, setSaving] = useState(false);

  async function confirmQuickLog() {
    if (!selected) return;

    setSaving(true);
    await onQuickLog(selected);
    setSaving(false);
    setSelected(null);
  }

  return (
    <>
      <GlassCard className="p-5">
        <SectionHeader title="Quick Workout" subtitle="Log common movement sessions with one confirmation." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickOptions.map((option) => {
            const Icon = icons[option.workoutType];

            return (
              <button
                className="group flex min-h-24 flex-col items-start justify-between rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                key={option.workoutType}
                onClick={() => setSelected(option)}
                type="button"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-slate-950/60">
                    <Icon className="h-4 w-4 text-cyan-200" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {option.durationMinutes} min
                  </span>
                </span>
                <span className="mt-4 text-sm font-semibold text-white">{option.title}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {selected ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Confirm Signal</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Log {selected.title}?</h2>
              </div>
              <Button aria-label="Close confirmation" onClick={() => setSelected(null)} size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              This will save a {workoutTypeLabels[selected.workoutType]} session for {selected.durationMinutes} minutes with{" "}
              {selected.intensity} intensity.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={saving} onClick={() => setSelected(null)} type="button" variant="secondary">
                Cancel
              </Button>
              <Button disabled={saving} onClick={confirmQuickLog} type="button">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Workout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
