import Link from "next/link";
import { Compass } from "lucide-react";

import { GlassCard } from "@/components/astra";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <GlassCard className="w-full max-w-xl p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
          <Compass className="h-5 w-5 text-cyan-100" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">Signal not found.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          That route is outside the current mission map. Return to Command Center to continue.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Return to Command Center</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
