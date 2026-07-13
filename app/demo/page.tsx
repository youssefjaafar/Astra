import type { Metadata } from "next";

import { GlassCard } from "@/components/astra";
import {
  AiCopilotInsightCard,
  CommandCenterHero,
  DailyDebriefPreview,
  DemoModeBanner,
  DemoQuickCapture,
  SystemsStatusGrid,
  TimeOrbitSection,
  TodaysMission,
  WeeklyMissionSnapshot,
} from "@/components/astra/dashboard";
import { MotionPanel } from "@/components/motion-panel";
import {
  dashboardCopilotInsight,
  dashboardHero,
  dashboardMission,
  dashboardSystemStatuses,
  dashboardTimeDistribution,
  weeklyMissionSnapshot,
} from "@/lib/mock-data";
import type { Database } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Astra Demo | Personal Mission Control",
  description: "Explore Astra's Command Center with fictional, read-only sample data—no account required.",
};

const demoReview: Database["public"]["Tables"]["daily_reviews"]["Row"] = {
  id: "demo-review",
  user_id: "demo-user",
  review_date: "2026-07-13",
  what_went_well: "Protected the first deep-work block and kept the morning routine calm.",
  what_drained_energy: "Context switching during the early afternoon.",
  what_to_improve: "Batch messages after the next focus block instead of checking between tasks.",
  mood_score: 8,
  energy_score: 7,
  focus_score: 8,
  ai_summary:
    "The strongest signal was a protected morning. Tomorrow, preserve that opening block and move communication into one intentional afternoon window.",
  created_at: null,
  updated_at: null,
};

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <DemoModeBanner />

      <MotionPanel>
        <CommandCenterHero
          dayCompletion={dashboardHero.dayCompletion}
          displayName="Alex"
          focusState={dashboardHero.focusState}
          statusLine={dashboardHero.statusLine}
        />
      </MotionPanel>

      <MotionPanel delay={0.05}>
        <TodaysMission mission={dashboardMission} />
      </MotionPanel>

      <MotionPanel delay={0.1}>
        <SystemsStatusGrid statuses={dashboardSystemStatuses} />
      </MotionPanel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MotionPanel delay={0.15}>
          <TimeOrbitSection data={dashboardTimeDistribution} />
        </MotionPanel>
        <MotionPanel delay={0.2}>
          <DemoQuickCapture />
        </MotionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MotionPanel delay={0.25}>
          <AiCopilotInsightCard insight={dashboardCopilotInsight} />
        </MotionPanel>
        <MotionPanel delay={0.3}>
          <WeeklyMissionSnapshot snapshot={weeklyMissionSnapshot} />
        </MotionPanel>
      </div>

      <MotionPanel delay={0.35}>
        <DailyDebriefPreview demoMode review={demoReview} />
      </MotionPanel>

      <GlassCard className="overflow-hidden border-cyan-200/20 p-6 text-center sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">End of sample telemetry</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Ready to bring your own life into orbit?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Create a private cockpit to capture real signals, personalize your targets, and use AI features on your terms.
        </p>
      </GlassCard>
    </div>
  );
}
