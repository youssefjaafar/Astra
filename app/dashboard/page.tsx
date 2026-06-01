import { Activity, Brain, Droplets, Moon, Target, TimerReset } from "lucide-react";

import { GlassCard, ProgressRing, SectionHeader, StatCard } from "@/components/astra";
import { FocusFlowChart } from "@/components/focus-flow-chart";
import { MotionPanel } from "@/components/motion-panel";
import { QuickCapture } from "@/components/quick-capture";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { aiInsights, habits, reviewPrompts, tasks } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MotionPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Command Center
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Today&apos;s Mission</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              A focused cockpit for what matters today: capture the signal, fly the plan, review what happened, and make one calm correction.
            </p>
          </div>
          <Badge tone="violet">Mission window: Today</Badge>
        </div>
      </MotionPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MotionPanel delay={0.03}>
          <StatCard icon={Target} subtitle="4 active items remain" title="Mission Completion" trend="+8% from yesterday" value="68%" />
        </MotionPanel>
        <MotionPanel delay={0.06}>
          <StatCard icon={TimerReset} subtitle="Target: 5h deep work" title="Focus Engine" trend="Strong orbit" value="4.2h" />
        </MotionPanel>
        <MotionPanel delay={0.09}>
          <StatCard icon={Droplets} subtitle="1.2L left today" title="Hydration System" trend="Steady" value="1.8L" />
        </MotionPanel>
        <MotionPanel delay={0.12}>
          <StatCard icon={Moon} subtitle="Stable sleep signal" title="Recovery" trend="Protected" value="7h 10m" />
        </MotionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MotionPanel delay={0.15}>
          <GlassCard className="p-5">
            <SectionHeader
              title="Systems Status"
              subtitle="Life Signals are intentionally small, honest, and non-shaming."
              action={<ProgressRing label="day" size={86} value={68} />}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {habits.map((signal) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={signal.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{signal.label}</p>
                    <Badge tone={signal.tone}>{signal.value}</Badge>
                  </div>
                  <Progress className="mt-4" tone={signal.tone} value={signal.progress} />
                  <p className="mt-2 text-xs text-slate-500">Target: {signal.target}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </MotionPanel>

        <MotionPanel delay={0.18}>
          <GlassCard className="p-5">
            <SectionHeader title="Mission Queue" subtitle="A short queue for the day, not an overwhelming backlog." />
            <div className="mt-5 space-y-3">
              {tasks.map((task) => (
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
            </div>
          </GlassCard>
        </MotionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MotionPanel delay={0.21}>
          <QuickCapture />
        </MotionPanel>
        <MotionPanel delay={0.24}>
          <GlassCard className="p-5">
            <SectionHeader title="Time Orbit" subtitle="Focus hours and manual screen time across the week." />
            <div className="mt-4">
              <FocusFlowChart />
            </div>
          </GlassCard>
        </MotionPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5">
          <SectionHeader title="Daily Debrief" subtitle="Supportive prompts for the end of the day." />
          <div className="mt-5 space-y-3">
            {reviewPrompts.map((item) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={item.title}>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.prompt}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Course Correction" subtitle="The smallest useful correction for tomorrow." />
          <div className="mt-5 rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4">
            <Activity className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-sm text-slate-200">
              Protect the first focus block before opening social feeds. Keep the evening review to five minutes.
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="AI Copilot" subtitle="Prepared for future AI integration." />
          <div className="mt-5 space-y-3">
            {aiInsights.slice(0, 2).map((insight) => (
              <div className="rounded-lg border border-violet-200/20 bg-violet-200/10 p-4" key={insight.title}>
                <Brain className="h-5 w-5 text-violet-200" />
                <p className="mt-3 text-sm font-medium text-white">{insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{insight.summary}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
