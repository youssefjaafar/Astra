"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Rocket } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth";

const fallbackTimezone = "America/Detroit";

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      timezone: getLocalTimezone(),
      mainGoal: "",
      wakeTime: "06:30",
      sleepTime: "22:30",
      waterTargetMl: 2500,
      readingTargetMinutes: 20,
      workoutTargetWeekly: 3,
      meditationTargetMinutes: 10,
      prayerTrackingEnabled: true,
      screenTimeLimitMinutes: 240,
    },
  });

  async function onSubmit(values: OnboardingInput) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message ?? "You need to sign in before onboarding.");
      router.push("/login");
      return;
    }

    const { error: preferencesError } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        main_goal: values.mainGoal?.trim() || null,
        wake_time: values.wakeTime,
        sleep_time: values.sleepTime,
        water_target_ml: values.waterTargetMl,
        reading_target_minutes: values.readingTargetMinutes,
        workout_target_weekly: values.workoutTargetWeekly,
        meditation_target_minutes: values.meditationTargetMinutes,
        prayer_tracking_enabled: values.prayerTrackingEnabled,
        screen_time_limit_minutes: values.screenTimeLimitMinutes,
      },
      {
        onConflict: "user_id",
      },
    );

    if (preferencesError) {
      setError(
        isMissingTableError(preferencesError)
          ? getDatabaseSetupMessage("public.user_preferences")
          : preferencesError.message,
      );
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: values.displayName,
        timezone: values.timezone,
      },
      {
        onConflict: "user_id",
      },
    );

    if (profileError && !isMissingTableError(profileError)) {
      setError(profileError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="onboarding-display-name" label="Display name" error={form.formState.errors.displayName?.message}>
          <Input autoComplete="name" id="onboarding-display-name" {...form.register("displayName")} />
        </Field>
        <Field id="onboarding-timezone" label="Timezone" error={form.formState.errors.timezone?.message}>
          <Input id="onboarding-timezone" {...form.register("timezone")} />
        </Field>
      </div>

      <Field id="onboarding-main-goal" label="Main goal" error={form.formState.errors.mainGoal?.message}>
        <Textarea
          className="min-h-24"
          id="onboarding-main-goal"
          placeholder="Read more, train consistently, reduce scrolling, and protect spiritual anchors."
          {...form.register("mainGoal")}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="onboarding-wake-time" label="Wake-up target" error={form.formState.errors.wakeTime?.message}>
          <Input id="onboarding-wake-time" type="time" {...form.register("wakeTime")} />
        </Field>
        <Field id="onboarding-sleep-time" label="Sleep target" error={form.formState.errors.sleepTime?.message}>
          <Input id="onboarding-sleep-time" type="time" {...form.register("sleepTime")} />
        </Field>
        <Field id="onboarding-water-target" label="Water target in ml" error={form.formState.errors.waterTargetMl?.message}>
          <Input id="onboarding-water-target" type="number" min={50} step={50} {...form.register("waterTargetMl")} />
        </Field>
        <Field id="onboarding-reading-target" label="Reading minutes per day" error={form.formState.errors.readingTargetMinutes?.message}>
          <Input id="onboarding-reading-target" type="number" min={0} {...form.register("readingTargetMinutes")} />
        </Field>
        <Field id="onboarding-workout-target" label="Workouts per week" error={form.formState.errors.workoutTargetWeekly?.message}>
          <Input id="onboarding-workout-target" type="number" min={0} {...form.register("workoutTargetWeekly")} />
        </Field>
        <Field id="onboarding-meditation-target" label="Meditation minutes per day" error={form.formState.errors.meditationTargetMinutes?.message}>
          <Input id="onboarding-meditation-target" type="number" min={0} {...form.register("meditationTargetMinutes")} />
        </Field>
        <Field id="onboarding-screen-time-limit" label="Screen time daily limit" error={form.formState.errors.screenTimeLimitMinutes?.message}>
          <Input id="onboarding-screen-time-limit" type="number" min={0} {...form.register("screenTimeLimitMinutes")} />
        </Field>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-200">
            Prayer tracking
            <input
              className="h-5 w-5 rounded border-white/20 bg-slate-950 accent-cyan-300"
              type="checkbox"
              {...form.register("prayerTrackingEnabled")}
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-500">Enable prayer anchors in your daily systems status.</p>
        </div>
      </div>

      {error ? <p className="rounded-md border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">{error}</p> : null}

      <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
        Launch Command Center
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="text-sm text-amber-200">{error}</p> : null}
    </div>
  );
}

function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTimezone;
  } catch {
    return fallbackTimezone;
  }
}
