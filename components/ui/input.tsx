import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-white/10 bg-white/8 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20",
        className,
      )}
      {...props}
    />
  );
}
