import { Moon } from "lucide-react";

import { GlassCard } from "@/components/astra";

export function RecoveryNote() {
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-violet-300/20" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">Recovery Note</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Keep the system stable</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
          <Moon className="h-5 w-5 text-violet-200" />
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-300">
        Training matters, but recovery keeps the system stable. Track sleep and energy alongside workouts.
      </p>
    </GlassCard>
  );
}
