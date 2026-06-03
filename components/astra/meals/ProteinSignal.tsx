import { Beef } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Progress } from "@/components/ui/progress";
import { formatNumber, getNutritionSummary, getProteinMessage, type AstraMeal } from "@/components/astra/meals/nutrition-utils";

const defaultProteinTarget = 150;

export function ProteinSignal({ meals, proteinTarget = defaultProteinTarget }: { meals: AstraMeal[]; proteinTarget?: number }) {
  const summary = getNutritionSummary(meals, [], 1);
  const progress = proteinTarget > 0 ? Math.min(100, Math.round((summary.protein / proteinTarget) * 100)) : 0;

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Protein Signal" subtitle="A simple body-composition support marker." />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-white">{formatNumber(summary.protein, "g")}</p>
          <p className="mt-2 text-sm text-slate-500">Target placeholder: {proteinTarget}g/day</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-emerald-300/10">
          <Beef className="h-5 w-5 text-emerald-200" />
        </div>
      </div>
      <Progress className="mt-5" tone="emerald" value={progress} />
      <p className="mt-4 text-sm leading-6 text-slate-400">{getProteinMessage(summary.protein, proteinTarget)}</p>
    </GlassCard>
  );
}
