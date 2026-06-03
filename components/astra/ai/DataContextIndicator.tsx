"use client";

import { CheckCircle2, Clock3, Database, Dumbbell, ListChecks, Moon } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { CopilotContextSummary } from "@/components/astra/ai/ai-utils";

type DataContextIndicatorProps = {
  summary: CopilotContextSummary;
};

export function DataContextIndicator({ summary }: DataContextIndicatorProps) {
  const enoughData =
    summary.todayTasks +
      summary.todayTimeBlocks +
      summary.thisWeekHabits +
      summary.thisWeekWorkouts +
      summary.recentReviews >
    3;

  return (
    <GlassCard className="p-5">
      <SectionHeader
        action={<Badge tone={enoughData ? "cyan" : "amber"}>{enoughData ? "Signal available" : "Signal forming"}</Badge>}
        subtitle="Astra answers from this recent context by default."
        title="Data Context"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ContextRow icon={ListChecks} label="Today's tasks" value={summary.todayTasks} />
        <ContextRow icon={Clock3} label="Today's time blocks" value={summary.todayTimeBlocks} />
        <ContextRow icon={CheckCircle2} label="This week's habits" value={summary.thisWeekHabits} />
        <ContextRow icon={Dumbbell} label="This week's workouts" value={summary.thisWeekWorkouts} />
        <ContextRow icon={Moon} label="Recent reviews" value={summary.recentReviews} />
        <ContextRow icon={Database} label="Latest weekly report" value={summary.hasWeeklyReview ? "yes" : "not yet"} />
      </div>
      {!enoughData ? (
        <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          Your signal history is still forming. Track a few days, and Astra will become more accurate.
        </p>
      ) : null}
    </GlassCard>
  );
}

function ContextRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <span className="flex min-w-0 items-center gap-2 text-sm text-slate-300">
        <Icon className="h-4 w-4 shrink-0 text-cyan-200" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
