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
import { MotionPanel } from "@/components/motion-panel";
import {
  dashboardCopilotInsight,
  dashboardHero,
  dashboardMission,
  dashboardSystemStatuses,
  dashboardTimeDistribution,
  weeklyMissionSnapshot,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MotionPanel>
        <CommandCenterHero
          dayCompletion={dashboardHero.dayCompletion}
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
          <DashboardQuickCapture />
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
        <DailyDebriefPreview />
      </MotionPanel>
    </div>
  );
}
