"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlassCard, SectionHeader } from "@/components/astra";
import {
  getScoreChartData,
  getWeeklyHabitCompletionData,
  getWeeklyTimeDistribution,
  getWeeklyTrainingData,
  type DailyReview,
  type ReviewSignals,
} from "@/components/astra/reviews/review-utils";

type ReviewChartsProps = {
  reviews: DailyReview[];
  signals: ReviewSignals;
  weekStart: string;
};

const timeColors = ["#67e8f9", "#a78bfa", "#93c5fd", "#34d399", "#fbbf24", "#c4b5fd", "#7dd3fc"];

export function ReviewCharts({ reviews, signals, weekStart }: ReviewChartsProps) {
  const scores = getScoreChartData(reviews, weekStart);
  const timeDistribution = getWeeklyTimeDistribution(signals, weekStart);
  const habitCompletion = getWeeklyHabitCompletionData(signals, weekStart);
  const training = getWeeklyTrainingData(signals, weekStart);

  return (
    <section>
      <SectionHeader title="Life Signals" subtitle="Calm charts for the selected mission week." />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Mood / Energy / Focus" subtitle="Daily self-ratings over the week.">
          <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
            <LineChart data={scores}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis axisLine={false} dataKey="day" tick={tickStyle} tickLine={false} />
              <YAxis axisLine={false} domain={[0, 10]} tick={tickStyle} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line connectNulls dataKey="mood" dot={false} stroke="#67e8f9" strokeWidth={2} />
              <Line connectNulls dataKey="energy" dot={false} stroke="#a78bfa" strokeWidth={2} />
              <Line connectNulls dataKey="focus" dot={false} stroke="#93c5fd" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Distribution" subtitle="Tracked minutes by category.">
          {timeDistribution.length > 0 ? (
            <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
              <PieChart>
                <Pie data={timeDistribution} dataKey="minutes" innerRadius={54} nameKey="category" outerRadius={88} paddingAngle={3}>
                  {timeDistribution.map((entry, index) => (
                    <Cell fill={timeColors[index % timeColors.length]} key={entry.category} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} min`, formatCategory(String(name))]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartText text="No tracked time in this week." />
          )}
        </ChartCard>

        <ChartCard title="Habit Completion Rate" subtitle="Habit and prayer completion signals by day.">
          <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
            <BarChart data={habitCompletion}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis axisLine={false} dataKey="day" tick={tickStyle} tickLine={false} />
              <YAxis axisLine={false} allowDecimals={false} tick={tickStyle} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}`, "Completions"]} />
              <Bar dataKey="completions" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Training Minutes" subtitle="Workout duration by day.">
          <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
            <BarChart data={training}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis axisLine={false} dataKey="day" tick={tickStyle} tickLine={false} />
              <YAxis axisLine={false} tick={tickStyle} tickLine={false} width={34} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} min`, "Training"]} />
              <Bar dataKey="minutes" fill="#67e8f9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-5 h-72 min-h-72">{children}</div>
    </GlassCard>
  );
}

function EmptyChartText({ text }: { text: string }) {
  return <div className="grid h-full place-items-center text-sm text-slate-500">{text}</div>;
}

function formatCategory(category: string) {
  return category.replaceAll("_", " ");
}

const tickStyle = { fill: "#94a3b8", fontSize: 12 };

const tooltipStyle = {
  background: "rgba(15, 23, 42, 0.94)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e2e8f0",
};
