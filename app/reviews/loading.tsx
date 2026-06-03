import { PageSkeleton } from "@/components/astra";

export default function ReviewsLoading() {
  return (
    <PageSkeleton
      actionLabel="Start Daily Debrief"
      title="Mission Debrief"
      subtitle="Review your signals, understand your patterns, and adjust your trajectory."
      stats={4}
    />
  );
}
