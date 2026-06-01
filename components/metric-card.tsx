import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SignalTone } from "@/lib/types";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  progress: number;
  tone?: SignalTone;
};

export function MetricCard({ icon: Icon, label, value, helper, progress, tone = "cyan" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/8">
            <Icon className="h-5 w-5 text-cyan-200" />
          </div>
        </div>
        <Progress className="mt-5" tone={tone} value={progress} />
        <p className="mt-3 text-xs text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}
