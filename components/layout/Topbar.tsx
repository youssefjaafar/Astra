"use client";

import Link from "next/link";
import { CalendarDays, Search, Signal, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl lg:left-72">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] lg:hidden">
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CalendarDays className="h-4 w-4" />
              <span className="truncate">{currentDate}</span>
            </div>
            <p className="mt-0.5 hidden text-xs text-slate-600 sm:block">Calm cockpit for today&apos;s mission</p>
          </div>
        </div>

        <div className="hidden min-w-0 max-w-md flex-1 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-500 md:flex">
          <Search className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
          Quick capture or search...
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge className="hidden sm:inline-flex" tone="cyan">
            <Signal className="mr-1 h-3 w-3" />
            Astra Online
          </Badge>
          <Button asChild size="sm">
            <Link href="/ai">Quick Capture</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
