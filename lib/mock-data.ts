import type { HabitSignal, NavItem, ReviewPrompt, Task, TimeBlock } from "@/lib/types";

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Command Center", description: "Today at a glance" },
  { href: "/tasks", label: "Today's Mission", description: "Tasks and reminders" },
  { href: "/habits", label: "Life Signals", description: "Habits and rhythms" },
  { href: "/time", label: "Time Orbit", description: "Focus and screen time" },
  { href: "/meals", label: "Nutrition Module", description: "Meals and hydration" },
  { href: "/workouts", label: "Training Log", description: "Plans and history" },
  { href: "/reviews", label: "Daily Debrief", description: "Daily and weekly reviews" },
  { href: "/ai", label: "AI Copilot", description: "Capture and course correction" },
  { href: "/settings", label: "Settings", description: "Preferences and data" },
];

export const missionTasks: Task[] = [
  {
    id: "t1",
    title: "Deep work block for Astra product architecture",
    area: "Work",
    priority: "High",
    due: "09:30",
    complete: false,
  },
  {
    id: "t2",
    title: "Read 20 pages before evening review",
    area: "Personal",
    priority: "Medium",
    due: "18:30",
    complete: false,
  },
  {
    id: "t3",
    title: "Call Alex",
    area: "Reminder",
    priority: "Medium",
    due: "15:00",
    complete: true,
  },
  {
    id: "t4",
    title: "Prep tomorrow's meals",
    area: "Personal",
    priority: "Low",
    due: "20:00",
    complete: false,
  },
];

export const habitSignals: HabitSignal[] = [
  { id: "water", label: "Hydration System", value: "1.8L", target: "3.0L", progress: 60, tone: "cyan" },
  { id: "reading", label: "Reading Signal", value: "12 pages", target: "20 pages", progress: 60, tone: "blue" },
  { id: "meditation", label: "Mindfulness", value: "8 min", target: "10 min", progress: 80, tone: "violet" },
  { id: "prayer", label: "Spiritual Anchor", value: "2/3", target: "3 anchors", progress: 67, tone: "indigo" },
  { id: "sleep", label: "Sleep", value: "7h 10m", target: "7h 30m", progress: 95, tone: "emerald" },
  { id: "energy", label: "Energy", value: "7/10", target: "steady", progress: 70, tone: "amber" },
];

export const timeOrbit: TimeBlock[] = [
  { label: "Focused Work", hours: 4.2, fill: "#67e8f9" },
  { label: "Admin", hours: 1.1, fill: "#93c5fd" },
  { label: "Training", hours: 0.8, fill: "#a78bfa" },
  { label: "Reading", hours: 0.4, fill: "#818cf8" },
  { label: "Manual Screen Time", hours: 2.0, fill: "#fbbf24" },
];

export const mealHistory = [
  { meal: "Breakfast", entry: "Greek yogurt, berries, oats", protein: "32g", status: "Logged" },
  { meal: "Lunch", entry: "Chicken bowl with greens", protein: "46g", status: "Planned" },
  { meal: "Dinner", entry: "Salmon, rice, vegetables", protein: "40g", status: "Planned" },
];

export const workoutHistory = [
  { day: "Mon", plan: "Chest and triceps", duration: "45 min", status: "Complete" },
  { day: "Wed", plan: "Back and biceps", duration: "50 min", status: "Queued" },
  { day: "Fri", plan: "Legs and core", duration: "55 min", status: "Queued" },
];

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
