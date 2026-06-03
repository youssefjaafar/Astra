import { PageSkeleton } from "@/components/astra";

export default function SettingsLoading() {
  return (
    <PageSkeleton
      chart={false}
      title="Control Panel"
      subtitle="Tune Astra to match your life systems."
      stats={0}
    />
  );
}
