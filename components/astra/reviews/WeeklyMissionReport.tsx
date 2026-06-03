"use client";

import { BrainCircuit, CalendarRange, Loader2 } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type WeeklyReview } from "@/components/astra/reviews/review-utils";

type WeeklyMissionReportProps = {
  selectedWeek: string;
  weeklyReviews: WeeklyReview[];
  loading: boolean;
  onWeekChange: (weekStart: string) => void;
  onGenerate: () => Promise<void>;
};

export function WeeklyMissionReport({ selectedWeek, weeklyReviews, loading, onWeekChange, onGenerate }: WeeklyMissionReportProps) {
  const selectedReport = weeklyReviews.find((review) => review.week_start === selectedWeek) ?? null;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="p-5" glow>
        <SectionHeader
          action={
            <Button disabled={loading} onClick={onGenerate} type="button">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              Generate
            </Button>
          }
          subtitle="Weekly Mission Report with course corrections for the next orbit."
          title="Weekly Mission Report"
        />
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-medium text-slate-200">Selected week</span>
          <Input type="date" value={selectedWeek} onChange={(event) => onWeekChange(event.target.value)} />
        </label>
        <div className="mt-5 rounded-lg border border-cyan-200/15 bg-cyan-200/[0.045] p-5">
          {selectedReport?.ai_report ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">{selectedReport.ai_report}</pre>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              Generate a report to summarize time usage, tasks, habits, workouts, fuel, spiritual anchors, reading, and mood signals for this week.
            </p>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title="Previous Weekly Reports" subtitle="Saved mission reports by week." />
        <div className="mt-4 space-y-3">
          {weeklyReviews.length > 0 ? (
            weeklyReviews.map((review) => (
              <button
                className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/10"
                key={review.id}
                onClick={() => onWeekChange(review.week_start)}
                type="button"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-slate-950/60">
                  <CalendarRange className="h-4 w-4 text-cyan-200" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">
                    {review.week_start} to {review.week_end}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-500">
                    {review.summary || review.ai_report || "Weekly report saved."}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
              No weekly reports generated yet.
            </p>
          )}
        </div>
      </GlassCard>
    </section>
  );
}
