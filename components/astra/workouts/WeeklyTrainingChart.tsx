"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { GlassCard, SectionHeader } from "@/components/astra";
import { SafeResponsiveContainer } from "@/components/astra/charts/SafeResponsiveContainer";
import { getWeeklyTrainingChartData, type AstraWorkout } from "@/components/astra/workouts/workout-utils";

export function WeeklyTrainingChart({ workouts }: { workouts: AstraWorkout[] }) {
  const data = getWeeklyTrainingChartData(workouts);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Weekly Training Chart" subtitle="Training minutes by day in the current week." />
      <div className="mt-5 h-72 min-h-72 min-w-[1px]">
        <SafeResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis axisLine={false} dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
            <YAxis axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} width={34} />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.94)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [`${value} min`, "Training"]}
            />
            <Bar dataKey="minutes" fill="#67e8f9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </GlassCard>
  );
}
