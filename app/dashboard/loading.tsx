import { PageSkeleton } from "@/components/astra";

export default function DashboardLoading() {
  return (
    <PageSkeleton
      title="Command Center"
      subtitle="Loading today's mission signals."
      stats={8}
    />
  );
}
