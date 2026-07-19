import Link from "next/link";
import { BookOpen, DatabaseZap, Eye, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DemoModeBanner() {
  return (
    <aside
      aria-label="Demo mode information"
      className="relative overflow-hidden rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-4 shadow-[0_0_40px_rgba(252,211,77,0.06)] sm:p-5"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(110deg,transparent,rgba(103,232,249,0.05),transparent)]" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-amber-200/25 bg-amber-200/10">
            <Eye className="h-5 w-5 text-amber-100" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="amber">Demo telemetry</Badge>
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Read-only flight</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              You are exploring a fictional mission with sample data. Nothing here connects to a user account,
              writes to the database, or spends AI credits.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" /> No sign-up required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DatabaseZap className="h-3.5 w-3.5 text-violet-200" /> No live API calls
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 pl-14 xl:pl-0">
          <Button asChild size="sm" variant="ghost">
            <Link href="/guide">
              <BookOpen className="h-4 w-4" />
              User guide
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
