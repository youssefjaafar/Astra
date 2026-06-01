import { BookOpen, Droplets, Flame, Heart, Moon, Sparkles } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { habitSignals } from "@/lib/mock-data";

const icons = [Droplets, BookOpen, Sparkles, Heart, Moon, Flame];

export default function HabitsPage() {
  return (
    <>
      <PageHeader
        description="Track the repeating signals that shape your day: water, reading, meditation, prayer, sleep, mood, and energy."
        eyebrow="Life Signals"
        signal="Supportive tracking"
        title="Habit Tracker"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habitSignals.map((signal, index) => (
          <MetricCard
            helper={`Target: ${signal.target}`}
            icon={icons[index]}
            key={signal.id}
            label={signal.label}
            progress={signal.progress}
            tone={signal.tone}
            value={signal.value}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionGrid description="A simple habit grid for consistency without pressure." title="Weekly Signal Grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayIndex) => (
            <div className="grid grid-cols-[44px_1fr] items-center gap-3" key={day}>
              <span className="text-sm text-slate-400">{day}</span>
              <div className="grid grid-cols-6 gap-2">
                {habitSignals.map((signal, signalIndex) => (
                  <div
                    className={
                      dayIndex + signalIndex < 8
                        ? "h-8 rounded-md border border-cyan-200/20 bg-cyan-200/15"
                        : "h-8 rounded-md border border-white/10 bg-white/[0.04]"
                    }
                    key={signal.id}
                    title={signal.label}
                  />
                ))}
              </div>
            </div>
          ))}
        </SectionGrid>

        <SectionGrid description="Mood and energy are signals, not verdicts." title="Mood and Energy">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <Badge tone="amber">Mood</Badge>
              <p className="mt-4 text-3xl font-semibold text-white">Calm</p>
              <p className="mt-2 text-sm text-slate-400">Steady, slightly tired, clear enough.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <Badge tone="emerald">Energy</Badge>
              <p className="mt-4 text-3xl font-semibold text-white">7/10</p>
              <p className="mt-2 text-sm text-slate-400">Best window is late morning.</p>
            </div>
          </div>
        </SectionGrid>
      </div>
    </>
  );
}
