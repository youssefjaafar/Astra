import { PageSkeleton } from "@/components/astra";

export default function TimeLoading() {
  return (
    <PageSkeleton
      actionLabel="Log Time"
      title="Time Orbit"
      subtitle="Map where your attention, energy, and time are moving."
      stats={4}
    />
  );
}
