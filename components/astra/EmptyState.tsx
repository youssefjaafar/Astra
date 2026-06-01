import { Orbit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/astra/GlassCard";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionLabel = "Log a signal" }: EmptyStateProps) {
  return (
    <GlassCard className="grid min-h-[340px] place-items-center p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/10 shadow-glow">
          <Orbit className="h-6 w-6 text-cyan-200" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        <Button className="mt-6" variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </GlassCard>
  );
}
