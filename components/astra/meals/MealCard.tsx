"use client";

import { Edit3, Trash2, Utensils } from "lucide-react";

import { GlassCard } from "@/components/astra";
import {
  formatMealTime,
  formatNumber,
  mealTypeLabels,
  type AstraMeal,
} from "@/components/astra/meals/nutrition-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MealCardProps = {
  meal: AstraMeal;
  onEdit: (meal: AstraMeal) => void;
  onDelete: (meal: AstraMeal) => Promise<void>;
};

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <GlassCard className="p-4" data-testid="meal-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
              <Utensils className="h-4 w-4 text-emerald-200" />
            </div>
            <h3 className="truncate text-base font-semibold text-white">{meal.title}</h3>
            <Badge tone="emerald">{mealTypeLabels[meal.meal_type]}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-400">{formatMealTime(meal.logged_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button aria-label={`Edit ${meal.title}`} onClick={() => onEdit(meal)} size="icon" type="button" variant="ghost">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button aria-label={`Delete ${meal.title}`} onClick={() => onDelete(meal)} size="icon" type="button" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MacroPill label="Calories" value={formatNumber(Number(meal.calories ?? 0))} />
        <MacroPill label="Protein" value={formatNumber(Number(meal.protein_g ?? 0), "g")} />
        <MacroPill label="Carbs" value={formatNumber(Number(meal.carbs_g ?? 0), "g")} />
        <MacroPill label="Fat" value={formatNumber(Number(meal.fat_g ?? 0), "g")} />
      </div>

      {meal.notes ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{meal.notes}</p> : null}
    </GlassCard>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
