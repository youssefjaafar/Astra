import type { CSSProperties } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

export function SkeletonBlock({ className, style }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.055]", className)} style={style} />;
}

export function StatCardSkeleton() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-3 h-7 w-20" />
          <SkeletonBlock className="mt-3 h-3 w-36" />
        </div>
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-md" />
      </div>
      <SkeletonBlock className="mt-5 h-2 w-full rounded-full" />
    </GlassCard>
  );
}

export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ title = "Signal Chart", subtitle = "Loading current pattern data." }: { title?: string; subtitle?: string }) {
  return (
    <GlassCard className="p-5">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-5 grid h-72 min-h-72 place-items-center rounded-xl border border-white/10 bg-white/[0.035]">
        <div className="flex h-44 w-full max-w-md items-end justify-center gap-3 px-8">
          {[42, 72, 54, 88, 64, 38, 78].map((height, index) => (
            <SkeletonBlock className="w-8 rounded-t-md" key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <GlassCard className="p-4" key={index}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="mt-3 h-3 w-1/2" />
              <SkeletonBlock className="mt-4 h-3 w-full" />
            </div>
            <SkeletonBlock className="h-9 w-9 shrink-0 rounded-md" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export function PageSkeleton({
  title,
  subtitle,
  actionLabel,
  stats = 6,
  chart = true,
  list = true,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  stats?: number;
  chart?: boolean;
  list?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader title={title} subtitle={subtitle} />
        {actionLabel ? (
          <div className="h-10 w-full rounded-md border border-white/10 bg-white/[0.055] sm:w-36" aria-hidden />
        ) : null}
      </div>
      {stats > 0 ? <CardGridSkeleton count={stats} className="xl:grid-cols-3 2xl:grid-cols-6" /> : null}
      {chart ? (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <ChartSkeleton />
          <GlassCard className="p-5">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-5 h-24 w-full" />
            <SkeletonBlock className="mt-4 h-3 w-3/4" />
            <SkeletonBlock className="mt-3 h-3 w-1/2" />
          </GlassCard>
        </div>
      ) : null}
      {list ? <ListSkeleton count={4} /> : null}
    </div>
  );
}
