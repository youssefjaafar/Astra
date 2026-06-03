"use client";

import { AlertCircle, BrainCircuit } from "lucide-react";
import { useState } from "react";

import { AICopilotInput } from "@/components/astra/ai/AICopilotInput";
import { AICopilotResponse } from "@/components/astra/ai/AICopilotResponse";
import { AIInsightHistory } from "@/components/astra/ai/AIInsightHistory";
import { DataContextIndicator } from "@/components/astra/ai/DataContextIndicator";
import { SuggestedActionGrid } from "@/components/astra/ai/SuggestedActionGrid";
import type { AIInsight, CopilotContextSummary } from "@/components/astra/ai/ai-utils";
import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { CopilotAnswer } from "@/lib/validations/copilot";

type AICopilotModuleProps = {
  initialInsights: AIInsight[];
  initialContextSummary: CopilotContextSummary;
  initialError: string | null;
  userId: string;
};

type CopilotPayload = {
  error?: string;
  answer?: CopilotAnswer;
  contextSummary?: CopilotContextSummary;
  relatedPeriodStart?: string;
  relatedPeriodEnd?: string;
};

export function AICopilotModule({ initialInsights, initialContextSummary, initialError, userId }: AICopilotModuleProps) {
  const [insights, setInsights] = useState(() => sortInsights(initialInsights));
  const [contextSummary, setContextSummary] = useState(initialContextSummary);
  const [answer, setAnswer] = useState<CopilotAnswer | null>(null);
  const [relatedPeriodStart, setRelatedPeriodStart] = useState<string | null>(initialContextSummary.relatedPeriodStart);
  const [relatedPeriodEnd, setRelatedPeriodEnd] = useState<string | null>(initialContextSummary.relatedPeriodEnd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function sendCommand(message: string) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/ai/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const payload = (await response.json()) as CopilotPayload;

    setLoading(false);

    if (!response.ok || payload.error || !payload.answer) {
      setError(payload.error ?? "Astra Copilot could not complete that command.");
      return;
    }

    setAnswer(payload.answer);
    if (payload.contextSummary) setContextSummary(payload.contextSummary);
    setRelatedPeriodStart(payload.relatedPeriodStart ?? payload.contextSummary?.relatedPeriodStart ?? null);
    setRelatedPeriodEnd(payload.relatedPeriodEnd ?? payload.contextSummary?.relatedPeriodEnd ?? null);
  }

  function addSavedInsight(insight: AIInsight) {
    setInsights((current) => sortInsights([insight, ...current.filter((item) => item.id !== insight.id)]));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader title="AI Copilot" subtitle="Analyze your life signals and receive calm course corrections." />
        <Badge className="w-fit gap-2 px-3 py-2" tone="cyan">
          <BrainCircuit className="h-4 w-4" />
          Astra Intelligence Online
        </Badge>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <AICopilotInput loading={loading} onSubmit={sendCommand} />
        <DataContextIndicator summary={contextSummary} />
      </div>

      <SuggestedActionGrid disabled={loading} onSelect={sendCommand} />

      <AICopilotResponse
        answer={answer}
        onError={setError}
        onSaved={addSavedInsight}
        relatedPeriodEnd={relatedPeriodEnd}
        relatedPeriodStart={relatedPeriodStart}
        userId={userId}
      />

      <AIInsightHistory insights={insights} />
    </div>
  );
}

function sortInsights(insights: AIInsight[]) {
  return [...insights].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}
