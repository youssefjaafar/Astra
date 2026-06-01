"use client";

import { useMemo } from "react";
import { Crosshair, Orbit, RadioTower, Signal } from "lucide-react";

import { GlassCard, ProgressRing } from "@/components/astra";
import { Badge } from "@/components/ui/badge";

type CommandCenterHeroProps = {
  dayCompletion: number;
  focusState: string;
  statusLine: string;
};

export function CommandCenterHero({ dayCompletion, focusState, statusLine }: CommandCenterHeroProps) {
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  return (
    <GlassCard glow className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute right-4 top-4 h-28 w-28 rounded-full border border-cyan-200/10 bg-cyan-200/5 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_300px] lg:items-center">
        <div>
          <Badge tone="cyan">
            <Signal className="mr-1 h-3 w-3" />
            Command Center
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Good morning, Commander
          </h1>
          <p className="mt-3 text-sm text-slate-400">{currentDate}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{statusLine}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Focus State</p>
              <p className="mt-2 text-lg font-semibold text-white">{focusState}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Day Completion</p>
              <p className="mt-2 text-lg font-semibold text-white">{dayCompletion}% complete</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid h-64 w-full max-w-[300px] place-items-center overflow-hidden rounded-xl border border-white/10 bg-slate-950/35">
          <div className="absolute h-56 w-56 rounded-full border border-cyan-200/12" />
          <div className="absolute h-40 w-40 rounded-full border border-violet-200/12" />
          <div className="absolute h-px w-56 animate-pulseLine bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
          <div className="absolute w-px h-56 animate-pulseLine bg-gradient-to-b from-transparent via-violet-200/20 to-transparent" />
          <div className="absolute h-56 w-56 animate-[spin_22s_linear_infinite] rounded-full border border-transparent border-t-cyan-200/30" />
          <div className="absolute h-32 w-32 rounded-full bg-cyan-200/5 blur-xl" />
          <ProgressRing className="relative z-10" label="day" size={138} tone="cyan" value={dayCompletion} />
          <div className="absolute right-7 top-7 grid h-10 w-10 place-items-center rounded-full border border-cyan-200/20 bg-cyan-200/10">
            <RadioTower className="h-4 w-4 text-cyan-100/80" />
          </div>
          <Crosshair className="absolute bottom-7 left-8 h-5 w-5 text-violet-200/60" />
          <Orbit className="absolute bottom-9 right-10 h-5 w-5 text-cyan-200/60" />
        </div>
      </div>
    </GlassCard>
  );
}
