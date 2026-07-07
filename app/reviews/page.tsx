import { redirect } from "next/navigation";

import { ReviewsModule } from "@/components/astra/reviews";
import { getWeekRange } from "@/components/astra/reviews/review-utils";
import {
  addDaysInTimeZone,
  dateStringInTimeZone,
  resolveTimeZone,
  startOfDayInTimeZone,
  startOfWeekInTimeZone,
} from "@/lib/dates";
import { fetchReviewSignals } from "@/lib/reviews/server";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profileResult = await supabase.from("profiles").select("timezone").eq("user_id", user.id).maybeSingle();
  const timeZone = resolveTimeZone(profileResult.data?.timezone);
  const now = new Date();
  const currentWeek = dateStringInTimeZone(startOfWeekInTimeZone(now, timeZone), timeZone);
  const { endExclusive } = getWeekRange(currentWeek, timeZone);
  const signalStart = addDaysInTimeZone(startOfDayInTimeZone(now, timeZone), -70, timeZone);

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
