import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "cyan" | "blue" | "violet" | "indigo" | "emerald" | "amber" | "neutral";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  blue: "border-blue-300/30 bg-blue-300/10 text-blue-100",
  violet: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  indigo: "border-indigo-300/30 bg-indigo-300/10 text-indigo-100",
  emerald: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  amber: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  neutral: "border-white/12 bg-white/8 text-slate-200",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
