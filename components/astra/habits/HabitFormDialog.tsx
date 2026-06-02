"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { habitCategories, habitFormSchema, habitFrequencies, type HabitFormInput } from "@/lib/validations/habits";
import type { AstraHabit } from "@/components/astra/habits/habit-utils";
import { cn } from "@/lib/utils";

type HabitFormDialogProps = {
  open: boolean;
  habit: AstraHabit | null;
  onClose: () => void;
  onSubmit: (values: HabitFormInput, habit: AstraHabit | null) => Promise<void>;
};

export function HabitFormDialog({ open, habit, onClose, onSubmit }: HabitFormDialogProps) {
  const form = useForm<HabitFormInput>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: getDefaultValues(habit),
  });

  useEffect(() => {
    if (open) form.reset(getDefaultValues(habit));
  }, [form, habit, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Life System</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{habit ? "Edit Habit" : "New Habit"}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values, habit))}>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={form.formState.errors.category?.message}>
              <Select {...form.register("category")}>
                {habitCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Target frequency" error={form.formState.errors.targetFrequency?.message}>
              <Select {...form.register("targetFrequency")}>
                {habitFrequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>{frequency}</option>
                ))}
              </Select>
            </Field>
            <Field label="Target value" error={form.formState.errors.targetValue?.message}>
              <Input min={0} step="any" type="number" {...form.register("targetValue")} />
            </Field>
            <Field label="Unit" error={form.formState.errors.unit?.message}>
              <Input placeholder="min, ml, pages, completed..." {...form.register("unit")} />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-slate-200">
            Active system
            <input className="h-5 w-5 rounded border-white/20 bg-slate-950 accent-cyan-300" type="checkbox" {...form.register("isActive")} />
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {habit ? "Save Changes" : "Create Habit"}
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
      className={cn("h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm capitalize text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20")}
      {...props}
    />
  );
}

function getDefaultValues(habit: AstraHabit | null): HabitFormInput {
  return {
    name: habit?.name ?? "",
    category: habit?.category ?? "custom",
    targetFrequency: (habit?.target_frequency as HabitFormInput["targetFrequency"]) ?? "daily",
    targetValue: Number(habit?.target_value ?? 1),
    unit: habit?.unit ?? "completed",
    isActive: habit?.is_active ?? true,
  };
}
