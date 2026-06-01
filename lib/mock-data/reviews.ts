import type { ReviewPrompt } from "@/lib/types";

export const reviewPrompts: ReviewPrompt[] = [
  { title: "What moved the mission forward?", prompt: "Capture the one action that created the most momentum." },
  { title: "Where did time drift?", prompt: "Note one pattern without blame, then choose a small correction." },
  { title: "What should tomorrow protect?", prompt: "Pick the focus block, meal, workout, or spiritual anchor that matters most." },
];

export const weeklySignals = [
  { label: "Focus consistency", value: "4 strong days", delta: "+1 from last week" },
  { label: "Training", value: "2 of 3 sessions", delta: "Course correction: schedule earlier" },
  { label: "Reading", value: "86 pages", delta: "+24 pages" },
  { label: "Screen time", value: "12h manual", delta: "-2h target next week" },
];
