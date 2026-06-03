"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import type { UserPreferences } from "@/components/astra/settings/settings-utils";
import { cn } from "@/lib/utils";
import { aiBehaviorSettingsSchema, type AIBehaviorSettingsInput } from "@/lib/validations/settings";

type AIBehaviorSettingsProps = {
  preferences: UserPreferences | null;
  onSubmit: (values: AIBehaviorSettingsInput) => Promise<void>;
};

export function AIBehaviorSettings({ preferences, onSubmit }: AIBehaviorSettingsProps) {
  const form = useForm<AIBehaviorSettingsInput>({
    resolver: zodResolver(aiBehaviorSettingsSchema),
    defaultValues: getDefaultValues(preferences),
  });

  useEffect(() => {
    form.reset(getDefaultValues(preferences));
  }, [form, preferences]);

  return (
    <GlassCard className="p-5">
      <SectionHeader
        action={
          <div className="grid h-10 w-10 place-items-center rounded-md border border-violet-200/20 bg-violet-200/10">
            <Bot className="h-5 w-5 text-violet-200" />
          </div>
        }
        title="AI Copilot Behavior"
        subtitle="Set the voice and depth of Astra's course corrections."
      />
      <form className="mt-5 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="AI tone" error={form.formState.errors.aiTone?.message}>
            <Select {...form.register("aiTone")}>
              <option value="calm">Calm</option>
              <option value="direct">Direct</option>
              <option value="strict">Strict</option>
              <option value="encouraging">Encouraging</option>
            </Select>
          </Field>
          <Field label="Recommendation style" error={form.formState.errors.aiRecommendationStyle?.message}>
            <Select {...form.register("aiRecommendationStyle")}>
              <option value="minimal">Minimal</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Toggle label="Daily planning" description="Let Astra suggest daily plans." register={form.register("dailyPlanningEnabled")} />
          <Toggle label="Weekly reports" description="Enable weekly mission reports." register={form.register("weeklyReportEnabled")} />
          <Toggle label="Course corrections" description="Enable reminder-style corrections." register={form.register("courseCorrectionEnabled")} />
        </div>

        <div className="flex justify-end pt-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save AI Settings
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

function Toggle({
  label,
  description,
  register,
}: {
  label: string;
  description: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <label className="flex min-h-28 items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <input className="mt-0.5 h-5 w-5 rounded border-white/20 bg-slate-950 accent-cyan-300" type="checkbox" {...register} />
    </label>
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20",
      )}
      {...props}
    />
  );
}

function getDefaultValues(preferences: UserPreferences | null): AIBehaviorSettingsInput {
  return {
    aiTone: preferences?.ai_tone ?? "calm",
    aiRecommendationStyle: preferences?.ai_recommendation_style ?? "balanced",
    dailyPlanningEnabled: preferences?.daily_planning_enabled ?? true,
    weeklyReportEnabled: preferences?.weekly_report_enabled ?? true,
    courseCorrectionEnabled: preferences?.course_correction_enabled ?? true,
  };
}
