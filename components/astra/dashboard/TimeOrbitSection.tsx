"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import type { DashboardTimeCategory } from "@/lib/types";

export function TimeOrbitSection({ data }: { data: DashboardTimeCategory[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Time Orbit" subtitle="Today's time distribution across work, recovery, and drift." />
      <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="h-72 min-h-72">
          {mounted ? (
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
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {data.map((item) => (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2" key={item.name}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="truncate text-sm text-slate-300">{item.name}</span>
              </div>
              <Badge tone="neutral">{item.hours}h</Badge>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
