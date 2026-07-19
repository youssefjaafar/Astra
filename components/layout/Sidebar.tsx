"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Brain,
  Dumbbell,
  Home,
  ListChecks,
  LockKeyhole,
  Moon,
  Orbit,
  Settings,
  Utensils,
} from "lucide-react";

import { NavPendingSpinner } from "@/components/layout/NavPendingSpinner";
import { navItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navIcons = {
  "/dashboard": Home,
  "/tasks": ListChecks,
  "/habits": Activity,
  "/time": Orbit,
  "/meals": Utensils,
  "/workouts": Dumbbell,
  "/reviews": Moon,
  "/ai": Brain,
  "/settings": Settings,
};

export function Sidebar({ demoMode = false }: { demoMode?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/40 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
      <div className="flex h-full flex-col px-4 py-5">
        <Link className="flex items-center gap-3 px-2" href={demoMode ? "/demo" : "/dashboard"} prefetch>
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 shadow-glow">
            <Orbit className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">Astra</p>
            <p className="text-xs text-slate-500">Life mission-control</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = navIcons[item.href as keyof typeof navIcons] ?? Home;
            const isDemoDashboard = demoMode && item.href === "/dashboard";
            const active = isDemoDashboard || pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (demoMode && !isDemoDashboard) {
              return (
                <span
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm text-slate-600"
                  key={item.href}
                  title="Create an account to unlock this module"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-slate-700">{item.description}</span>
                  </span>
                  <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                </span>
              );
            }

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition",
                  active
                    ? "border-cyan-200/30 bg-cyan-200/10 text-white shadow-glow"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100",
                )}
                href={isDemoDashboard ? "/demo" : item.href}
                key={item.href}
                prefetch
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-slate-600">{item.description}</span>
                </span>
                <NavPendingSpinner />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
            {demoMode ? "Demo Flight" : "Cockpit Mode"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {demoMode
              ? "Sample telemetry only. No personal data or AI credits are used."
              : "Keep the signal clean. Capture, guide, review, correct."}
          </p>
          <Link
            className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-cyan-100"
            href="/guide"
            prefetch
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            Guide: what Astra can do
          </Link>
          {demoMode ? (
            <Link
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-cyan-300 px-3 text-xs font-medium text-slate-950 shadow-glow transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              href="/signup"
            >
              Create your cockpit
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
