import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sampleSignals = ["500ml water", "45 min training", "12 pages read"];

export function DemoQuickCapture() {
  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="Quick Capture"
        subtitle="Turn natural language into structured life signals."
        action={<Badge tone="amber">Preview only</Badge>}
      />

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="flex min-h-24 items-start gap-3 rounded-md border border-dashed border-white/10 bg-slate-950/35 px-3 py-3 text-sm text-slate-500">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-200/70" />
          <span>I drank 500ml water after my morning focus block...</span>
        </div>
        <Button asChild className="mt-3 w-full">
          <Link href="/signup">
            <LockKeyhole className="h-4 w-4" />
            Unlock Quick Capture
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sampleSignals.map((signal) => (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-500" key={signal}>
            {signal}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-cyan-200/15 bg-cyan-200/[0.06] p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
        <p className="text-xs leading-5 text-slate-400">
          Demo input is intentionally inactive. The AI service and your data layer are never contacted.
        </p>
      </div>
    </GlassCard>
  );
}
