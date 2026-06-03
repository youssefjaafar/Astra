import { Beef, Droplets, Flame, Salad, Sandwich, Wheat } from "lucide-react";

import { StatCard } from "@/components/astra";
import {
  formatMilliliters,
  formatNumber,
  getNutritionSummary,
  type AstraMeal,
  type WaterLog,
} from "@/components/astra/meals/nutrition-utils";

type NutritionSummaryCardsProps = {
  meals: AstraMeal[];
  waterLogs: WaterLog[];
  waterTargetMl: number;
};

export function NutritionSummaryCards({ meals, waterLogs, waterTargetMl }: NutritionSummaryCardsProps) {
  const summary = getNutritionSummary(meals, waterLogs, waterTargetMl);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard icon={Flame} subtitle="Fuel logged today" title="Calories" value={formatNumber(summary.calories)} />
      <StatCard icon={Beef} subtitle="Training support signal" title="Protein" value={formatNumber(summary.protein, "g")} />
      <StatCard icon={Wheat} subtitle="Energy stores" title="Carbs" value={formatNumber(summary.carbs, "g")} />
      <StatCard icon={Salad} subtitle="Steady fuel balance" title="Fat" value={formatNumber(summary.fat, "g")} />
      <StatCard icon={Sandwich} subtitle="Fuel events captured" title="Meals logged" value={String(summary.mealsLogged)} />
      <StatCard
        icon={Droplets}
        subtitle={`${formatMilliliters(summary.waterMl)} / ${formatMilliliters(summary.waterTargetMl)}`}
        title="Hydration"
        value={`${summary.hydrationProgress}%`}
      />
    </div>
  );
}
