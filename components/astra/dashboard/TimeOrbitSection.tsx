"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { DashboardTimeCategory } from "@/lib/types";

export function TimeOrbitSection({ data }: { data: DashboardTimeCategory[] }) {
  const [mounted, setMounted] = useState(false);
  const hasData = data.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Time Orbit" subtitle="Today's time distribution across work, recovery, and drift." />
      <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="h-72 min-h-72">
          {mounted && hasData ? (
            <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={data}
                  dataKey="hours"
                  innerRadius={62}
                  nameKey="name"
                  outerRadius={104}
                  paddingAngle={3}
                  stroke="rgba(255,255,255,0.12)"
                >
                  {data.map((entry) => (
                    <Cell fill={entry.fill} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.94)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) => [`${value}h`, "Time"]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-center">
              <p className="max-w-xs px-4 text-sm leading-6 text-slate-500">
                No Time Orbit blocks logged today. Add a time block or quick capture a signal to map the orbit.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {hasData ? data.map((item) => (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2" key={item.name}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="truncate text-sm text-slate-300">{item.name}</span>
              </div>
              <Badge tone="neutral">{item.hours}h</Badge>
            </div>
          )) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-500 sm:col-span-2">
              Waiting for today&apos;s tracked time signal.
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
