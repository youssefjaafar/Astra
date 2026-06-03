import { PageSkeleton } from "@/components/astra";

export default function AILoading() {
  return (
    <PageSkeleton
      actionLabel="Ask Astra"
      chart={false}
      title="AI Copilot"
      subtitle="Analyze your life signals and receive calm course corrections."
      stats={3}
    />
  );
}
