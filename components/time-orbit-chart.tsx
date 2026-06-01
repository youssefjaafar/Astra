"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { timeOrbit } from "@/lib/mock-data";

export function TimeOrbitChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={timeOrbit}
            dataKey="hours"
            innerRadius={62}
            outerRadius={100}
            paddingAngle={4}
            stroke="rgba(255,255,255,0.12)"
          >
            {timeOrbit.map((entry) => (
              <Cell fill={entry.fill} key={entry.label} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value) => [`${value}h`, "Time"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
