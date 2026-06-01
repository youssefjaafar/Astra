import Link from "next/link";
import { ArrowRight, Orbit, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/astra/GlassCard";
import { MotionPanel } from "@/components/motion-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
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
          <Badge tone="cyan">Astra Online</Badge>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <MotionPanel>
            <div className="max-w-3xl">
              <Badge tone="violet">Calm cockpit for life</Badge>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                Your life, brought into orbit.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Astra is a calm mission-control system for tracking your time, habits, health, focus, and personal growth.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 px-5">
                  <Link href="/dashboard">
                    Enter Command Center
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="h-12 px-5" variant="secondary">
                  <Link href="/ai">Try Quick Capture</Link>
                </Button>
              </div>
            </div>
          </MotionPanel>

          <MotionPanel delay={0.15}>
            <GlassCard glow className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Command Center Preview</p>
                  <p className="mt-1 text-xs text-slate-500">Today&apos;s mission signal</p>
                </div>
                <Sparkles className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Day", "68%"],
                  ["Focus", "4.2h"],
                  ["Water", "1.8L"],
                  ["Energy", "7/10"],
                ].map(([label, value]) => (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4">
                <p className="text-sm leading-6 text-slate-200">
                  Capture what happened. Guide the day. Review the signal. Improve tomorrow.
                </p>
              </div>
            </GlassCard>
          </MotionPanel>
        </section>
      </div>
    </main>
  );
}
