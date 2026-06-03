"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type DailyReview } from "@/components/astra/reviews/review-utils";
import { dailyReviewFormSchema, type DailyReviewFormInput } from "@/lib/validations/reviews";

type DailyDebriefFormProps = {
  review: DailyReview | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSubmit: (values: DailyReviewFormInput) => Promise<void>;
};

export function DailyDebriefForm({ review, selectedDate, onDateChange, onSubmit }: DailyDebriefFormProps) {
  const defaultValues = useMemo(() => getDefaultValues(review, selectedDate), [review, selectedDate]);
  const form = useForm<DailyReviewFormInput>({
    resolver: zodResolver(dailyReviewFormSchema),
    defaultValues,
  });
  const reviewDate = form.watch("reviewDate");

  useEffect(() => {
    form.reset(getDefaultValues(review, selectedDate));
  }, [form, review, selectedDate]);

  useEffect(() => {
    if (reviewDate && reviewDate !== selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) {
      onDateChange(reviewDate);
    }
  }, [onDateChange, reviewDate, selectedDate]);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Daily Debrief" subtitle="Capture the human notes behind the life signals." />
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Review date" error={form.formState.errors.reviewDate?.message}>
          <Input type="date" {...form.register("reviewDate")} />
        </Field>

        <Field label="What went well?" error={form.formState.errors.whatWentWell?.message}>
          <Textarea placeholder="Signals, decisions, people, focus blocks, or quiet wins." {...form.register("whatWentWell")} />
        </Field>

        <Field label="What drained your energy?" error={form.formState.errors.whatDrainedEnergy?.message}>
          <Textarea placeholder="Friction, overload, distractions, poor timing, or anything that cost energy." {...form.register("whatDrainedEnergy")} />
        </Field>

        <Field label="What should improve tomorrow?" error={form.formState.errors.whatToImprove?.message}>
          <Textarea placeholder="One realistic course correction for the next mission window." {...form.register("whatToImprove")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Mood score" error={form.formState.errors.moodScore?.message}>
            <Input max={10} min={1} type="number" {...form.register("moodScore")} />
          </Field>
          <Field label="Energy score" error={form.formState.errors.energyScore?.message}>
            <Input max={10} min={1} type="number" {...form.register("energyScore")} />
          </Field>
          <Field label="Focus score" error={form.formState.errors.focusScore?.message}>
            <Input max={10} min={1} type="number" {...form.register("focusScore")} />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Debrief
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

function getDefaultValues(review: DailyReview | null, selectedDate: string): DailyReviewFormInput {
  return {
    reviewDate: review?.review_date ?? selectedDate,
    whatWentWell: review?.what_went_well ?? "",
    whatDrainedEnergy: review?.what_drained_energy ?? "",
    whatToImprove: review?.what_to_improve ?? "",
    moodScore: review?.mood_score ?? 5,
    energyScore: review?.energy_score ?? 5,
    focusScore: review?.focus_score ?? 5,
  };
}
