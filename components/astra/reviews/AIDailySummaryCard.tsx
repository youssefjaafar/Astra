"use client";

import { BrainCircuit, Loader2 } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";

type AIDailySummaryCardProps = {
  selectedDate: string;
  summary: string | null;
  loading: boolean;
  onGenerate: () => Promise<void>;
};

export function AIDailySummaryCard({ selectedDate, summary, loading, onGenerate }: AIDailySummaryCardProps) {
  return (
    <GlassCard className="p-5">
      <SectionHeader
        action={
          <Button disabled={loading} onClick={onGenerate} size="sm" type="button" variant="secondary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Generate
          </Button>
        }
        subtitle={`Pattern Detection for ${selectedDate}`}
        title="AI Daily Summary"
      />
      <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/50 p-4">
        {summary ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">{summary}</pre>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            Generate a calm summary after saving the debrief. Astra will look for what worked, what repeated, and one realistic Course Correction.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
