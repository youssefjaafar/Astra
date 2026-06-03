import { GlassCard } from "@/components/astra";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonPanel className="min-h-[360px]" />
      <SkeletonPanel className="min-h-[260px]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonPanel className="min-h-[190px]" key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonPanel className="min-h-[360px]" />
        <SkeletonPanel className="min-h-[360px]" />
      </div>
    </div>
  );
}

function SkeletonPanel({ className }: { className?: string }) {
  return (
    <GlassCard className={className}>
      <div className="h-full min-h-[inherit] animate-pulse rounded-xl bg-white/[0.035]" />
    </GlassCard>
  );
}
