"use client";

import { BookOpen, CalendarClock, Cross, Dumbbell, Moon, Orbit, Radar, ShieldAlert, Sparkles, Target } from "lucide-react";

import { GlassCard, SectionHeader } from "@/components/astra";

const actions = [
  { label: "Plan today", prompt: "Plan my day using my current tasks and tracked signals.", icon: CalendarClock },
  { label: "Review yesterday", prompt: "Review yesterday and give me one honest course correction.", icon: Radar },
  { label: "Analyze this week", prompt: "Analyze this week. What patterns should I notice?", icon: Orbit },
  { label: "Find distractions", prompt: "What is hurting my focus? Look for distraction patterns.", icon: ShieldAlert },
  { label: "Improve reading", prompt: "Why am I not reading consistently? Suggest a small fix.", icon: BookOpen },
  { label: "Improve sleep", prompt: "What signals might be affecting my sleep or recovery?", icon: Moon },
  { label: "Improve workouts", prompt: "How can I improve workout consistency without overdoing it?", icon: Dumbbell },
  { label: "Prayer/meditation", prompt: "How can I improve prayer and meditation consistency?", icon: Cross },
  { label: "Course correction", prompt: "Give me one realistic course correction for tomorrow.", icon: Target },
];

type SuggestedActionGridProps = {
  disabled: boolean;
  onSelect: (prompt: string) => Promise<void>;
};

export function SuggestedActionGrid({ disabled, onSelect }: SuggestedActionGridProps) {
  return (
    <GlassCard className="p-5">
      <SectionHeader title="Suggested Actions" subtitle="Fast paths for common navigation questions." />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              className="group flex min-h-20 items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/10 disabled:pointer-events-none disabled:opacity-50"
              disabled={disabled}
              key={action.label}
              onClick={() => onSelect(action.prompt)}
              type="button"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-slate-950/60">
                <Icon className="h-4 w-4 text-cyan-200" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  {action.label}
                  {action.label === "Course correction" ? <Sparkles className="h-3.5 w-3.5 text-violet-200" /> : null}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{action.prompt}</span>
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
