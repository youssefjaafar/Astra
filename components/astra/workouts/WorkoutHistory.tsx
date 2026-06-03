"use client";

import { motion } from "framer-motion";

import { EmptyState, SectionHeader } from "@/components/astra";
import { WorkoutCard } from "@/components/astra/workouts/WorkoutCard";
import { getWorkoutGroups, type AstraWorkout } from "@/components/astra/workouts/workout-utils";

type WorkoutHistoryProps = {
  workouts: AstraWorkout[];
  onEdit: (workout: AstraWorkout) => void;
  onDelete: (workout: AstraWorkout) => Promise<void>;
  onNewWorkout: () => void;
};

export function WorkoutHistory({ workouts, onEdit, onDelete, onNewWorkout }: WorkoutHistoryProps) {
  if (workouts.length === 0) {
    return (
      <EmptyState
        actionLabel="Log Workout"
        description="No training signals logged yet. Start with one movement session."
        onAction={onNewWorkout}
        title="No training signals logged yet."
      />
    );
  }

  const groups = getWorkoutGroups(workouts);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.title}>
          <SectionHeader title={group.title} subtitle={`${group.workouts.length} signal${group.workouts.length === 1 ? "" : "s"}`} />
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {group.workouts.length > 0 ? (
              group.workouts.map((workout, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={workout.id}
                  transition={{ delay: index * 0.025, duration: 0.25 }}
                >
                  <WorkoutCard onDelete={onDelete} onEdit={onEdit} workout={workout} />
                </motion.div>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500 xl:col-span-2">
                No training signals in this orbit.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
