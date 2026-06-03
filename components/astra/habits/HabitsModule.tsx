"use client";

import { AlertCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { HabitFormDialog } from "@/components/astra/habits/HabitFormDialog";
import { HabitGrid } from "@/components/astra/habits/HabitGrid";
import { HabitHistory } from "@/components/astra/habits/HabitHistory";
import { HabitLogDialog } from "@/components/astra/habits/HabitLogDialog";
import { MeditationQuickLog } from "@/components/astra/habits/MeditationQuickLog";
import { ReadingQuickLog } from "@/components/astra/habits/ReadingQuickLog";
import { SpiritualAnchor } from "@/components/astra/habits/SpiritualAnchor";
import { HabitSummaryCards } from "@/components/astra/habits/HabitSummaryCards";
import {
  withHabitProgress,
  type AstraHabit,
  type HabitLog,
  type HabitWithProgress,
  type PrayerLog,
} from "@/components/astra/habits/habit-utils";
import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { HabitFormInput, HabitLogInput } from "@/lib/validations/habits";

type HabitsModuleProps = {
  initialHabits: AstraHabit[];
  initialHabitLogs: HabitLog[];
  initialPrayerLogs: PrayerLog[];
  initialError: string | null;
  userId: string;
};

export function HabitsModule({ initialHabits, initialHabitLogs, initialPrayerLogs, initialError, userId }: HabitsModuleProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [habits, setHabits] = useState(initialHabits);
  const [habitLogs, setHabitLogs] = useState(initialHabitLogs);
  const [error, setError] = useState(initialError ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<AstraHabit | null>(null);
  const [loggingHabit, setLoggingHabit] = useState<HabitWithProgress | null>(null);

  const habitsWithProgress = useMemo(() => withHabitProgress(habits, habitLogs), [habits, habitLogs]);

  function openNewHabit() {
    setEditingHabit(null);
    setFormOpen(true);
  }

  function openEditHabit(habit: HabitWithProgress) {
    setEditingHabit(habit);
    setFormOpen(true);
  }

  async function saveHabit(values: HabitFormInput, habit: AstraHabit | null) {
    setError("");

    const payload = {
      user_id: userId,
      name: values.name.trim(),
      category: values.category,
      target_frequency: values.targetFrequency,
      target_value: values.targetValue ?? null,
      unit: values.unit?.trim() || null,
      is_active: values.isActive,
      updated_at: new Date().toISOString(),
    };

    if (habit) {
      const { data, error: updateError } = await supabase
        .from("habits")
        .update(payload)
        .eq("id", habit.id)
        .eq("user_id", userId)
        .select("*")
        .single();
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setHabits((current) => current.map((item) => (item.id === data.id ? data : item)));
      setFormOpen(false);
      return;
    }

    const { data, error: insertError } = await supabase.from("habits").insert(payload).select("*").single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setHabits((current) => [data, ...current]);
    setFormOpen(false);
  }

  async function completeHabit(habit: HabitWithProgress) {
    setError("");
    const remaining = Math.max(Number(habit.target_value ?? 1) - habit.todayValue, 1);
    await saveHabitLog(habit.id, remaining, null);
  }

  async function logHabit(habit: HabitWithProgress, values: HabitLogInput) {
    setError("");
    const saved = await saveHabitLog(habit.id, values.value, values.notes?.trim() || null);
    if (saved) setLoggingHabit(null);
  }

  async function saveHabitLog(habitId: string, value: number, notes: string | null) {
    const { data, error: insertError } = await supabase
      .from("habit_logs")
      .insert({
        habit_id: habitId,
        user_id: userId,
        value,
        notes,
        logged_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return false;
    }

    setHabitLogs((current) => [data, ...current]);
    return true;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          title="Systems & Habits"
          subtitle="Track the daily signals that shape your life trajectory."
        />
        <Button className="w-full sm:w-fit" onClick={openNewHabit} type="button">
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      <HabitSummaryCards habits={habitsWithProgress} />

      <HabitGrid
        habits={habitsWithProgress}
        onComplete={completeHabit}
        onEdit={openEditHabit}
        onLog={setLoggingHabit}
        onNewHabit={openNewHabit}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SpiritualAnchor initialPrayerLogs={initialPrayerLogs} onError={setError} userId={userId} />
        <MeditationQuickLog onError={setError} userId={userId} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ReadingQuickLog onError={setError} userId={userId} />
        <HabitHistory habits={habits} logs={habitLogs} />
      </div>

      <HabitFormDialog habit={editingHabit} onClose={() => setFormOpen(false)} onSubmit={saveHabit} open={formOpen} />
      <HabitLogDialog habit={loggingHabit} onClose={() => setLoggingHabit(null)} onSubmit={logHabit} open={Boolean(loggingHabit)} />
    </div>
  );
}
