"use client";

import { EmptyState, SectionHeader } from "@/components/astra";
import { AIInsightCard } from "@/components/astra/ai/AIInsightCard";
import type { AIInsight } from "@/components/astra/ai/ai-utils";

type AIInsightHistoryProps = {
  insights: AIInsight[];
};

export function AIInsightHistory({ insights }: AIInsightHistoryProps) {
  if (insights.length === 0) {
    return (
      <EmptyState
        description="Your signal history is still forming. Track a few days, and Astra will become more accurate."
        title="No saved insights yet."
      />
    );
  }

  return (
    <section>
      <SectionHeader title="AI Insights History" subtitle="Saved observations and course corrections." />
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {insights.map((insight) => (
          <AIInsightCard insight={insight} key={insight.id} />
        ))}
      </div>
    </section>
  );
}
