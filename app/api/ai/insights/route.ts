import { NextResponse } from "next/server";
import { z } from "zod";

import { buildInsightEngineMessages } from "@/lib/ai/prompts/insights";
import { AiProviderError, generateJsonCompletion } from "@/lib/ai/provider";
import { MIN_REVIEW_DAYS_FOR_INSIGHTS } from "@/lib/insights/compute";
import { fetchInsightStats } from "@/lib/insights/server";
import type { FactorComparison, InsightDay } from "@/lib/insights/types";
import { addDaysInTimeZone, midnightInTimeZone } from "@/lib/dates";
import { createServerDbClient } from "@/lib/db/server";
import { aiInsightEngineSchema, insightEngineRequestSchema } from "@/lib/validations/insights";

const JOURNAL_EXCERPT_MAX_CHARS = 400;
const JOURNAL_MAX_DAYS = 14;

export async function POST(request: Request) {
  try {
    const supabase = await createServerDbClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = insightEngineRequestSchema.parse(await request.json().catch(() => ({})));

    const { stats, days, timeZone, preferences, error: signalError } = await fetchInsightStats(supabase, user.id, {
      windowDays: body.windowDays,
    });

    if (signalError) {
      return NextResponse.json({ error: signalError }, { status: 500 });
    }

    if (stats.coverage.reviewDays < MIN_REVIEW_DAYS_FOR_INSIGHTS) {
      return NextResponse.json(
        {
          error: `Astra needs at least ${MIN_REVIEW_DAYS_FOR_INSIGHTS} daily debriefs in this window to find honest patterns. You have ${stats.coverage.reviewDays} so far — keep logging and check back.`,
          coverage: stats.coverage,
        },
        { status: 422 },
      );
    }

    const comparisonsById = new Map(stats.comparisons.map((comparison) => [comparisonId(comparison), comparison]));

    const aiResponse = await generateJsonCompletion({
      messages: buildInsightEngineMessages({
        window: stats.window,
        coverage: stats.coverage,
        mainGoal: preferences?.main_goal ?? null,
        goals: stats.goals,
        comparisons: stats.comparisons.map((comparison) => ({ id: comparisonId(comparison), ...comparison })),
        journalEntries: recentJournalEntries(days),
      }),
      temperature: 0.3,
    });
    const parsed = aiInsightEngineSchema.parse(aiResponse);

    const relatedPeriodStart = midnightInTimeZone(stats.window.startDate, timeZone).toISOString();
    const relatedPeriodEnd = addDaysInTimeZone(
      midnightInTimeZone(stats.window.endDate, timeZone),
      1,
      timeZone,
    ).toISOString();

    // Rerunning the engine on the same day replaces that run instead of
    // stacking duplicates; a later day is a new window and keeps history.
    const { error: clearError } = await supabase
      .from("ai_insights")
      .delete()
      .eq("user_id", user.id)
      .eq("related_period_start", relatedPeriodStart)
      .eq("related_period_end", relatedPeriodEnd);

    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 });
    }

    const rows = parsed.insights.map((insight) => ({
      user_id: user.id,
      insight_type: insight.insight_type,
      title: insight.title,
      body: insight.body,
      confidence: insightConfidence(insight.supporting_comparison_ids, comparisonsById),
      suggested_action: insight.suggested_action,
      related_period_start: relatedPeriodStart,
      related_period_end: relatedPeriodEnd,
    }));

    const { data: saved, error: saveError } = await supabase.from("ai_insights").insert(rows).select("*");

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      insights: saved ?? [],
      dataNotes: parsed.data_notes ?? null,
      coverage: stats.coverage,
      window: stats.window,
      goals: stats.goals,
      comparisons: stats.comparisons,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid insight request or AI response.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof AiProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Insight generation failed.",
      },
      { status: 500 },
    );
  }
}

function comparisonId(comparison: FactorComparison) {
  return `${comparison.factorId}:${comparison.outcome}:lag${comparison.lag}`;
}

/**
 * Confidence stays computed, never model-generated: an insight inherits the
 * strongest confidence among the comparisons it cites, and null when it cites
 * none (journal- or coverage-based insights).
 */
function insightConfidence(ids: string[], comparisonsById: Map<string, FactorComparison>) {
  const confidences = ids
    .map((id) => comparisonsById.get(id)?.confidence)
    .filter((value): value is number => typeof value === "number");
  return confidences.length ? Math.max(...confidences) : null;
}

function recentJournalEntries(days: InsightDay[]) {
  return days
    .filter(
      (day) => day.journal.whatWentWell || day.journal.whatDrainedEnergy || day.journal.whatToImprove,
    )
    .slice(-JOURNAL_MAX_DAYS)
    .map((day) => ({
      date: day.date,
      wentWell: excerpt(day.journal.whatWentWell),
      drainedEnergy: excerpt(day.journal.whatDrainedEnergy),
      toImprove: excerpt(day.journal.whatToImprove),
    }));
}

function excerpt(text: string | null) {
  if (!text) return null;
  return text.length > JOURNAL_EXCERPT_MAX_CHARS ? `${text.slice(0, JOURNAL_EXCERPT_MAX_CHARS)}…` : text;
}
