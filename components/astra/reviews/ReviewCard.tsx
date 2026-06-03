"use client";

import { CalendarDays, Edit3 } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { type DailyReview } from "@/components/astra/reviews/review-utils";

type ReviewCardProps = {
  review: DailyReview;
  onSelect: (review: DailyReview) => void;
};

export function ReviewCard({ review, onSelect }: ReviewCardProps) {
  const preview =
    review.what_went_well || review.what_to_improve || review.what_drained_energy || review.ai_summary || "Reflection saved.";

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-cyan-300/10">
              <CalendarDays className="h-4 w-4 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{review.review_date}</h3>
              <p className="text-xs text-slate-500">Daily Debrief</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
            <SignalPill label="Mood" value={review.mood_score} />
            <SignalPill label="Energy" value={review.energy_score} />
            <SignalPill label="Focus" value={review.focus_score} />
          </div>
        </div>
        <Button aria-label={`View or edit review ${review.review_date}`} onClick={() => onSelect(review)} size="icon" type="button" variant="ghost">
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{preview}</p>
    </GlassCard>
  );
}

function SignalPill({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1">
      {label}: <span className="text-cyan-100">{value ?? "-"}</span>
    </span>
  );
}
