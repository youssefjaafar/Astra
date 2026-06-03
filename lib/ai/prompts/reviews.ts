import type { AiDailySummary, AiWeeklyReport } from "@/lib/validations/reviews";

export function formatDailySummary(summary: AiDailySummary) {
  return [
    "3 things that went well:",
    ...summary.went_well.map((item) => `- ${item}`),
    "",
    "2 patterns noticed:",
    ...summary.patterns.map((item) => `- ${item}`),
    "",
    `Course correction: ${summary.course_correction}`,
  ].join("\n");
}

export function formatWeeklyReport(report: AiWeeklyReport) {
  return [
    `Weekly summary: ${report.weekly_summary}`,
    "",
    "Wins:",
    ...report.wins.map((item) => `- ${item}`),
    "",
    "Struggles:",
    ...report.struggles.map((item) => `- ${item}`),
    "",
    "Patterns:",
    ...report.patterns.map((item) => `- ${item}`),
    "",
    `Best signal of the week: ${report.best_signal_of_the_week}`,
    `Biggest energy drain: ${report.biggest_energy_drain}`,
    "",
    "Suggested course corrections:",
    ...report.suggested_course_corrections.map((item) => `- ${item}`),
    "",
    `One small commitment for tomorrow: ${report.one_small_commitment_for_tomorrow}`,
  ].join("\n");
}

export function buildDailyReviewMessages(context: unknown) {
  return [
    {
      role: "system" as const,
      content:
        "You are Astra's AI Copilot. Generate a calm, honest, supportive daily debrief. No shame, no medical advice, concise and practical. Return only valid JSON.",
    },
    {
      role: "user" as const,
      content: `Review this day and return JSON with keys: went_well (3 strings), patterns (2 strings), course_correction (string). Context:\n${JSON.stringify(context)}`,
    },
  ];
}

export function buildWeeklyReportMessages(context: unknown) {
  return [
    {
      role: "system" as const,
      content:
        "You are Astra's AI Copilot. Generate a concise weekly mission report with supportive honesty. No shame, no medical advice, practical course corrections. Return only valid JSON.",
    },
    {
      role: "user" as const,
      content:
        "Return JSON with keys: weekly_summary, wins, struggles, patterns, best_signal_of_the_week, biggest_energy_drain, suggested_course_corrections, one_small_commitment_for_tomorrow. Context:\n" +
        JSON.stringify(context),
    },
  ];
}
