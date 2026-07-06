import { NextResponse } from "next/server";
import { z } from "zod";

import { buildWeeklyReportMessages, formatWeeklyReport } from "@/lib/ai/prompts/reviews";
import { AiProviderError, generateJsonCompletion } from "@/lib/ai/provider";
import { fetchReviewSignals } from "@/lib/reviews/server";
import { createServerDbClient } from "@/lib/db/server";
import { aiWeeklyReportSchema, weeklyReportAiRequestSchema } from "@/lib/validations/reviews";
import {
  filterSignalsForDay,
  getDailySignalSummary,
  getScoreChartData,
  getWeekRange,
  getWeeklyHabitCompletionData,
  getWeeklyTimeDistribution,
  getWeeklyTrainingData,
  toDateString,
} from "@/components/astra/reviews/review-utils";

export async function POST(request: Request) {
  try {
    const body = weeklyReportAiRequestSchema.parse(await request.json());
    const supabase = await createServerDbClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { start, end, endExclusive } = getWeekRange(body.weekStart);
    const { signals, error: signalError } = await fetchReviewSignals(supabase, user.id, {
      start,
      endExclusive,
    });

    if (signalError) {
      return NextResponse.json({ error: signalError }, { status: 500 });
    }

    const { data: dailyReviews, error: reviewsError } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", user.id)
      .gte("review_date", body.weekStart)
      .lte("review_date", toDateString(end))
      .order("review_date", { ascending: true });

    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 });
    }

    const dailySignals = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateString = toDateString(date);

      return {
        date: dateString,
        summary: getDailySignalSummary(signals, dateString),
        rawSignalCounts: countDaySignals(signals, dateString),
      };
    });

    const aiResponse = await generateJsonCompletion({
      messages: buildWeeklyReportMessages({
        weekStart: body.weekStart,
        weekEnd: toDateString(end),
        dailyReviews,
        dailySignals,
        charts: {
          moodEnergyFocus: getScoreChartData(dailyReviews ?? [], body.weekStart),
          timeDistribution: getWeeklyTimeDistribution(signals, body.weekStart),
          habitCompletion: getWeeklyHabitCompletionData(signals, body.weekStart),
          trainingMinutes: getWeeklyTrainingData(signals, body.weekStart),
        },
      }),
      temperature: 0.2,
    });
    const parsed = aiWeeklyReportSchema.parse(aiResponse);
    const report = formatWeeklyReport(parsed);

    const { data, error: saveError } = await supabase
      .from("weekly_reviews")
      .upsert(
        {
          user_id: user.id,
          week_start: body.weekStart,
          week_end: toDateString(end),
          summary: parsed.weekly_summary,
          wins: parsed.wins.join("\n"),
          struggles: parsed.struggles.join("\n"),
          suggested_corrections: parsed.suggested_course_corrections.join("\n"),
          ai_report: report,
        },
        { onConflict: "user_id,week_start" },
      )
      .select("*")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ report, weeklyReview: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid weekly report request or AI response.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof AiProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Weekly report generation failed.",
      },
      { status: 500 },
    );
  }
}

function countDaySignals(signals: Parameters<typeof filterSignalsForDay>[0], dateString: string) {
  const day = filterSignalsForDay(signals, dateString);

  return {
    tasks: day.tasks.length,
    habitLogs: day.habitLogs.length,
    timeBlocks: day.timeBlocks.length,
    meals: day.meals.length,
    waterLogs: day.waterLogs.length,
    workouts: day.workouts.length,
    prayerLogs: day.prayerLogs.length,
    meditationLogs: day.meditationLogs.length,
    readingLogs: day.readingLogs.length,
  };
}
