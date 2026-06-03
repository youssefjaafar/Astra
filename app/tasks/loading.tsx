import { PageSkeleton } from "@/components/astra";

export default function TasksLoading() {
  return (
    <PageSkeleton
      actionLabel="New Task"
      title="Mission Tasks"
      subtitle="Organize what needs your attention without overloading your mind."
      stats={4}
      chart={false}
    />
  );
}
