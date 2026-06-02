"use client";

import { motion } from "framer-motion";

import { EmptyState, SectionHeader } from "@/components/astra";
import { HabitCard } from "@/components/astra/habits/HabitCard";
import type { HabitWithProgress } from "@/components/astra/habits/habit-utils";

type HabitGridProps = {
  habits: HabitWithProgress[];
  onComplete: (habit: HabitWithProgress) => Promise<void>;
  onLog: (habit: HabitWithProgress) => void;
  onEdit: (habit: HabitWithProgress) => void;
  onNewHabit: () => void;
};

export function HabitGrid({ habits, onComplete, onLog, onEdit, onNewHabit }: HabitGridProps) {
  if (habits.length === 0) {
    return (
      <button className="block w-full text-left" onClick={onNewHabit} type="button">
        <EmptyState
          title="No systems configured yet. Start with one small signal."
          description="Add hydration, reading, prayer, meditation, focus, or any custom system you want Astra to track."
          actionLabel="New Habit"
        />
      </button>
    );
  }

  return (
    <section>
      <SectionHeader title="Daily Habit Grid" subtitle="Life systems for today, shown as calm signals." />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((habit, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            key={habit.id}
            transition={{ delay: index * 0.03, duration: 0.25 }}
          >
            <HabitCard habit={habit} onComplete={onComplete} onEdit={onEdit} onLog={onLog} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
