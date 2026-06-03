"use client";

import { Droplets, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { GlassCard, ProgressRing, SectionHeader } from "@/components/astra";
import {
  formatMilliliters,
  getHydrationMessage,
  getNutritionSummary,
  type WaterLog,
} from "@/components/astra/meals/nutrition-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HydrationSystemProps = {
  waterLogs: WaterLog[];
  waterTargetMl: number;
  onAddWater: (amountMl: number) => Promise<void>;
  onDeleteWater: (log: WaterLog) => Promise<void>;
};

const quickAmounts = [250, 500, 750];

export function HydrationSystem({ waterLogs, waterTargetMl, onAddWater, onDeleteWater }: HydrationSystemProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [saving, setSaving] = useState<number | "custom" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const summary = getNutritionSummary([], waterLogs, waterTargetMl);
  const message = getHydrationMessage(summary.waterMl, waterTargetMl);
  const latestLog = waterLogs[0] ?? null;

  async function logWater(amountMl: number, source: number | "custom") {
    setSaving(source);
    await onAddWater(amountMl);
    setSaving(null);
    if (source === "custom") setCustomAmount("");
  }

  async function deleteLatestWater() {
    if (!latestLog) return;

    setDeleting(true);
    await onDeleteWater(latestLog);
    setDeleting(false);
  }

  return (
    <GlassCard className="relative overflow-hidden p-5" glow={summary.hydrationProgress >= 100}>
      <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full border border-cyan-300/20" />
      <div className="pointer-events-none absolute -right-3 top-8 h-24 w-24 rounded-full border border-emerald-300/15" />

      <SectionHeader title="Hydration System" subtitle="Keep the flow steady without overthinking it." />

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <ProgressRing label="flow" size={118} tone={summary.hydrationProgress >= 100 ? "emerald" : "cyan"} value={summary.hydrationProgress} />
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-white">{formatMilliliters(summary.waterMl)}</p>
            <p className="text-sm text-slate-500">/ {formatMilliliters(waterTargetMl)}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <Button disabled={Boolean(saving)} key={amount} onClick={() => logWater(amount, amount)} type="button" variant="secondary">
                {saving === amount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplets className="h-4 w-4" />}
                +{amount}ml
              </Button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              min={1}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Custom ml"
              type="number"
              value={customAmount}
            />
            <Button
              disabled={Boolean(saving) || !customAmount}
              onClick={() => logWater(Number(customAmount), "custom")}
              type="button"
            >
              {saving === "custom" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
          {latestLog ? (
            <Button className="mt-3" disabled={deleting} onClick={deleteLatestWater} size="sm" type="button" variant="ghost">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Undo latest water signal
            </Button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
