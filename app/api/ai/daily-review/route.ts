import { NextResponse } from "next/server";
import { z } from "zod";

import { buildDailyReviewMessages, formatDailySummary } from "@/lib/ai/prompts/reviews";
import { AiProviderError, generateJsonCompletion } from "@/lib/ai/provider";
import { fetchReviewSignals } from "@/lib/reviews/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aiDailySummarySchema, dailyReviewAiRequestSchema } from "@/lib/validations/reviews";
import { getDailySignalSummary, getDayRange } from "@/components/astra/reviews/review-utils";

export async function POST(request: Request) {
  try {
    const body = dailyReviewAiRequestSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { start, end } = getDayRange(body.reviewDate);
    const { signals, error: signalError } = await fetchReviewSignals(supabase, user.id, {
      start,
      endExclusive: end,
    });

    if (signalError) {
      return NextResponse.json({ error: signalError }, { status: 500 });
    }

    const { data: review } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("review_date", body.reviewDate)
      .maybeSingle();

    const aiResponse = await generateJsonCompletion({
      messages: buildDailyReviewMessages({
        reviewDate: body.reviewDate,
        writtenReflection: review,
        lifeSignals: getDailySignalSummary(signals, body.reviewDate),
      }),
      temperature: 0.2,
    });
    const parsed = aiDailySummarySchema.parse(aiResponse);
    const summary = formatDailySummary(parsed);

    const { data, error: saveError } = await supabase
      .from("daily_reviews")
      .upsert(
        {
          user_id: user.id,
          review_date: body.reviewDate,
          ai_summary: summary,
        },
        { onConflict: "user_id,review_date" },
      )
      .select("*")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ summary, review: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid daily review request or AI response.",
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
        error: error instanceof Error ? error.message : "Daily summary generation failed.",
      },
      { status: 500 },
    );
  }
}
