import { Bell, CalendarClock, CheckCircle2, Circle, Flag } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { missionTasks } from "@/lib/mock-data";

export default function TasksPage() {
  const openTasks = missionTasks.filter((task) => !task.complete);

  return (
    <>
      <PageHeader
        description="A calm mission queue for work tasks, personal tasks, and reminders. The backlog stays secondary; today stays visible."
        eyebrow="Today's Mission"
        signal={`${openTasks.length} open signals`}
        title="Tasks and Reminders"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Mission Queue</CardTitle>
            <CardDescription>Priority, context, and due time without a noisy task wall.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {missionTasks.map((task) => {
              const Icon = task.complete ? CheckCircle2 : Circle;

              return (
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4" key={task.id}>
                  <Icon className={task.complete ? "mt-0.5 h-5 w-5 text-emerald-300" : "mt-0.5 h-5 w-5 text-slate-500"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="neutral">{task.area}</Badge>
                      <Badge tone={task.priority === "High" ? "cyan" : "violet"}>{task.priority}</Badge>
                      <Badge tone="blue">{task.due}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <SectionGrid description="Keep reminders lightweight until calendar sync arrives." title="Reminder Radar">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <Bell className="h-5 w-5 text-cyan-200" />
              <p className="mt-3 text-sm text-white">Call Alex at 3:00 PM</p>
              <p className="mt-1 text-xs text-slate-500">Captured from natural language.</p>
            </div>
          </SectionGrid>

          <SectionGrid description="A simple shape for tomorrow." title="Plan Preview">
            {["One deep work block", "One personal anchor", "One recovery action"].map((item) => (
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3" key={item}>
                <Flag className="h-4 w-4 text-violet-200" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
            <Button className="w-full" variant="secondary">
              <CalendarClock className="h-4 w-4" />
              Draft Daily Plan
            </Button>
          </SectionGrid>
        </div>
      </div>
    </>
  );
}
