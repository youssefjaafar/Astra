"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { intensityLabels, toDatetimeLocal, workoutTypeLabels, type AstraWorkout } from "@/components/astra/workouts/workout-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { workoutFormSchema, workoutIntensities, workoutTypes, type WorkoutFormInput } from "@/lib/validations/workouts";

type WorkoutFormDialogProps = {
  open: boolean;
  workout: AstraWorkout | null;
  onClose: () => void;
  onSubmit: (values: WorkoutFormInput, workout: AstraWorkout | null) => Promise<void>;
};

export function WorkoutFormDialog({ open, workout, onClose, onSubmit }: WorkoutFormDialogProps) {
  const defaultValues = useMemo(() => getDefaultValues(workout), [workout]);
  const form = useForm<WorkoutFormInput>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(getDefaultValues(workout));
  }, [form, open, workout]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Training Signal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{workout ? "Edit Workout" : "Log Workout"}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values, workout))}>
          <Field label="Workout title" error={form.formState.errors.title?.message}>
            <Input placeholder="Morning strength session" {...form.register("title")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Workout type" error={form.formState.errors.workoutType?.message}>
              <Select {...form.register("workoutType")}>
                {workoutTypes.map((type) => (
                  <option key={type} value={type}>
                    {workoutTypeLabels[type]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Intensity" error={form.formState.errors.intensity?.message}>
              <Select {...form.register("intensity")}>
                {workoutIntensities.map((intensity) => (
                  <option key={intensity} value={intensity}>
                    {intensityLabels[intensity]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration minutes" error={form.formState.errors.durationMinutes?.message}>
              <Input min={1} type="number" {...form.register("durationMinutes")} />
            </Field>
            <Field label="Logged at" error={form.formState.errors.loggedAt?.message}>
              <Input type="datetime-local" {...form.register("loggedAt")} />
            </Field>
          </div>

          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea placeholder="Energy, movement quality, recovery signal, or anything useful." {...form.register("notes")} />
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {workout ? "Save Changes" : "Save Workout"}
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
      className={cn(
        "h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20",
      )}
      {...props}
    />
  );
}

function getDefaultValues(workout: AstraWorkout | null): WorkoutFormInput {
  return {
    title: workout?.title ?? "",
    workoutType: workout?.workout_type ?? "strength",
    durationMinutes: workout?.duration_minutes ?? 45,
    intensity: workout?.intensity ?? "medium",
    loggedAt: toDatetimeLocal(workout?.logged_at ?? null),
    notes: workout?.notes ?? "",
  };
}
