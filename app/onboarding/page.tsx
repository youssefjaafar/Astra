import { Orbit } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 shadow-glow">
            <Orbit className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">Astra</p>
            <p className="text-xs text-slate-500">Onboarding sequence</p>
          </div>
        </div>

        <GlassCard glow className="p-5 sm:p-6">
          <Badge tone="violet">Calibration</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Tune your life systems</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Set the first targets Astra should use to keep your days calm, practical, and honest.
          </p>
          <div className="mt-7">
            <OnboardingForm />
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
