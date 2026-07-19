import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Orbit,
  Radar,
  Repeat,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { GlassCard } from "@/components/astra/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Public, statically generated user guide. Like /demo, this page must never
// create a DB client, touch auth, or call /api/db or /api/ai/* — it is plain
// presentational content built from the constants below.

export const metadata: Metadata = {
  title: "Astra — User Guide",
  description:
    "What Astra can do: tasks, habits, time and sleep tracking, nutrition, workouts, daily reviews, and AI insights in one calm cockpit.",
};

type GuideSection = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
};

const guideSections: GuideSection[] = [
  {
    icon: LayoutDashboard,
    title: "Command Center",
    description: "One calm dashboard for the whole day — glance, decide, move on.",
    highlights: [
      "Day-completion ring and current focus state",
      "Today's mission: next event, main work task, main personal task",
      "Systems status grid: water, nutrition, training, reading, prayer, meditation, sleep, screen time",
      "Time orbit of today's logged blocks",
    ],
  },
  {
    icon: Zap,
    title: "Quick Capture",
    description: "Type life as it happens; Astra files it for you.",
    highlights: [
      "Natural language like “drank 500ml water” or “ran 5k this morning”",
      "AI parses your text into the right record — task, meal, workout, habit, time block",
      "You confirm before anything is applied",
    ],
  },
  {
    icon: ListChecks,
    title: "Mission Tasks",
    description: "A task system tuned for momentum, not management overhead.",
    highlights: [
      "Categories (work, personal, health, spiritual, learning…), priorities, statuses",
      "Due dates with reminder states and quick-add input",
      "Filters by title, status, priority, and category",
      "Stat cards: open, due today, high priority, completed this week",
    ],
  },
  {
    icon: Repeat,
    title: "Habits",
    description: "Small daily systems, tracked without guilt.",
    highlights: [
      "Custom habits with targets, units, and frequency",
      "One-tap quick logs for reading and meditation",
      "Optional prayer tracking you can switch on in settings",
      "History views to see the streak forming",
    ],
  },
  {
    icon: Timer,
    title: "Time Orbit",
    description: "Where your hours actually go — including sleep and scrolling.",
    highlights: [
      "Time blocks by category with a live active timer",
      "Daily timeline of everything you logged",
      "Sleep blocks double as sleep tracking; scrolling blocks double as screen time",
      "Quality scores and notes per block",
    ],
  },
  {
    icon: Utensils,
    title: "Meals & Hydration",
    description: "Fuel tracking that stays lightweight.",
    highlights: [
      "Meals with calories and protein / carbs / fat macros",
      "Macro distribution chart for the day",
      "Water logging with quick amounts, measured against your daily target",
    ],
  },
  {
    icon: Dumbbell,
    title: "Training",
    description: "Log the work, watch the weekly target fill.",
    highlights: [
      "Workouts by type (strength, cardio, judo, mobility, walking…) and intensity",
      "Duration tracking and quick workout buttons",
      "Weekly session target from your settings",
    ],
  },
  {
    icon: NotebookPen,
    title: "Daily & Weekly Reviews",
    description: "The debrief is where the signal comes from.",
    highlights: [
      "Daily debrief: mood, energy, and focus scores (1–10)",
      "Three journal prompts: what went well, what drained energy, what to improve",
      "AI daily summary: wins, patterns, one course correction",
      "Weekly mission report with struggles, patterns, and one small commitment for tomorrow",
    ],
  },
  {
    icon: BrainCircuit,
    title: "AI Copilot",
    description: "Ask questions over your own data, get calm answers.",
    highlights: [
      "Commands like “Summarize my week” or “Where is my energy going?”",
      "Answers grounded in your tasks, habits, meals, workouts, and reviews",
      "Save the good ones to your insight history",
    ],
  },
  {
    icon: Radar,
    title: "Signal Correlations",
    description: "What actually moves your mood, energy, and focus.",
    highlights: [
      "Astra computes real correlations from your logs — workout days vs. rest days, sleep, screen time, water, meditation",
      "The AI explains the patterns; it never invents the numbers",
      "Honest about thin data: sparse signals are flagged, not over-interpreted",
      "Unlocks after about a week of daily debriefs",
    ],
  },
  {
    icon: SlidersHorizontal,
    title: "Personalization",
    description: "Astra bends to your mission, not the other way around.",
    highlights: [
      "Main goal, wake and sleep times, daily targets for water, reading, meditation, workouts, screen time",
      "AI tone (calm, direct, strict, encouraging) and recommendation style",
      "Appearance settings stored on your device",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    description: "Your cockpit, your data.",
    highlights: [
      "Every record is scoped to your account — no shared data",
      "AI provider keys never reach your browser",
      "AI insights paraphrase your journals; they never quote them back verbatim",
      "The public demo is fully static: no account, no writes, no AI spend",
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 shadow-glow">
              <Orbit className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">Astra</p>
              <p className="text-xs text-slate-500">Personal mission-control</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild className="hidden sm:inline-flex" size="sm" variant="ghost">
              <Link href="/demo">Live demo</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <Badge tone="violet">User guide</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
            What Astra can do
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Astra brings your tasks, habits, time, meals, training, and reflections into one calm cockpit — then
            uses your own signals to show you what helps and what steers you off course.
          </p>
        </section>

        <section aria-label="Astra features" className="grid gap-4 md:grid-cols-2">
          {guideSections.map((section) => (
            <GlassCard className="p-5" key={section.title}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10">
                  <section.icon className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{section.title}</h2>
                  <p className="text-xs text-slate-400">{section.description}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {section.highlights.map((highlight) => (
                  <li className="flex gap-2 text-sm leading-6 text-slate-300" key={highlight}>
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200/60" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </section>

        <section className="py-12">
          <GlassCard glow className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Ready to see it in motion?</h2>
              <p className="mt-1 text-sm text-slate-300">
                Walk through the read-only demo with sample data, or launch your own cockpit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 px-5">
                <Link href="/demo">
                  Explore live demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="h-11 px-5" variant="secondary">
                <Link href="/signup">Create your cockpit</Link>
              </Button>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
