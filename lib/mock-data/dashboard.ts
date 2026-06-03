import type {
  DashboardCopilotInsight,
  DashboardMission,
  DashboardSystemStatus,
  DashboardTimeCategory,
  WeeklyMissionSnapshot,
} from "@/lib/types";

export const dashboardHero = {
  dayCompletion: 68,
  focusState: "Deep Work Orbit",
  statusLine: "All systems are ready for today's mission.",
};

export const dashboardMission: DashboardMission = {
  topPriorities: [
    "Complete the Astra dashboard foundation",
    "Protect the first deep work block",
    "Finish reading before evening debrief",
  ],
  nextEvent: {
    title: "Planning review",
    time: "11:30 AM",
    context: "15 minutes to align the afternoon",
  },
  mainWorkTask: "Ship the Command Center dashboard with clean reusable sections.",
  mainPersonalTask: "Train, hydrate, and keep the evening review light.",
  courseCorrection: "Delay the first screen-time check until after the morning routine.",
};

export const dashboardSystemStatuses: DashboardSystemStatus[] = [
  {
    id: "hydration",
    name: "Hydration",
    current: "1.2L",
    target: "2.5L",
    progress: 48,
    message: "Steady. Continue the flow.",
    tone: "cyan",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    current: "2 meals",
    target: "3 planned",
    progress: 67,
    message: "Good coverage. Keep dinner simple.",
    tone: "emerald",
  },
  {
    id: "training",
    name: "Training",
    current: "0/1",
    target: "Chest session",
    progress: 25,
    message: "Queued for the afternoon window.",
    tone: "violet",
  },
  {
    id: "reading",
    name: "Reading",
    current: "12 pages",
    target: "20 pages",
    progress: 60,
    message: "Close. Protect a quiet block.",
    tone: "blue",
  },
  {
    id: "prayer",
    name: "Prayer",
    current: "2/5",
    target: "5 anchors",
    progress: 40,
    message: "Return to the anchor gently.",
    tone: "indigo",
  },
  {
    id: "meditation",
    name: "Meditation",
    current: "10 min",
    target: "10 min",
    progress: 100,
    message: "Complete. Keep the signal calm.",
    tone: "cyan",
  },
  {
    id: "sleep",
    name: "Sleep",
    current: "7h 10m",
    target: "7h 30m",
    progress: 95,
    message: "Recovery is stable today.",
    tone: "emerald",
  },
  {
    id: "screen-time",
    name: "Screen Time",
    current: "1h 35m",
    target: "< 2h",
    progress: 79,
    message: "Still within orbit. Stay intentional.",
    tone: "amber",
  },
];

export const dashboardTimeDistribution: DashboardTimeCategory[] = [
  { name: "Work", hours: 3.2, fill: "#93c5fd" },
  { name: "Deep Work", hours: 2.4, fill: "#67e8f9" },
  { name: "Meals", hours: 1.1, fill: "#6ee7b7" },
  { name: "Training", hours: 0.8, fill: "#a78bfa" },
  { name: "Reading", hours: 0.5, fill: "#818cf8" },
  { name: "Prayer/Meditation", hours: 0.7, fill: "#c4b5fd" },
  { name: "Social", hours: 0.9, fill: "#f0abfc" },
  { name: "Scrolling", hours: 1.2, fill: "#fbbf24" },
  { name: "Sleep", hours: 7.2, fill: "#38bdf8" },
];

export const dashboardCopilotInsight: DashboardCopilotInsight = {
  title: "Morning signal protection",
  body: "Your focus tends to improve when your first screen-time check happens after your morning routine. Try protecting the first 45 minutes tomorrow.",
  confidence: 86,
  suggestedAction: "Set a no-scroll window until the first focus block begins.",
};

export const weeklyMissionSnapshot: WeeklyMissionSnapshot = {
  taskCompletion: "12/18",
  habitLogs: "41 logs",
  trainingSessions: "2 / 3",
  readingMinutes: "3h 20m",
  meditationMinutes: "50m",
  prayerCompletion: "27/35",
  hydrationAverage: "2.3L",
  distractionTime: "8h 45m",
};
