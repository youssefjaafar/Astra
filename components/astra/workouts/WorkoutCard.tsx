"use client";

import { Dumbbell, Edit3, Trash2 } from "lucide-react";

import { GlassCard } from "@/components/astra";
import {
  formatMinutes,
  formatWorkoutDate,
  intensityLabels,
  workoutTypeLabels,
  type AstraWorkout,
} from "@/components/astra/workouts/workout-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type WorkoutCardProps = {
  workout: AstraWorkout;
  onEdit: (workout: AstraWorkout) => void;
  onDelete: (workout: AstraWorkout) => Promise<void>;
};

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  const type = workout.workout_type ?? "custom";

  return (
    <GlassCard className="p-4" data-testid="workout-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
              <Dumbbell className="h-4 w-4 text-cyan-200" />
            </div>
            <h3 className="truncate text-base font-semibold text-white">{workout.title}</h3>
            <Badge tone="cyan">{workoutTypeLabels[type]}</Badge>
            {workout.intensity ? <Badge tone={getIntensityTone(workout.intensity)}>{intensityLabels[workout.intensity]}</Badge> : null}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {formatMinutes(workout.duration_minutes)} · {formatWorkoutDate(workout.logged_at)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button aria-label={`Edit ${workout.title}`} onClick={() => onEdit(workout)} size="icon" type="button" variant="ghost">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button aria-label={`Delete ${workout.title}`} onClick={() => onDelete(workout)} size="icon" type="button" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {workout.notes ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{workout.notes}</p> : null}
    </GlassCard>
  );
}

function getIntensityTone(intensity: NonNullable<AstraWorkout["intensity"]>) {
  if (intensity === "high") return "violet";
  if (intensity === "medium") return "blue";
  return "emerald";
}
