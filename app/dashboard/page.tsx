import { redirect } from "next/navigation";

import {
  AiCopilotInsightCard,
  CommandCenterHero,
  DailyDebriefPreview,
  DashboardQuickCapture,
  SystemsStatusGrid,
  TimeOrbitSection,
  TodaysMission,
  WeeklyMissionSnapshot,
} from "@/components/astra/dashboard";
import { GlassCard } from "@/components/astra";
import { MotionPanel } from "@/components/motion-panel";
import { getDashboardData } from "@/lib/dashboard/data";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dashboard = await getDashboardData(supabase, user.id, user.email ?? null);

  return (
    <div className="space-y-6">
      {dashboard.error ? (
        <GlassCard className="border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <p>{dashboard.error}</p>
        </GlassCard>
      ) : null}

      <MotionPanel>
        <CommandCenterHero
          dayCompletion={dashboard.hero.dayCompletion}
          displayName={dashboard.hero.displayName}
          focusState={dashboard.hero.focusState}
          statusLine={dashboard.hero.statusLine}
        />
      </MotionPanel>

      <MotionPanel delay={0.05}>
        <TodaysMission mission={dashboard.mission} />
      </MotionPanel>

      <MotionPanel delay={0.1}>
        <SystemsStatusGrid statuses={dashboard.statuses} />
      </MotionPanel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MotionPanel delay={0.15}>
          <TimeOrbitSection data={dashboard.timeDistribution} />
        </MotionPanel>
        <MotionPanel delay={0.2}>
          <DashboardQuickCapture />
        </MotionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MotionPanel delay={0.25}>
          <AiCopilotInsightCard insight={dashboard.insight} />
        </MotionPanel>
        <MotionPanel delay={0.3}>
          <WeeklyMissionSnapshot snapshot={dashboard.weeklySnapshot} />
        </MotionPanel>
      </div>

      <MotionPanel delay={0.35}>
        <DailyDebriefPreview review={dashboard.dailyReview} />
      </MotionPanel>
    </div>
  );
}
