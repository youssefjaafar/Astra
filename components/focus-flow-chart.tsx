"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { day: "Mon", focus: 3.5, screen: 2.9 },
  { day: "Tue", focus: 4.2, screen: 2.4 },
  { day: "Wed", focus: 2.8, screen: 3.1 },
  { day: "Thu", focus: 4.8, screen: 1.8 },
  { day: "Fri", focus: 4.1, screen: 2.0 },
  { day: "Sat", focus: 1.6, screen: 2.7 },
  { day: "Sun", focus: 2.2, screen: 2.2 },
];

export function FocusFlowChart() {
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
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 12 }}>
          <defs>
            <linearGradient id="focus" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="screen" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis axisLine={false} dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          />
          <Area dataKey="focus" fill="url(#focus)" name="Focus hours" stroke="#67e8f9" strokeWidth={2} />
          <Area dataKey="screen" fill="url(#screen)" name="Manual screen time" stroke="#a78bfa" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
