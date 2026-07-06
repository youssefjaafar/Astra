"use client";

import { AlertCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { QuickWorkoutButtons, type QuickWorkoutOption } from "@/components/astra/workouts/QuickWorkoutButtons";
import { RecoveryNote } from "@/components/astra/workouts/RecoveryNote";
import { TrainingConsistencyPanel } from "@/components/astra/workouts/TrainingConsistencyPanel";
import { TrainingSummaryCards } from "@/components/astra/workouts/TrainingSummaryCards";
import { WeeklyTrainingChart } from "@/components/astra/workouts/WeeklyTrainingChart";
import { WorkoutFormDialog } from "@/components/astra/workouts/WorkoutFormDialog";
import { WorkoutHistory } from "@/components/astra/workouts/WorkoutHistory";
import { sortWorkoutsByTime, type AstraWorkout } from "@/components/astra/workouts/workout-utils";
import { Button } from "@/components/ui/button";
import { createBrowserDbClient } from "@/lib/db/client";
import type { WorkoutFormInput } from "@/lib/validations/workouts";

type WorkoutsModuleProps = {
  initialWorkouts: AstraWorkout[];
  initialWeeklyTarget: number;
  initialError: string | null;
  userId: string;
};

export function WorkoutsModule({ initialWorkouts, initialWeeklyTarget, initialError, userId }: WorkoutsModuleProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [workouts, setWorkouts] = useState(() => sortWorkoutsByTime(initialWorkouts));
  const [weeklyTarget] = useState(initialWeeklyTarget);
  const [error, setError] = useState<string | null>(initialError);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<AstraWorkout | null>(null);

  function openNewWorkout() {
    setEditingWorkout(null);
    setDialogOpen(true);
  }

  function openEditWorkout(workout: AstraWorkout) {
    setEditingWorkout(workout);
    setDialogOpen(true);
  }

  async function saveWorkout(values: WorkoutFormInput, workout: AstraWorkout | null) {
    setError(null);
    setLoadingMessage(workout ? "Saving training signal..." : "Logging training signal...");

    const payload = normalizeWorkout(values);

    if (workout) {
      const { data, error: updateError } = await supabase
        .from("workouts")
        .update(payload)
        .eq("id", workout.id)
        .eq("user_id", userId)
        .select("*")
        .single();
      setLoadingMessage(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setWorkouts((current) => sortWorkoutsByTime(current.map((item) => (item.id === data.id ? data : item))));
      setDialogOpen(false);
      setEditingWorkout(null);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("workouts")
      .insert({
        ...payload,
        user_id: userId,
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setWorkouts((current) => sortWorkoutsByTime([data, ...current]));
    setDialogOpen(false);
  }

  async function quickLogWorkout(option: QuickWorkoutOption) {
    setError(null);
    setLoadingMessage("Logging quick training signal...");

    const { data, error: insertError } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        title: option.title,
        workout_type: option.workoutType,
        duration_minutes: option.durationMinutes,
        intensity: option.intensity,
        logged_at: new Date().toISOString(),
        notes: null,
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setWorkouts((current) => sortWorkoutsByTime([data, ...current]));
  }

  async function deleteWorkout(workout: AstraWorkout) {
    if (!window.confirm(`Delete "${workout.title}"? This removes the training signal from Astra.`)) return;

    setError(null);
    const previousWorkouts = workouts;
    setWorkouts((current) => current.filter((item) => item.id !== workout.id));

    const { error: deleteError } = await supabase.from("workouts").delete().eq("id", workout.id).eq("user_id", userId);

    if (deleteError) {
      setWorkouts(previousWorkouts);
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          title="Training Log"
          subtitle="Track your physical signal, build consistency, and review your performance."
        />
        <Button className="w-full sm:w-fit" onClick={openNewWorkout} type="button">
          <Plus className="h-4 w-4" />
          Log Workout
        </Button>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      {loadingMessage ? (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-400">{loadingMessage}</p>
        </GlassCard>
      ) : null}

      <TrainingSummaryCards weeklyTarget={weeklyTarget} workouts={workouts} />

      <QuickWorkoutButtons onQuickLog={quickLogWorkout} />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <WeeklyTrainingChart workouts={workouts} />
        <div className="space-y-4">
          <TrainingConsistencyPanel weeklyTarget={weeklyTarget} workouts={workouts} />
          <RecoveryNote />
        </div>
      </div>

      <WorkoutHistory onDelete={deleteWorkout} onEdit={openEditWorkout} onNewWorkout={openNewWorkout} workouts={workouts} />

      <WorkoutFormDialog
        onClose={() => {
          setDialogOpen(false);
          setEditingWorkout(null);
        }}
        onSubmit={saveWorkout}
        open={dialogOpen}
        workout={editingWorkout}
      />
    </div>
  );
}

function normalizeWorkout(values: WorkoutFormInput) {
  return {
    title: values.title.trim(),
    workout_type: values.workoutType,
    duration_minutes: values.durationMinutes,
    intensity: values.intensity,
    logged_at: values.loggedAt ? new Date(values.loggedAt).toISOString() : new Date().toISOString(),
    notes: values.notes?.trim() || null,
  };
}
