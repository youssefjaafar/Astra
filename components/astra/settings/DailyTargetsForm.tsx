"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserPreferences } from "@/components/astra/settings/settings-utils";
import { dailyTargetsSchema, type DailyTargetsInput } from "@/lib/validations/settings";

type DailyTargetsFormProps = {
  preferences: UserPreferences | null;
  onSubmit: (values: DailyTargetsInput) => Promise<void>;
};

export function DailyTargetsForm({ preferences, onSubmit }: DailyTargetsFormProps) {
  const form = useForm<DailyTargetsInput>({
    resolver: zodResolver(dailyTargetsSchema),
    defaultValues: getDefaultValues(preferences),
  });

  useEffect(() => {
    form.reset(getDefaultValues(preferences));
  }, [form, preferences]);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Daily Targets" subtitle="Tune the defaults that guide Astra's daily signal checks." />
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Wake-up target time" error={form.formState.errors.wakeTime?.message}>
            <Input type="time" {...form.register("wakeTime")} />
          </Field>
          <Field label="Sleep target time" error={form.formState.errors.sleepTime?.message}>
            <Input type="time" {...form.register("sleepTime")} />
          </Field>
          <Field label="Water target in ml" error={form.formState.errors.waterTargetMl?.message}>
            <Input min={50} step={50} type="number" {...form.register("waterTargetMl")} />
          </Field>
          <Field label="Reading minutes per day" error={form.formState.errors.readingTargetMinutes?.message}>
            <Input min={0} type="number" {...form.register("readingTargetMinutes")} />
          </Field>
          <Field label="Workout target per week" error={form.formState.errors.workoutTargetWeekly?.message}>
            <Input min={0} type="number" {...form.register("workoutTargetWeekly")} />
          </Field>
          <Field label="Meditation minutes per day" error={form.formState.errors.meditationTargetMinutes?.message}>
            <Input min={0} type="number" {...form.register("meditationTargetMinutes")} />
          </Field>
          <Field label="Screen time daily limit" error={form.formState.errors.screenTimeLimitMinutes?.message}>
            <Input min={0} type="number" {...form.register("screenTimeLimitMinutes")} />
          </Field>
          <label className="flex min-h-20 items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <span>
              <span className="block text-sm font-medium text-slate-200">Prayer tracking enabled</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">Show prayer anchors in habit and review systems.</span>
            </span>
            <input className="h-5 w-5 rounded border-white/20 bg-slate-950 accent-cyan-300" type="checkbox" {...form.register("prayerTrackingEnabled")} />
          </label>
        </div>
        <div className="flex justify-end pt-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Targets
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {error ? <p className="text-sm text-amber-200">{error}</p> : null}
    </label>
  );
}

function getDefaultValues(preferences: UserPreferences | null): DailyTargetsInput {
  return {
    wakeTime: preferences?.wake_time ?? "06:30",
    sleepTime: preferences?.sleep_time ?? "22:30",
    waterTargetMl: preferences?.water_target_ml ?? 2500,
    readingTargetMinutes: preferences?.reading_target_minutes ?? 20,
    workoutTargetWeekly: preferences?.workout_target_weekly ?? 3,
    meditationTargetMinutes: preferences?.meditation_target_minutes ?? 10,
    screenTimeLimitMinutes: preferences?.screen_time_limit_minutes ?? 240,
    prayerTrackingEnabled: preferences?.prayer_tracking_enabled ?? true,
  };
}
