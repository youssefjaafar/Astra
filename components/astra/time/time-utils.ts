import type { Database } from "@/lib/types/database";
import type { TimeCategory } from "@/lib/validations/time";

export type AstraTimeBlock = Database["public"]["Tables"]["time_blocks"]["Row"];

export const categoryLabels: Record<TimeCategory, string> = {
  work: "Work",
  deep_work: "Deep Work",
  admin: "Admin",
  meals: "Meals",
  training: "Training",
  reading: "Reading",
  prayer_meditation: "Prayer/Meditation",
  social: "Social",
  scrolling: "Scrolling",
  rest: "Rest",
  sleep: "Sleep",
  commute: "Commute",
  other: "Other",
};

export const categoryColors: Record<TimeCategory, string> = {
  work: "#7dd3fc",
  deep_work: "#67e8f9",
  admin: "#93c5fd",
  meals: "#c4b5fd",
  training: "#a78bfa",
  reading: "#818cf8",
  prayer_meditation: "#5eead4",
  social: "#60a5fa",
  scrolling: "#fbbf24",
  rest: "#94a3b8",
  sleep: "#38bdf8",
  commute: "#22d3ee",
  other: "#cbd5e1",
};

export function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function getBlockDuration(block: AstraTimeBlock) {
  if (block.duration_minutes) return block.duration_minutes;
  if (block.start_time && block.end_time) {
    return Math.max(0, Math.round((new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) / 60000));
  }
  return 0;
}

export function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining}m`;
  if (!remaining) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function formatTimeRange(block: AstraTimeBlock) {
  const start = block.start_time ? formatClock(block.start_time) : null;
  const end = block.end_time ? formatClock(block.end_time) : null;
  if (start && end) return `${start} - ${end}`;
  if (start) return `Started ${start}`;
  return formatMinutes(getBlockDuration(block));
}

export function formatClock(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function getTodayBlocks(blocks: AstraTimeBlock[]) {
  return blocks.filter((block) => isToday(block.start_time ?? block.created_at));
}

export function getTimeSummary(blocks: AstraTimeBlock[]) {
  const total = sumBy(blocks);
  const deepWork = sumByCategory(blocks, ["deep_work"]);
  const scrolling = sumByCategory(blocks, ["scrolling", "social"]);
  const training = sumByCategory(blocks, ["training", "rest"]);
  const reading = sumByCategory(blocks, ["reading"]);
  const prayerMeditation = sumByCategory(blocks, ["prayer_meditation"]);

  return { total, deepWork, scrolling, training, reading, prayerMeditation };
}

export function getDistribution(blocks: AstraTimeBlock[]) {
  const grouped = blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.category] = (acc[block.category] ?? 0) + getBlockDuration(block);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, minutes]) => ({
      category: category as TimeCategory,
      name: categoryLabels[category as TimeCategory],
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
      fill: categoryColors[category as TimeCategory],
    }))
    .filter((item) => item.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

export function getTimeInsights(blocks: AstraTimeBlock[]) {
  const distribution = getDistribution(blocks);
  const mostUsed = distribution[0]?.name ?? "No signal yet";
  const distraction = sumByCategory(blocks, ["scrolling", "social"]);
  const focus = sumByCategory(blocks, ["deep_work", "work"]);
  const ratio = distraction > 0 ? `${(focus / distraction).toFixed(1)}:1` : focus > 0 ? "Protected" : "Pending";
  const total = sumBy(blocks);
  const untracked = Math.max(0, 24 * 60 - total);

  return {
    mostUsed,
    distraction,
    ratio,
    untracked,
  };
}

export function sortChronological(blocks: AstraTimeBlock[]) {
  return [...blocks].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

function sumBy(blocks: AstraTimeBlock[]) {
  return blocks.reduce((sum, block) => sum + getBlockDuration(block), 0);
}

function sumByCategory(blocks: AstraTimeBlock[], categories: TimeCategory[]) {
  return blocks.filter((block) => categories.includes(block.category)).reduce((sum, block) => sum + getBlockDuration(block), 0);
}
