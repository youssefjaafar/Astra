import { cn } from "@/lib/utils";
import type { SignalTone } from "@/lib/types";

type ProgressRingProps = {
  value: number;
  label?: string;
  size?: number;
  tone?: SignalTone;
  className?: string;
};

const strokeByTone: Record<SignalTone, string> = {
  cyan: "#67e8f9",
  blue: "#93c5fd",
  violet: "#a78bfa",
  indigo: "#818cf8",
  emerald: "#6ee7b7",
  amber: "#fbbf24",
};

export function ProgressRing({ value, label, size = 96, tone = "cyan", className }: ProgressRingProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ height: size, width: size }}>
      <svg aria-hidden height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={strokeByTone[tone]}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-semibold text-white">{Math.round(safeValue)}%</p>
        {label ? <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p> : null}
      </div>
    </div>
  );
}
