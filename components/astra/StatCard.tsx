import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/astra/GlassCard";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  icon?: LucideIcon;
};

export function StatCard({ title, value, subtitle, trend, icon: Icon }: StatCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
        {Icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/8">
            <Icon className="h-5 w-5 text-cyan-200" />
          </div>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-4">
          <Badge tone="cyan">{trend}</Badge>
        </div>
      ) : null}
    </GlassCard>
  );
}
