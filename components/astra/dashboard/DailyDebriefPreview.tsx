import Link from "next/link";
import { Activity, BrainCircuit, Gauge } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/types/database";

type DailyReview = Database["public"]["Tables"]["daily_reviews"]["Row"];

export function DailyDebriefPreview({ review }: { review: DailyReview | null }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="Daily Debrief Preview"
        subtitle={review ? "Today's reflection loop is active." : "Close the loop gently when the day is ready."}
        action={
          <Button asChild size="sm" variant="secondary">
            <Link href="/reviews">{review ? "Open Debrief" : "Start Daily Debrief"}</Link>
          </Button>
        }
      />
      {review ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Score icon={Activity} label="Mood" value={review.mood_score} />
            <Score icon={Gauge} label="Energy" value={review.energy_score} />
            <Score icon={BrainCircuit} label="Focus" value={review.focus_score} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AI summary preview</p>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">
              {review.ai_summary || review.what_to_improve || review.what_went_well || "Debrief saved. Generate an AI summary from Reviews when ready."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm leading-6 text-slate-400">
            No Daily Debrief logged yet. Start with today&apos;s reflection when you have a quiet moment.
          </p>
        </div>
      )}
    </GlassCard>
  );
}

function Score({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-200" />
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value ?? "-"}/10</p>
    </div>
  );
}
