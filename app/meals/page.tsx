import { Droplets, Salad, Utensils } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mealHistory } from "@/lib/mock-data";

export default function MealsPage() {
  return (
    <>
      <PageHeader
        description="Plan meals, log what actually happened, and keep hydration visible without guilt."
        eyebrow="Nutrition Module"
        signal="Meal plan active"
        title="Meals and Water"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard helper="1.2L remaining" icon={Droplets} label="Hydration System" progress={60} tone="cyan" value="1.8L" />
        <MetricCard helper="Target: 150g" icon={Utensils} label="Protein" progress={79} tone="blue" value="118g" />
        <MetricCard helper="2 planned, 1 logged" icon={Salad} label="Meal Coverage" progress={67} tone="emerald" value="2/3" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionGrid description="Simple enough to use every day." title="Meal Plan and History">
          {mealHistory.map((meal) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={meal.meal}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{meal.meal}</p>
                  <p className="mt-1 text-sm text-slate-400">{meal.entry}</p>
                </div>
                <Badge tone={meal.status === "Logged" ? "emerald" : "violet"}>{meal.status}</Badge>
              </div>
              <p className="mt-3 text-xs text-slate-500">Protein estimate: {meal.protein}</p>
            </div>
          ))}
        </SectionGrid>

        <SectionGrid description="Small controls that will later write to Supabase." title="Fast Logging">
          <div className="grid gap-3 sm:grid-cols-2">
            {["250ml water", "500ml water", "Add meal", "Mark meal prepped"].map((action) => (
              <Button key={action} variant="secondary">
                {action}
              </Button>
            ))}
          </div>
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
            The AI parser can turn captures like &quot;I ate chicken and rice&quot; into meal history once the model endpoint is connected.
          </p>
        </SectionGrid>
      </div>
    </>
  );
}
