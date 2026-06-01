import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function GlassCard({ className, glow = false, ...props }: GlassCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/10 bg-slate-950/50 shadow-panel backdrop-blur-xl",
        glow && "shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
