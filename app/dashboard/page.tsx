import { Activity, Brain, Droplets, Moon, Target, TimerReset } from "lucide-react";

import { FocusFlowChart } from "@/components/focus-flow-chart";
import { MetricCard } from "@/components/metric-card";
import { MotionPanel } from "@/components/motion-panel";
import { PageHeader } from "@/components/page-header";
import { QuickCapture } from "@/components/quick-capture";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { habitSignals, missionTasks, reviewPrompts } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        description="A focused cockpit for what matters today: capture the signal, fly the plan, review what happened, and make one calm correction."
        eyebrow="Command Center"
        signal="Mission window: Today"
        title="Today's Mission"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MotionPanel>
          <MetricCard icon={Target} label="Mission Completion" value="68%" helper="4 active items remain" progress={68} />
        </MotionPanel>
        <MotionPanel delay={0.05}>
          <MetricCard icon={TimerReset} label="Focus Engine" value="4.2h" helper="Target: 5h deep work" progress={84} tone="blue" />
        </MotionPanel>
        <MotionPanel delay={0.1}>
          <MetricCard icon={Droplets} label="Hydration System" value="1.8L" helper="1.2L left today" progress={60} tone="cyan" />
        </MotionPanel>
        <MotionPanel delay={0.15}>
          <MetricCard icon={Moon} label="Recovery" value="7h 10m" helper="Stable sleep signal" progress={95} tone="emerald" />
        </MotionPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MotionPanel delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Systems Status</CardTitle>
              <CardDescription>Life Signals are intentionally small, honest, and non-shaming.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {habitSignals.map((signal) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={signal.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{signal.label}</p>
                    <Badge tone={signal.tone}>{signal.value}</Badge>
                  </div>
                  <Progress className="mt-4" tone={signal.tone} value={signal.progress} />
                  <p className="mt-2 text-xs text-slate-500">Target: {signal.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </MotionPanel>

        <MotionPanel delay={0.25}>
          <SectionGrid
            description="A short queue for the day, not an overwhelming backlog."
            title="Mission Queue"
          >
            {missionTasks.map((task) => (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4" key={task.id}>
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.area} / {task.due}</p>
                </div>
                <Badge tone={task.complete ? "emerald" : task.priority === "High" ? "cyan" : "violet"}>
                  {task.complete ? "Done" : task.priority}
                </Badge>
              </div>
            ))}
          </SectionGrid>
        </MotionPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MotionPanel delay={0.3}>
          <QuickCapture />
        </MotionPanel>
        <MotionPanel delay={0.35}>
          <Card>
            <CardHeader>
              <CardTitle>Time Orbit</CardTitle>
              <CardDescription>Focus hours and manual screen time across the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <FocusFlowChart />
            </CardContent>
          </Card>
        </MotionPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionGrid description="Supportive prompts for the end of the day." title="Daily Debrief">
          {reviewPrompts.map((item) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={item.title}>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.prompt}</p>
            </div>
          ))}
        </SectionGrid>
        <SectionGrid description="The smallest useful correction for tomorrow." title="Course Correction">
          <div className="rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4">
            <Activity className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-sm text-slate-200">
              Protect the first focus block before opening social feeds. Keep the evening review to five minutes.
            </p>
          </div>
        </SectionGrid>
        <SectionGrid description="Prepared for future OpenAI-compatible integration." title="AI Copilot">
          <div className="rounded-lg border border-violet-200/20 bg-violet-200/10 p-4">
            <Brain className="h-5 w-5 text-violet-200" />
            <p className="mt-3 text-sm text-slate-200">
              AI planning, debriefs, weekly reports, and quick capture can use the same typed signal contracts.
            </p>
          </div>
        </SectionGrid>
      </div>
    </>
  );
}
