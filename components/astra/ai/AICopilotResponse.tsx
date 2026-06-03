"use client";

import { BrainCircuit, Compass, ShieldCheck } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { SaveInsightButton } from "@/components/astra/ai/SaveInsightButton";
import { Badge } from "@/components/ui/badge";
import { formatConfidence, type AIInsight } from "@/components/astra/ai/ai-utils";
import type { CopilotAnswer } from "@/lib/validations/copilot";

type AICopilotResponseProps = {
  answer: CopilotAnswer | null;
  userId: string;
  relatedPeriodStart: string | null;
  relatedPeriodEnd: string | null;
  onSaved: (insight: AIInsight) => void;
  onError: (message: string) => void;
};

export function AICopilotResponse({
  answer,
  userId,
  relatedPeriodStart,
  relatedPeriodEnd,
  onSaved,
  onError,
}: AICopilotResponseProps) {
  return (
    <GlassCard className="p-5">
      <SectionHeader
        action={
          answer ? (
            <SaveInsightButton
              answer={answer}
              onError={onError}
              onSaved={onSaved}
              relatedPeriodEnd={relatedPeriodEnd}
              relatedPeriodStart={relatedPeriodStart}
              userId={userId}
            />
          ) : null
        }
        subtitle="Navigation output from Astra Intelligence."
        title="Copilot Response"
      />
      <div className="mt-5 rounded-lg border border-violet-200/20 bg-violet-200/10 p-5">
        {answer ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-violet-200" />
              <Badge tone="violet">{answer.insight_type}</Badge>
              <Badge tone="cyan">{formatConfidence(answer.confidence)}</Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">{answer.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{answer.answer}</p>
            {answer.suggested_action ? (
              <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-cyan-200" />
                  <p className="text-sm font-semibold text-white">Suggested Action</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{answer.suggested_action}</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="py-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-cyan-200" />
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Ask a question or choose a suggested action. Astra will answer from tracked data and name uncertainty when the signal is thin.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
