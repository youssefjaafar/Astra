"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { mealTypeLabels, toDatetimeLocal, type AstraMeal } from "@/components/astra/meals/nutrition-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { mealFormSchema, mealTypes, type MealFormInput } from "@/lib/validations/nutrition";

type MealFormDialogProps = {
  open: boolean;
  meal: AstraMeal | null;
  onClose: () => void;
  onSubmit: (values: MealFormInput, meal: AstraMeal | null) => Promise<void>;
};

export function MealFormDialog({ open, meal, onClose, onSubmit }: MealFormDialogProps) {
  const defaultValues = useMemo(() => getDefaultValues(meal), [meal]);
  const form = useForm<MealFormInput>({
    resolver: zodResolver(mealFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(getDefaultValues(meal));
  }, [form, meal, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Fuel Signal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{meal ? "Edit Meal" : "Log Meal"}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values, meal))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meal type" error={form.formState.errors.mealType?.message}>
              <Select {...form.register("mealType")}>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {mealTypeLabels[type]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Logged at" error={form.formState.errors.loggedAt?.message}>
              <Input type="datetime-local" {...form.register("loggedAt")} />
            </Field>
          </div>

          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input placeholder="Chicken rice and yogurt" {...form.register("title")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Calories" error={form.formState.errors.calories?.message}>
              <Input min={0} type="number" {...form.register("calories")} />
            </Field>
            <Field label="Protein grams" error={form.formState.errors.proteinG?.message}>
              <Input min={0} step="any" type="number" {...form.register("proteinG")} />
            </Field>
            <Field label="Carbs grams" error={form.formState.errors.carbsG?.message}>
              <Input min={0} step="any" type="number" {...form.register("carbsG")} />
            </Field>
            <Field label="Fat grams" error={form.formState.errors.fatG?.message}>
              <Input min={0} step="any" type="number" {...form.register("fatG")} />
            </Field>
          </div>

          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea placeholder="Energy, hunger, prep notes, or anything useful." {...form.register("notes")} />
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {meal ? "Save Changes" : "Save Meal"}
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

function getDefaultValues(meal: AstraMeal | null): MealFormInput {
  return {
    mealType: meal?.meal_type ?? "lunch",
    title: meal?.title ?? "",
    calories: meal?.calories ?? undefined,
    proteinG: meal?.protein_g ?? undefined,
    carbsG: meal?.carbs_g ?? undefined,
    fatG: meal?.fat_g ?? undefined,
    loggedAt: toDatetimeLocal(meal?.logged_at ?? null),
    notes: meal?.notes ?? "",
  };
}
