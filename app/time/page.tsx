import { Clock3, Monitor, Timer, Zap } from "lucide-react";

import { FocusFlowChart } from "@/components/focus-flow-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { TimeOrbitChart } from "@/components/time-orbit-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { timeOrbit } from "@/lib/mock-data";

export default function TimePage() {
  return (
    <>
      <PageHeader
        description="See where the day went, log screen time manually for now, and protect the next focus block."
        eyebrow="Time Orbit"
        signal="Manual screen time"
        title="Time Tracker"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Target: 5h" icon={Zap} label="Focus Engine" progress={84} tone="cyan" value="4.2h" />
        <MetricCard helper="Logged manually" icon={Monitor} label="Screen Time" progress={58} tone="amber" value="2.0h" />
        <MetricCard helper="Next block at 2:00 PM" icon={Timer} label="Focus Sessions" progress={75} tone="blue" value="3/4" />
        <MetricCard helper="Low meeting density" icon={Clock3} label="Open Time" progress={64} tone="violet" value="2.5h" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Daily Orbit</CardTitle>
            <CardDescription>Today&apos;s time split across work, training, reading, and drift.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOrbitChart />
            <div className="grid gap-2 sm:grid-cols-2">
              {timeOrbit.map((item) => (
                <div className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2" key={item.label}>
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <Badge tone="neutral">{item.hours}h</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Flow</CardTitle>
            <CardDescription>Weekly focus and screen time trend.</CardDescription>
          </CardHeader>
          <CardContent>
            <FocusFlowChart />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <SectionGrid description="One practical correction, not a lecture." title="Course Correction">
          <p className="rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4 text-sm leading-6 text-slate-200">
            Keep manual screen time logging to two moments: after lunch and before Daily Debrief. That is enough signal without turning tracking into a second job.
          </p>
        </SectionGrid>
      </div>
    </>
  );
}
