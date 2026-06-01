import { z } from "zod";

export const taskCategories = ["work", "personal", "health", "spiritual", "learning", "admin", "other"] as const;
export const taskPriorities = ["low", "medium", "high", "critical"] as const;
export const taskStatuses = ["open", "in_progress", "completed", "cancelled"] as const;
export const taskDueFilters = ["all", "today", "upcoming", "overdue", "no_due"] as const;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Add a task title.").max(160, "Keep the title under 160 characters."),
  description: z.string().max(1000, "Keep the description under 1000 characters.").optional(),
  category: z.enum(taskCategories),
  priority: z.enum(taskPriorities),
  status: z.enum(taskStatuses),
  dueAt: z.string().optional(),
});

export const quickTaskSchema = z.object({
  title: z.string().min(1, "Add a task to capture.").max(160, "Keep the task under 160 characters."),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type QuickTaskInput = z.infer<typeof quickTaskSchema>;
export type TaskCategory = (typeof taskCategories)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type TaskDueFilter = (typeof taskDueFilters)[number];
