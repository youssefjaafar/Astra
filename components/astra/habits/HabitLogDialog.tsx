"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HabitWithProgress } from "@/components/astra/habits/habit-utils";
import { habitLogSchema, type HabitLogInput } from "@/lib/validations/habits";

type HabitLogDialogProps = {
  open: boolean;
  habit: HabitWithProgress | null;
  onClose: () => void;
  onSubmit: (habit: HabitWithProgress, values: HabitLogInput) => Promise<void>;
};

export function HabitLogDialog({ open, habit, onClose, onSubmit }: HabitLogDialogProps) {
  const form = useForm<HabitLogInput>({
    resolver: zodResolver(habitLogSchema),
    defaultValues: { value: 1, notes: "" },
  });

  useEffect(() => {
    if (open && habit) {
      const remaining = Math.max(Number(habit.target_value ?? 1) - habit.todayValue, 1);
      form.reset({ value: remaining, notes: "" });
    }
  }, [form, habit, open]);

  if (!open || !habit) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Log Signal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{habit.name}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(habit, values))}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Value</span>
            <Input min={0.1} step="any" type="number" {...form.register("value")} />
            {form.formState.errors.value ? <p className="text-sm text-amber-200">{form.formState.errors.value.message}</p> : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Notes</span>
            <Textarea className="min-h-24" {...form.register("notes")} />
          </label>
          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Signal
          </Button>
        </form>
      </div>
    </div>
  );
}
