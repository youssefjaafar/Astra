"use client";

import { AlertCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { HydrationSystem } from "@/components/astra/meals/HydrationSystem";
import { MacroDistributionChart } from "@/components/astra/meals/MacroDistributionChart";
import { MealFormDialog } from "@/components/astra/meals/MealFormDialog";
import { MealHistory } from "@/components/astra/meals/MealHistory";
import { MealQualityReflection } from "@/components/astra/meals/MealQualityReflection";
import { NutritionSummaryCards } from "@/components/astra/meals/NutritionSummaryCards";
import { ProteinSignal } from "@/components/astra/meals/ProteinSignal";
import { type AstraMeal, type WaterLog } from "@/components/astra/meals/nutrition-utils";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MealFormInput } from "@/lib/validations/nutrition";

type MealsModuleProps = {
  initialMeals: AstraMeal[];
  initialWaterLogs: WaterLog[];
  initialWaterTargetMl: number;
  initialError: string | null;
  userId: string;
};

export function MealsModule({ initialMeals, initialWaterLogs, initialWaterTargetMl, initialError, userId }: MealsModuleProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [meals, setMeals] = useState(initialMeals);
  const [waterLogs, setWaterLogs] = useState(initialWaterLogs);
  const [waterTargetMl] = useState(initialWaterTargetMl);
  const [error, setError] = useState<string | null>(initialError);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<AstraMeal | null>(null);

  function openNewMeal() {
    setEditingMeal(null);
    setDialogOpen(true);
  }

  function openEditMeal(meal: AstraMeal) {
    setEditingMeal(meal);
    setDialogOpen(true);
  }

  async function saveMeal(values: MealFormInput, meal: AstraMeal | null) {
    setError(null);
    setLoadingMessage(meal ? "Saving fuel signal..." : "Logging fuel signal...");

    const payload = normalizeMeal(values);

    if (meal) {
      const { data, error: updateError } = await supabase.from("meals").update(payload).eq("id", meal.id).select("*").single();
      setLoadingMessage(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMeals((current) => current.map((item) => (item.id === data.id ? data : item)));
      setDialogOpen(false);
      setEditingMeal(null);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("meals")
      .insert({
        ...payload,
        user_id: userId,
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMeals((current) => [data, ...current]);
    setDialogOpen(false);
  }

  async function deleteMeal(meal: AstraMeal) {
    setError(null);
    const previousMeals = meals;
    setMeals((current) => current.filter((item) => item.id !== meal.id));

    const { error: deleteError } = await supabase.from("meals").delete().eq("id", meal.id);

    if (deleteError) {
      setMeals(previousMeals);
      setError(deleteError.message);
    }
  }

  async function addWater(amountMl: number) {
    setError(null);
    const { data, error: insertError } = await supabase
      .from("water_logs")
      .insert({
        user_id: userId,
        amount_ml: amountMl,
        logged_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setWaterLogs((current) => [data, ...current]);
  }

  async function deleteWater(log: WaterLog) {
    setError(null);
    const previousLogs = waterLogs;
    setWaterLogs((current) => current.filter((item) => item.id !== log.id));

    const { error: deleteError } = await supabase.from("water_logs").delete().eq("id", log.id);

    if (deleteError) {
      setWaterLogs(previousLogs);
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          title="Nutrition Module"
          subtitle="Fuel your mission with better food, hydration, and consistency."
        />
        <Button onClick={openNewMeal} type="button">
          <Plus className="h-4 w-4" />
          Log Meal
        </Button>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      {loadingMessage ? (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-400">{loadingMessage}</p>
        </GlassCard>
      ) : null}

      <NutritionSummaryCards meals={meals} waterLogs={waterLogs} waterTargetMl={waterTargetMl} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <HydrationSystem onAddWater={addWater} onDeleteWater={deleteWater} waterLogs={waterLogs} waterTargetMl={waterTargetMl} />
        <ProteinSignal meals={meals} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <MacroDistributionChart meals={meals} />
        <MealQualityReflection />
      </div>

      <MealHistory meals={meals} onDelete={deleteMeal} onEdit={openEditMeal} onNewMeal={openNewMeal} />

      <MealFormDialog
        meal={editingMeal}
        onClose={() => {
          setDialogOpen(false);
          setEditingMeal(null);
        }}
        onSubmit={saveMeal}
        open={dialogOpen}
      />
    </div>
  );
}

function normalizeMeal(values: MealFormInput) {
  return {
    meal_type: values.mealType,
    title: values.title.trim(),
    calories: values.calories ?? null,
    protein_g: values.proteinG ?? null,
    carbs_g: values.carbsG ?? null,
    fat_g: values.fatG ?? null,
    logged_at: values.loggedAt ? new Date(values.loggedAt).toISOString() : new Date().toISOString(),
    notes: values.notes?.trim() || null,
  };
}
