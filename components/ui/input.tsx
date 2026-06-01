import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full appearance-none rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 caret-cyan-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-cyan-300/20",
        className,
      )}
      {...props}
    />
  );
}
