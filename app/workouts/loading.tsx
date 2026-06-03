import { PageSkeleton } from "@/components/astra";

export default function WorkoutsLoading() {
  return (
    <PageSkeleton
      actionLabel="Log Workout"
      title="Training Log"
      subtitle="Track your physical signal, build consistency, and review your performance."
      stats={6}
    />
  );
}
