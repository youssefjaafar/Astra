import { cn, formatPercent } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  tone?: "cyan" | "blue" | "violet" | "indigo" | "emerald" | "amber";
};

const fills: Record<NonNullable<ProgressProps["tone"]>, string> = {
  cyan: "bg-cyan-300",
  blue: "bg-blue-300",
  violet: "bg-violet-300",
  indigo: "bg-indigo-300",
  emerald: "bg-emerald-300",
  amber: "bg-amber-300",
};

export function Progress({ value, className, tone = "cyan" }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={formatPercent(safeValue)}
      className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div className={cn("h-full rounded-full", fills[tone])} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
