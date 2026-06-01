import { AlertCircle, CalendarClock, CheckCircle2, ListTodo } from "lucide-react";

import { StatCard } from "@/components/astra";
import { getTaskSummary, type AstraTask } from "@/components/astra/tasks/task-utils";

export function TaskSummaryCards({ tasks }: { tasks: AstraTask[] }) {
  const summary = getTaskSummary(tasks);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={ListTodo} subtitle="Open or in progress" title="Open tasks" value={String(summary.open)} />
      <StatCard icon={CalendarClock} subtitle="Require attention today" title="Due today" value={String(summary.dueToday)} />
      <StatCard icon={AlertCircle} subtitle="High or critical priority" title="High priority" value={String(summary.highPriority)} />
      <StatCard icon={CheckCircle2} subtitle="Closed since Sunday" title="Completed this week" value={String(summary.completedThisWeek)} />
    </div>
  );
}
