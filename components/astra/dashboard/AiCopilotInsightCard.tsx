import { BrainCircuit, ShieldCheck } from "lucide-react";

import { GlassCard, ProgressRing, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { DashboardCopilotInsight } from "@/lib/types";

export function AiCopilotInsightCard({ insight }: { insight: DashboardCopilotInsight | null }) {
  const displayInsight = insight ?? {
    title: "Signal history forming",
    body: "Track a few more signals and Astra will begin detecting patterns.",
    confidence: 0,
    suggestedAction: "Capture one useful life signal today, then return here for a more specific pattern.",
  };

  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="AI Copilot Insight"
        subtitle="A practical signal for tomorrow, without overwhelming advice."
        action={<ProgressRing label="trust" size={78} tone="violet" value={displayInsight.confidence} />}
      />
      <div className="mt-5 rounded-lg border border-violet-200/20 bg-violet-200/10 p-4">
        <BrainCircuit className="h-5 w-5 text-violet-200" />
        <p className="mt-3 text-base font-semibold text-white">{displayInsight.title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{displayInsight.body}</p>
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          <Badge tone={insight ? "cyan" : "neutral"}>{insight ? `${displayInsight.confidence}% confidence` : "Awaiting signal"}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{displayInsight.suggestedAction}</p>
      </div>
    </GlassCard>
  );
}
