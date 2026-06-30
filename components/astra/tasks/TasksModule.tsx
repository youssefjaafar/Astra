"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { QuickTaskInput } from "@/components/astra/tasks/QuickTaskInput";
import { TaskFilters } from "@/components/astra/tasks/TaskFilters";
import { TaskFormDialog } from "@/components/astra/tasks/TaskFormDialog";
import { TaskList } from "@/components/astra/tasks/TaskList";
import { TaskSummaryCards } from "@/components/astra/tasks/TaskSummaryCards";
import { applyTaskFilters, type AstraTask, type TaskFiltersState } from "@/components/astra/tasks/task-utils";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TaskFormInput } from "@/lib/validations/tasks";

type TasksModuleProps = {
  initialTasks: AstraTask[];
  initialError: string | null;
  userId: string;
};

const defaultFilters: TaskFiltersState = {
  status: "all",
  priority: "all",
  category: "all",
  due: "all",
  search: "",
};

export function TasksModule({ initialTasks, initialError, userId }: TasksModuleProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AstraTask | null>(null);
  const [error, setError] = useState(initialError);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const filteredTasks = useMemo(() => applyTaskFilters(tasks, filters), [filters, tasks]);

  function openNewTaskDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEditTaskDialog(task: AstraTask) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function createQuickTask(title: string) {
    setError(null);
    setLoadingMessage("Adding task...");
    const supabase = createSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title,
        category: "personal",
        priority: "medium",
        status: "open",
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTasks((current) => [data, ...current]);
  }

  async function saveTask(values: TaskFormInput, task: AstraTask | null) {
    setError(null);
    setLoadingMessage(task ? "Saving task..." : "Creating task...");
    const supabase = createSupabaseBrowserClient();
    const dueAt = values.dueAt ? new Date(values.dueAt).toISOString() : null;
    const completedAt = values.status === "completed" ? task?.completed_at ?? new Date().toISOString() : null;

    if (task) {
      const { data, error: updateError } = await supabase
        .from("tasks")
        .update({
          title: values.title,
          description: values.description?.trim() || null,
          category: values.category,
          priority: values.priority,
          status: values.status,
          due_at: dueAt,
          completed_at: completedAt,
        })
        .eq("id", task.id)
        .eq("user_id", userId)
        .select("*")
        .single();

      setLoadingMessage(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
      setDialogOpen(false);
      setEditingTask(null);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: values.title,
        description: values.description?.trim() || null,
        category: values.category,
        priority: values.priority,
        status: values.status,
        due_at: dueAt,
        completed_at: completedAt,
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTasks((current) => [data, ...current]);
    setDialogOpen(false);
  }

  async function toggleComplete(task: AstraTask) {
    setError(null);
    const complete = task.status === "completed";
    const nextStatus = complete ? "open" : "completed";
    const nextCompletedAt = complete ? null : new Date().toISOString();
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, status: nextStatus, completed_at: nextCompletedAt } : item,
      ),
    );

    const supabase = createSupabaseBrowserClient();
    const { data, error: updateError } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: nextCompletedAt,
      })
      .eq("id", task.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError) {
      setTasks(previousTasks);
      setError(updateError.message);
      return;
    }

    setTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
  }

  async function deleteTask(task: AstraTask) {
    if (!window.confirm(`Delete "${task.title}"? This removes the task signal from Astra.`)) return;

    setError(null);
    const previousTasks = tasks;
    setTasks((current) => current.filter((item) => item.id !== task.id));

    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id).eq("user_id", userId);

    if (deleteError) {
      setTasks(previousTasks);
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          title="Mission Tasks"
          subtitle="Organize what needs your attention without overloading your mind."
        />
        <Button onClick={openNewTaskDialog} type="button">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <QuickTaskInput onCreate={createQuickTask} />

      {error ? (
        <GlassCard className="border-amber-200/20 bg-amber-200/10 p-4">
          <p className="text-sm text-amber-100">{error}</p>
        </GlassCard>
      ) : null}

      {loadingMessage ? (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-400">{loadingMessage}</p>
        </GlassCard>
      ) : null}

      <TaskSummaryCards tasks={tasks} />
      <TaskFilters filters={filters} onChange={setFilters} />
      <TaskList
        onDelete={deleteTask}
        onEdit={openEditTaskDialog}
        onToggleComplete={toggleComplete}
        tasks={filteredTasks}
      />

      <TaskFormDialog
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={saveTask}
        open={dialogOpen}
        task={editingTask}
      />
    </div>
  );
}
