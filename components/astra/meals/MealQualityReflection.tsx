"use client";

import { useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const options = ["Yes", "Somewhat", "No"] as const;

export function MealQualityReflection() {
  const [selected, setSelected] = useState<(typeof options)[number] | null>(null);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Meal Quality Reflection" subtitle="A quick energy check, without judgment." />
      <p className="mt-5 text-sm font-medium text-slate-200">Did today&apos;s food support your energy?</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <Button
            className={cn(selected === option && "border-cyan-300/40 bg-cyan-300/15 text-white")}
            key={option}
            onClick={() => setSelected(option)}
            type="button"
            variant="secondary"
          >
            {option}
          </Button>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">
        {selected ? `Logged locally for this session: ${selected}.` : "Pick one signal when the day feels clear enough to review."}
      </p>
    </GlassCard>
  );
}
