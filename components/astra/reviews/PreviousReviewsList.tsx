"use client";

import { EmptyState, SectionHeader } from "@/components/astra";
import { ReviewCard } from "@/components/astra/reviews/ReviewCard";
import { type DailyReview } from "@/components/astra/reviews/review-utils";

type PreviousReviewsListProps = {
  reviews: DailyReview[];
  onSelect: (review: DailyReview) => void;
  onNewReview: () => void;
};

export function PreviousReviewsList({ reviews, onSelect, onNewReview }: PreviousReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        actionLabel="Start Daily Debrief"
        description="No debriefs logged yet. Start with today's reflection."
        onAction={onNewReview}
        title="No debriefs logged yet."
      />
    );
  }

  return (
    <section>
      <SectionHeader title="Previous Reviews" subtitle="Past reflections for pattern detection." />
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} onSelect={onSelect} review={review} />
        ))}
      </div>
    </section>
  );
}
