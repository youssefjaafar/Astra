import { BrainCircuit, ShieldCheck } from "lucide-react";

import { GlassCard, ProgressRing, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { DashboardCopilotInsight } from "@/lib/types";

export function AiCopilotInsightCard({ insight }: { insight: DashboardCopilotInsight }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="AI Copilot Insight"
        subtitle="A practical signal for tomorrow, without overwhelming advice."
        action={<ProgressRing label="trust" size={78} tone="violet" value={insight.confidence} />}
      />
      <div className="mt-5 rounded-lg border border-violet-200/20 bg-violet-200/10 p-4">
        <BrainCircuit className="h-5 w-5 text-violet-200" />
        <p className="mt-3 text-base font-semibold text-white">{insight.title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{insight.body}</p>
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          <Badge tone="cyan">{insight.confidence}% confidence</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{insight.suggestedAction}</p>
      </div>
    </GlassCard>
  );
}
