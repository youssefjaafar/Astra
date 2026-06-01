"use client";

import { motion } from "framer-motion";

import { EmptyState, GlassCard, SectionHeader } from "@/components/astra";
import { TaskCard } from "@/components/astra/tasks/TaskCard";
import { getTaskGroups, type AstraTask } from "@/components/astra/tasks/task-utils";

type TaskListProps = {
  tasks: AstraTask[];
  onToggleComplete: (task: AstraTask) => Promise<void>;
  onEdit: (task: AstraTask) => void;
  onDelete: (task: AstraTask) => Promise<void>;
};

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No active mission tasks. Your cockpit is clear."
        description="Capture the next useful signal when something needs your attention."
        actionLabel="New Task"
      />
    );
  }

  const groups = getTaskGroups(tasks);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <GlassCard className="p-5" key={group.title}>
          <SectionHeader title={group.title} subtitle={`${group.tasks.length} task${group.tasks.length === 1 ? "" : "s"}`} />
          <div className="mt-4 space-y-3">
            {group.tasks.length > 0 ? (
              group.tasks.map((task, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={task.id}
                  transition={{ delay: index * 0.025, duration: 0.25 }}
                >
                  <TaskCard
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleComplete={onToggleComplete}
                    task={task}
                  />
                </motion.div>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                No signals in this orbit.
              </p>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
