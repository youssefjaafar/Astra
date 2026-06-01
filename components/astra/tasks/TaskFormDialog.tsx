"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { taskCategories, taskFormSchema, taskPriorities, taskStatuses, type TaskFormInput } from "@/lib/validations/tasks";
import type { AstraTask } from "@/components/astra/tasks/task-utils";
import { cn } from "@/lib/utils";

type TaskFormDialogProps = {
  open: boolean;
  task: AstraTask | null;
  onClose: () => void;
  onSubmit: (values: TaskFormInput, task: AstraTask | null) => Promise<void>;
};

export function TaskFormDialog({ open, task, onClose, onSubmit }: TaskFormDialogProps) {
  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(task),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(task));
    }
  }, [form, open, task]);

  if (!open) return null;

  async function handleSubmit(values: TaskFormInput) {
    await onSubmit(values, task);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Mission Task</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{task ? "Edit Task" : "New Task"}</h2>
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea className="min-h-24" {...form.register("description")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={form.formState.errors.category?.message}>
              <Select {...form.register("category")}>
                {taskCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" error={form.formState.errors.priority?.message}>
              <Select {...form.register("priority")}>
                {taskPriorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status" error={form.formState.errors.status?.message}>
              <Select {...form.register("status")}>
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>{status.replace("_", " ")}</option>
                ))}
              </Select>
            </Field>
            <Field label="Due date/time" error={form.formState.errors.dueAt?.message}>
              <Input type="datetime-local" {...form.register("dueAt")} />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {error ? <p className="text-sm text-amber-200">{error}</p> : null}
    </label>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm capitalize text-slate-100 outline-none transition",
        "focus:border-cyan-300/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-cyan-300/20",
      )}
      {...props}
    />
  );
}

function getDefaultValues(task: AstraTask | null): TaskFormInput {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    category: task?.category ?? "personal",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "open",
    dueAt: task?.due_at ? toDateTimeLocal(task.due_at) : "",
  };
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
