"use client";

import { BookOpen, CheckCircle2, Clock3, Droplets, Dumbbell, Moon, Orbit, ScrollText, ShieldCheck, Utensils } from "lucide-react";

import { StatCard } from "@/components/astra";
import { formatLiters, formatMinutes, getDailySignalSummary, type ReviewSignals } from "@/components/astra/reviews/review-utils";

type DailySignalSummaryProps = {
  signals: ReviewSignals;
  selectedDate: string;
};

export function DailySignalSummary({ signals, selectedDate }: DailySignalSummaryProps) {
  const summary = getDailySignalSummary(signals, selectedDate);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard icon={CheckCircle2} subtitle="Completed tasks" title="Tasks" value={String(summary.tasksCompleted)} />
      <StatCard icon={Clock3} subtitle="Total tracked time" title="Tracked time" value={formatMinutes(summary.totalTrackedMinutes)} />
      <StatCard icon={Orbit} subtitle="Deep work signal" title="Deep work" value={formatMinutes(summary.deepWorkMinutes)} />
      <StatCard icon={ScrollText} subtitle="Scrolling/social time" title="Distraction" value={formatMinutes(summary.distractionMinutes)} />
      <StatCard icon={Utensils} subtitle="Meals logged" title="Meals" value={String(summary.mealsLogged)} />
      <StatCard icon={Droplets} subtitle="Water intake" title="Hydration" value={formatLiters(summary.waterMl)} />
      <StatCard icon={Dumbbell} subtitle="Training sessions" title="Workouts" value={String(summary.workouts)} />
      <StatCard icon={ShieldCheck} subtitle="Prayer completions" title="Prayer" value={String(summary.prayerCompleted)} />
      <StatCard icon={Moon} subtitle="Meditation minutes" title="Meditation" value={formatMinutes(summary.meditationMinutes)} />
      <StatCard
        icon={BookOpen}
        subtitle={`${summary.readingPages} page${summary.readingPages === 1 ? "" : "s"}`}
        title="Reading"
        value={formatMinutes(summary.readingMinutes)}
      />
    </div>
  );
}
