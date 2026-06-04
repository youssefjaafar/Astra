"use client";

import {
  BookOpen,
  Brain,
  Check,
  Droplets,
  Dumbbell,
  Edit3,
  Moon,
  Plus,
  Salad,
  ScrollText,
  Target,
} from "lucide-react";

import { GlassCard, ProgressRing } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatHabitProgress,
  getSupportiveMessage,
  type HabitWithProgress,
} from "@/components/astra/habits/habit-utils";
import type { HabitCategory } from "@/lib/validations/habits";

type HabitCardProps = {
  habit: HabitWithProgress;
  onComplete: (habit: HabitWithProgress) => Promise<void>;
  onLog: (habit: HabitWithProgress) => void;
  onEdit: (habit: HabitWithProgress) => void;
};

const icons: Record<HabitCategory, React.ElementType> = {
  hydration: Droplets,
  nutrition: Salad,
  training: Dumbbell,
  reading: BookOpen,
  prayer: ScrollText,
  meditation: Brain,
  sleep: Moon,
  focus: Target,
  custom: ActivityIcon,
};

function ActivityIcon(props: React.ComponentProps<typeof Target>) {
  return <Target {...props} />;
}

export function HabitCard({ habit, onComplete, onLog, onEdit }: HabitCardProps) {
  const Icon = icons[habit.category as HabitCategory] ?? Target;

  return (
    <GlassCard className="p-4" data-testid="habit-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
            <Icon className="h-5 w-5 text-cyan-200" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">{habit.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="neutral">{habit.category}</Badge>
            <Badge tone={habit.is_active ? "cyan" : "neutral"}>{habit.is_active ? "active" : "inactive"}</Badge>
          </div>
        </div>
        <ProgressRing label="today" size={82} tone={habit.complete ? "emerald" : "cyan"} value={habit.progress} />
      </div>

      <p className="mt-4 text-lg font-semibold text-white">{formatHabitProgress(habit)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{getSupportiveMessage(habit.category as HabitCategory, habit.complete)}</p>
      <p className="mt-3 text-xs text-slate-500">Streak: calibration pending</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button onClick={() => onComplete(habit)} size="sm" type="button" variant={habit.complete ? "secondary" : "default"}>
          <Check className="h-4 w-4" />
          Done
        </Button>
        <Button onClick={() => onLog(habit)} size="sm" type="button" variant="secondary">
          <Plus className="h-4 w-4" />
          Log
        </Button>
        <Button onClick={() => onEdit(habit)} size="sm" type="button" variant="ghost">
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </GlassCard>
  );
}
