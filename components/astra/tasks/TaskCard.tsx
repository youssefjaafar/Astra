"use client";

import { Check, Clock, Edit3, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDueDate,
  getReminderState,
  type AstraTask,
} from "@/components/astra/tasks/task-utils";
import type { TaskPriority } from "@/lib/validations/tasks";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: AstraTask;
  onToggleComplete: (task: AstraTask) => Promise<void>;
  onEdit: (task: AstraTask) => void;
  onDelete: (task: AstraTask) => Promise<void>;
};

const priorityTones: Record<TaskPriority, "neutral" | "blue" | "violet" | "amber" | "cyan"> = {
  low: "neutral",
  medium: "blue",
  high: "violet",
  critical: "amber",
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const reminderState = getReminderState(task.due_at);
  const complete = task.status === "completed";

  return (
    <article className={cn("rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-200/20", complete && "opacity-70")}>
      <div className="flex items-start gap-3">
        <button
          aria-label={complete ? "Mark task incomplete" : "Mark task complete"}
          className={cn(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition",
            complete ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-100" : "border-white/15 bg-slate-950/60 text-transparent hover:border-cyan-200/40",
          )}
          onClick={() => onToggleComplete(task)}
          type="button"
        >
          <Check className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className={cn("text-sm font-semibold text-white", complete && "line-through decoration-slate-500")}>{task.title}</h3>
              {task.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{task.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button aria-label="Edit task" onClick={() => onEdit(task)} size="icon" type="button" variant="ghost">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button aria-label="Delete task" onClick={() => onDelete(task)} size="icon" type="button" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{task.category ?? "personal"}</Badge>
            <Badge tone={priorityTones[(task.priority ?? "medium") as TaskPriority]}>{task.priority ?? "medium"}</Badge>
            <Badge tone={task.status === "completed" ? "emerald" : task.status === "cancelled" ? "neutral" : "cyan"}>
              {(task.status ?? "open").replace("_", " ")}
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              <Clock className="h-3 w-3" />
              {formatDueDate(task.due_at)}
            </span>
            {reminderState ? (
              <Badge tone={reminderState === "Overdue" ? "amber" : reminderState === "Due soon" ? "violet" : "blue"}>
                {reminderState}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
