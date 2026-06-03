import { PageSkeleton } from "@/components/astra";

export default function HabitsLoading() {
  return (
    <PageSkeleton
      actionLabel="New Habit"
      title="Systems & Habits"
      subtitle="Track the daily signals that shape your life trajectory."
      stats={4}
      chart={false}
    />
  );
}
