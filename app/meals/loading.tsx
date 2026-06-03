import { PageSkeleton } from "@/components/astra";

export default function MealsLoading() {
  return (
    <PageSkeleton
      actionLabel="Log Meal"
      title="Nutrition"
      subtitle="Track meals, hydration, and the fuel signals that support your day."
      stats={6}
    />
  );
}
