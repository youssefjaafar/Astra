import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-white/10 bg-white/8 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20",
        className,
      )}
      {...props}
    />
  );
}
