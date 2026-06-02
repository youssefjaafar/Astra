"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { categoryLabels, toDatetimeLocal, type AstraTimeBlock } from "@/components/astra/time/time-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { timeBlockFormSchema, timeCategories, type TimeBlockFormInput } from "@/lib/validations/time";

type TimeBlockFormDialogProps = {
  open: boolean;
  block: AstraTimeBlock | null;
  onClose: () => void;
  onSubmit: (values: TimeBlockFormInput, block: AstraTimeBlock | null) => Promise<void>;
};

export function TimeBlockFormDialog({ open, block, onClose, onSubmit }: TimeBlockFormDialogProps) {
  const defaultValues = useMemo(() => getDefaultValues(block), [block]);
  const form = useForm<TimeBlockFormInput>({
    resolver: zodResolver(timeBlockFormSchema),
    defaultValues,
  });

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (open) form.reset(getDefaultValues(block));
  }, [block, form, open]);

  useEffect(() => {
    if (!startTime || !endTime) return;
    const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
    if (duration > 0) form.setValue("durationMinutes", duration, { shouldValidate: true });
  }, [endTime, form, startTime]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Time Signal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{block ? "Edit Time Block" : "Log Time Block"}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values, block))}>
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>

          <Field label="Category" error={form.formState.errors.category?.message}>
            <Select {...form.register("category")}>
              {timeCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time" error={form.formState.errors.startTime?.message}>
              <Input type="datetime-local" {...form.register("startTime")} />
            </Field>
            <Field label="End time" error={form.formState.errors.endTime?.message}>
              <Input type="datetime-local" {...form.register("endTime")} />
            </Field>
            <Field label="Duration minutes" error={form.formState.errors.durationMinutes?.message}>
              <Input min={1} type="number" {...form.register("durationMinutes")} />
            </Field>
            <Field label="Quality score" error={form.formState.errors.qualityScore?.message}>
              <Input max={10} min={1} placeholder="1-10" type="number" {...form.register("qualityScore")} />
            </Field>
          </div>

          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea {...form.register("notes")} />
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {block ? "Save Changes" : "Save Block"}
            </Button>
          </div>
        </form>
      </div>
    </div>
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
      className={cn("h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20")}
      {...props}
    />
  );
}

function getDefaultValues(block: AstraTimeBlock | null): TimeBlockFormInput {
  return {
    title: block?.title ?? "",
    category: block?.category ?? "deep_work",
    startTime: toDatetimeLocal(block?.start_time ?? null),
    endTime: toDatetimeLocal(block?.end_time ?? null),
    durationMinutes: block?.duration_minutes ?? undefined,
    qualityScore: block?.quality_score ?? undefined,
    notes: block?.notes ?? "",
  };
}
