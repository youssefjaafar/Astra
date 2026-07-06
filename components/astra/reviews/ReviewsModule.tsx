"use client";

import { AlertCircle, BrainCircuit, ClipboardPenLine } from "lucide-react";
import { useMemo, useState } from "react";

import { AIDailySummaryCard } from "@/components/astra/reviews/AIDailySummaryCard";
import { DailyDebriefForm } from "@/components/astra/reviews/DailyDebriefForm";
import { DailySignalSummary } from "@/components/astra/reviews/DailySignalSummary";
import { PreviousReviewsList } from "@/components/astra/reviews/PreviousReviewsList";
import { ReviewCharts } from "@/components/astra/reviews/ReviewCharts";
import { WeeklyMissionReport } from "@/components/astra/reviews/WeeklyMissionReport";
import {
  getWeekStart,
  todayDateString,
  type DailyReview,
  type ReviewSignals,
  type WeeklyReview,
} from "@/components/astra/reviews/review-utils";
import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { createBrowserDbClient } from "@/lib/db/client";
import type { DailyReviewFormInput } from "@/lib/validations/reviews";

type ReviewsModuleProps = {
  initialDailyReviews: DailyReview[];
  initialWeeklyReviews: WeeklyReview[];
  initialSignals: ReviewSignals;
  initialError: string | null;
  userId: string;
};

export function ReviewsModule({ initialDailyReviews, initialWeeklyReviews, initialSignals, initialError, userId }: ReviewsModuleProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [dailyReviews, setDailyReviews] = useState(() => sortDailyReviews(initialDailyReviews));
  const [weeklyReviews, setWeeklyReviews] = useState(() => sortWeeklyReviews(initialWeeklyReviews));
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart());
  const [error, setError] = useState<string | null>(initialError);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [dailyAiLoading, setDailyAiLoading] = useState(false);
  const [weeklyAiLoading, setWeeklyAiLoading] = useState(false);

  const selectedReview = dailyReviews.find((review) => review.review_date === selectedDate) ?? null;

  function startDailyDebrief() {
    setSelectedDate(todayDateString());
    document.getElementById("daily-debrief")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveDailyReview(values: DailyReviewFormInput) {
    setError(null);
    setLoadingMessage("Saving Daily Debrief...");

    const { data, error: saveError } = await supabase
      .from("daily_reviews")
      .upsert(
        {
          user_id: userId,
          review_date: values.reviewDate,
          what_went_well: values.whatWentWell?.trim() || null,
          what_drained_energy: values.whatDrainedEnergy?.trim() || null,
          what_to_improve: values.whatToImprove?.trim() || null,
          mood_score: values.moodScore,
          energy_score: values.energyScore,
          focus_score: values.focusScore,
        },
        { onConflict: "user_id,review_date" },
      )
      .select("*")
      .single();

    setLoadingMessage(null);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSelectedDate(data.review_date);
    setDailyReviews((current) => upsertReview(current, data));
  }

  async function generateDailySummary() {
    setError(null);
    setDailyAiLoading(true);

    const response = await fetch("/api/ai/daily-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewDate: selectedDate }),
    });
    const payload = (await response.json()) as { error?: string; review?: DailyReview };

    setDailyAiLoading(false);

    if (!response.ok || payload.error || !payload.review) {
      setError(payload.error ?? "Daily summary generation failed.");
      return;
    }

    setDailyReviews((current) => upsertReview(current, payload.review as DailyReview));
  }

  async function generateWeeklyReport() {
    setError(null);
    setWeeklyAiLoading(true);

    const response = await fetch("/api/ai/weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: selectedWeek }),
    });
    const payload = (await response.json()) as { error?: string; weeklyReview?: WeeklyReview };

    setWeeklyAiLoading(false);

    if (!response.ok || payload.error || !payload.weeklyReview) {
      setError(payload.error ?? "Weekly report generation failed.");
      return;
    }

    setWeeklyReviews((current) => upsertWeeklyReview(current, payload.weeklyReview as WeeklyReview));
  }

  function selectReview(review: DailyReview) {
    setSelectedDate(review.review_date);
    document.getElementById("daily-debrief")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          title="Mission Debrief"
          subtitle="Review your signals, understand your patterns, and adjust your trajectory."
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={startDailyDebrief} type="button" variant="secondary">
            <ClipboardPenLine className="h-4 w-4" />
            Start Daily Debrief
          </Button>
          <Button disabled={weeklyAiLoading} onClick={generateWeeklyReport} type="button">
            <BrainCircuit className="h-4 w-4" />
            Generate Weekly Report
          </Button>
        </div>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      {loadingMessage ? (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-400">{loadingMessage}</p>
        </GlassCard>
      ) : null}

      <section className="space-y-4" id="daily-debrief">
        <DailySignalSummary selectedDate={selectedDate} signals={initialSignals} />
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <DailyDebriefForm
            onDateChange={setSelectedDate}
            onSubmit={saveDailyReview}
            review={selectedReview}
            selectedDate={selectedDate}
          />
          <AIDailySummaryCard
            loading={dailyAiLoading}
            onGenerate={generateDailySummary}
            selectedDate={selectedDate}
            summary={selectedReview?.ai_summary ?? null}
          />
        </div>
      </section>

      <WeeklyMissionReport
        loading={weeklyAiLoading}
        onGenerate={generateWeeklyReport}
        onWeekChange={setSelectedWeek}
        selectedWeek={selectedWeek}
        weeklyReviews={weeklyReviews}
      />

      <ReviewCharts reviews={dailyReviews} signals={initialSignals} weekStart={selectedWeek} />

      <PreviousReviewsList onNewReview={startDailyDebrief} onSelect={selectReview} reviews={dailyReviews} />
    </div>
  );
}

function sortDailyReviews(reviews: DailyReview[]) {
  return [...reviews].sort((a, b) => b.review_date.localeCompare(a.review_date));
}

function upsertReview(reviews: DailyReview[], review: DailyReview) {
  return sortDailyReviews([review, ...reviews.filter((item) => item.id !== review.id && item.review_date !== review.review_date)]);
}

function sortWeeklyReviews(reviews: WeeklyReview[]) {
  return [...reviews].sort((a, b) => b.week_start.localeCompare(a.week_start));
}

function upsertWeeklyReview(reviews: WeeklyReview[], review: WeeklyReview) {
  return sortWeeklyReviews([review, ...reviews.filter((item) => item.id !== review.id && item.week_start !== review.week_start)]);
}
