"use client";

import { BrainCircuit, CalendarClock, Compass } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import { formatConfidence, formatInsightDate, type AIInsight } from "@/components/astra/ai/ai-utils";

export function AIInsightCard({ insight }: { insight: AIInsight }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-violet-300/10">
              <BrainCircuit className="h-4 w-4 text-violet-200" />
            </div>
            <h3 className="text-base font-semibold text-white">{insight.title}</h3>
            <Badge tone="violet">{insight.insight_type}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="cyan">{formatConfidence(insight.confidence)}</Badge>
            <Badge tone="neutral">
              <CalendarClock className="mr-1 h-3 w-3" />
              {formatInsightDate(insight.created_at)}
            </Badge>
          </div>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{insight.body}</p>
      {insight.suggested_action ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="h-4 w-4 text-cyan-200" />
            Suggested action
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{insight.suggested_action}</p>
        </div>
      ) : null}
    </GlassCard>
  );
}
