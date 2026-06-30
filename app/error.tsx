"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <GlassCard className="w-full max-w-xl p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/10">
          <AlertTriangle className="h-5 w-5 text-amber-100" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">Astra hit a temporary systems fault.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The cockpit is still intact. Retry the panel, and if it keeps happening, check Supabase and environment configuration.
        </p>
        <Button className="mt-6" onClick={reset} type="button">
          <RotateCcw className="h-4 w-4" />
          Retry Panel
        </Button>
      </GlassCard>
    </div>
  );
}
