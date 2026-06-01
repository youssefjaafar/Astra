import { Search } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { Input } from "@/components/ui/input";
import { taskCategories, taskDueFilters, taskPriorities, taskStatuses } from "@/lib/validations/tasks";
import type { TaskFiltersState } from "@/components/astra/tasks/task-utils";
import { cn } from "@/lib/utils";

type TaskFiltersProps = {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
};

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <GlassCard className="p-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            className="pl-9"
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search by title..."
            value={filters.search}
          />
        </label>
        <FilterSelect label="Status" value={filters.status} onChange={(value) => onChange({ ...filters, status: value as TaskFiltersState["status"] })}>
          <option value="all">All statuses</option>
          {taskStatuses.map((status) => (
            <option key={status} value={status}>{status.replace("_", " ")}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Priority" value={filters.priority} onChange={(value) => onChange({ ...filters, priority: value as TaskFiltersState["priority"] })}>
          <option value="all">All priorities</option>
          {taskPriorities.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Category" value={filters.category} onChange={(value) => onChange({ ...filters, category: value as TaskFiltersState["category"] })}>
          <option value="all">All categories</option>
          {taskCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Due date" value={filters.due} onChange={(value) => onChange({ ...filters, due: value as TaskFiltersState["due"] })}>
          {taskDueFilters.map((due) => (
            <option key={due} value={due}>{due.replace("_", " ")}</option>
          ))}
        </FilterSelect>
      </div>
    </GlassCard>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="sr-only">{label}</span>
      <select
        className={cn(
          "h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm capitalize text-slate-100 outline-none transition",
          "focus:border-cyan-300/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-cyan-300/20",
        )}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}
