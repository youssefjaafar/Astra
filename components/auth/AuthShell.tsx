import Link from "next/link";
import { Orbit } from "lucide-react";

import { GlassCard } from "@/components/astra";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, footer, children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <div className="w-full max-w-md">
        <Link className="mx-auto mb-6 flex w-fit items-center gap-3" href="/">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 shadow-glow">
            <Orbit className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">Astra</p>
            <p className="text-xs text-slate-500">Life mission-control</p>
          </div>
        </Link>
        <GlassCard glow className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </GlassCard>
        <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </main>
  );
}
