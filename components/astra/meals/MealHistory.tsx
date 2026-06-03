"use client";

import { motion } from "framer-motion";

import { EmptyState, SectionHeader } from "@/components/astra";
import { MealCard } from "@/components/astra/meals/MealCard";
import { sortMealsByTime, type AstraMeal } from "@/components/astra/meals/nutrition-utils";

type MealHistoryProps = {
  meals: AstraMeal[];
  onEdit: (meal: AstraMeal) => void;
  onDelete: (meal: AstraMeal) => Promise<void>;
  onNewMeal: () => void;
};

export function MealHistory({ meals, onEdit, onDelete, onNewMeal }: MealHistoryProps) {
  const sortedMeals = sortMealsByTime(meals);

  if (sortedMeals.length === 0) {
    return (
      <EmptyState
        actionLabel="Log Meal"
        description="No fuel signals logged yet. Start with your next meal."
        onAction={onNewMeal}
        title="No fuel signals logged yet."
      />
    );
  }

  return (
    <section>
      <SectionHeader title="Meal History" subtitle="Today's fuel signals in chronological orbit." />
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {sortedMeals.map((meal, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            key={meal.id}
            transition={{ delay: index * 0.03, duration: 0.25 }}
          >
            <MealCard meal={meal} onDelete={onDelete} onEdit={onEdit} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
