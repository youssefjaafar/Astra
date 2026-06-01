import type { Database } from "@/lib/types/database";
import type { TaskCategory, TaskDueFilter, TaskPriority, TaskStatus } from "@/lib/validations/tasks";

export type AstraTask = Database["public"]["Tables"]["tasks"]["Row"];

export type TaskFiltersState = {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  category: TaskCategory | "all";
  due: TaskDueFilter;
  search: string;
};

export type TaskGroup = {
  title: string;
  tasks: AstraTask[];
};

export function getTaskGroups(tasks: AstraTask[]): TaskGroup[] {
  const active = tasks.filter((task) => task.status !== "completed");

  return [
    {
      title: "Today",
      tasks: active.filter((task) => isDueToday(task.due_at)),
    },
    {
      title: "Upcoming",
      tasks: active.filter((task) => Boolean(task.due_at) && !isDueToday(task.due_at) && !isOverdue(task.due_at)),
    },
    {
      title: "No due date",
      tasks: active.filter((task) => !task.due_at),
    },
    {
      title: "Completed",
      tasks: tasks.filter((task) => task.status === "completed"),
    },
  ];
}

export function applyTaskFilters(tasks: AstraTask[], filters: TaskFiltersState) {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.category !== "all" && task.category !== filters.category) return false;
    if (search && !task.title.toLowerCase().includes(search)) return false;

    if (filters.due === "today" && !isDueToday(task.due_at)) return false;
    if (filters.due === "upcoming" && (!task.due_at || isDueToday(task.due_at) || isOverdue(task.due_at))) return false;
    if (filters.due === "overdue" && !isOverdue(task.due_at)) return false;
    if (filters.due === "no_due" && task.due_at) return false;

    return true;
  });
}

export function getReminderState(dueAt: string | null) {
  if (!dueAt) return null;
  if (isOverdue(dueAt)) return "Overdue";
  if (isDueSoon(dueAt)) return "Due soon";
  return "Reminder active";
}

export function formatDueDate(dueAt: string | null) {
  if (!dueAt) return "No due date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dueAt));
}

export function isDueToday(dueAt: string | null) {
  if (!dueAt) return false;
  const due = new Date(dueAt);
  const now = new Date();

  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate();
}

export function isOverdue(dueAt: string | null) {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now();
}

export function isDueSoon(dueAt: string | null) {
  if (!dueAt || isOverdue(dueAt)) return false;
  const dueTime = new Date(dueAt).getTime();
  const now = Date.now();
  return dueTime - now <= 1000 * 60 * 60 * 24;
}

export function getTaskSummary(tasks: AstraTask[]) {
  const weekStart = startOfWeek(new Date());

  return {
    open: tasks.filter((task) => task.status === "open" || task.status === "in_progress").length,
    dueToday: tasks.filter((task) => task.status !== "completed" && isDueToday(task.due_at)).length,
    highPriority: tasks.filter((task) => task.status !== "completed" && (task.priority === "high" || task.priority === "critical")).length,
    completedThisWeek: tasks.filter((task) => {
      if (!task.completed_at) return false;
      return new Date(task.completed_at).getTime() >= weekStart.getTime();
    }).length,
  };
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}
