"use client";

import { AlertCircle, Loader2, Radar } from "lucide-react";
import { useState } from "react";

import { GlassCard } from "@/components/astra";
import { Button } from "@/components/ui/button";
import type { AIInsight } from "@/components/astra/ai/ai-utils";
import type { InsightCoverage, InsightStats } from "@/lib/insights/types";

type InsightEnginePanelProps = {
  onInsights: (insights: AIInsight[]) => void;
};

type InsightEnginePayload = {
  error?: string;
  insights?: AIInsight[];
  dataNotes?: string | null;
  coverage?: InsightCoverage;
  window?: InsightStats["window"];
};

type EngineResult = {
  insightCount: number;
  dataNotes: string | null;
  coverage: InsightCoverage;
};

export function InsightEnginePanel({ onInsights }: InsightEnginePanelProps) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<EngineResult | null>(null);

  async function analyzeSignals() {
    setLoading(true);
    setNotice(null);

    const response = await fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = (await response.json()) as InsightEnginePayload;

    setLoading(false);

    if (!response.ok || payload.error || !payload.insights || !payload.coverage) {
      setNotice(payload.error ?? "Astra could not analyze your signals right now.");
      return;
    }

    setResult({
      insightCount: payload.insights.length,
      dataNotes: payload.dataNotes ?? null,
      coverage: payload.coverage,
    });
    onInsights(payload.insights);
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Radar className="h-4 w-4 text-cyan-300" />
            Signal Correlations
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            Astra computes what correlates with your mood, energy, and focus over the last 4 weeks, then explains
            the patterns — no numbers are invented.
          </p>
        </div>
        <Button disabled={loading} onClick={analyzeSignals} size="sm" type="button" variant="secondary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          {loading ? "Analyzing…" : "Analyze my signals"}
        </Button>
      </div>

      {notice ? (
        <p className="flex items-start gap-2 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-xs text-amber-100">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-300">
            Generated {result.insightCount} insight{result.insightCount === 1 ? "" : "s"} — saved to your history
            below.
          </p>
          <div className="flex flex-wrap gap-2">
            <CoverageChip label="Reviews" days={result.coverage.reviewDays} total={result.coverage.windowDays} />
            <CoverageChip label="Journals" days={result.coverage.journalDays} total={result.coverage.windowDays} />
            <CoverageChip label="Sleep" days={result.coverage.sleepLoggedDays} total={result.coverage.windowDays} />
            <CoverageChip
              label="Screen time"
              days={result.coverage.scrollingLoggedDays}
              total={result.coverage.windowDays}
            />
            <CoverageChip label="Workouts" days={result.coverage.workoutDays} total={result.coverage.windowDays} />
            <CoverageChip label="Water" days={result.coverage.waterLoggedDays} total={result.coverage.windowDays} />
          </div>
          {result.dataNotes ? <p className="text-xs italic text-slate-400">{result.dataNotes}</p> : null}
        </div>
      ) : null}
    </GlassCard>
  );
}

function CoverageChip({ label, days, total }: { label: string; days: number; total: number }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
      {label} {days}/{total} days
    </span>
  );
}
