import { redirect } from "next/navigation";

import { ReviewsModule } from "@/components/astra/reviews";
import { getWeekRange, getWeekStart, todayDateString } from "@/components/astra/reviews/review-utils";
import { fetchReviewSignals } from "@/lib/reviews/server";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = todayDateString();
  const currentWeek = getWeekStart();
  const { endExclusive } = getWeekRange(currentWeek);
  const signalStart = new Date(`${today}T00:00:00`);
  signalStart.setDate(signalStart.getDate() - 70);

  const [dailyReviewsResult, weeklyReviewsResult, signalsResult] = await Promise.all([
    supabase.from("daily_reviews").select("*").eq("user_id", user.id).order("review_date", { ascending: false }),
    supabase.from("weekly_reviews").select("*").eq("user_id", user.id).order("week_start", { ascending: false }),
    fetchReviewSignals(supabase, user.id, { start: signalStart, endExclusive }),
  ]);

  const initialError = [
    formatSetupError(dailyReviewsResult.error, "public.daily_reviews"),
    formatSetupError(weeklyReviewsResult.error, "public.weekly_reviews"),
    signalsResult.error,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ReviewsModule
      initialDailyReviews={dailyReviewsResult.data ?? []}
      initialError={initialError || null}
      initialSignals={signalsResult.signals}
      initialWeeklyReviews={weeklyReviewsResult.data ?? []}
      userId={user.id}
    />
  );
}

function formatSetupError(error: { message: string; code?: string } | null, tableName: string) {
  if (!error) return null;
  return isMissingTableError(error) ? getDatabaseSetupMessage(tableName) : error.message;
}
