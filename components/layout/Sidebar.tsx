"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  Dumbbell,
  Home,
  ListChecks,
  Moon,
  Orbit,
  Settings,
  Utensils,
} from "lucide-react";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/40 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
      <div className="flex h-full flex-col px-4 py-5">
        <Link className="flex items-center gap-3 px-2" href="/dashboard">
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
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition",
                  active
                    ? "border-cyan-200/30 bg-cyan-200/10 text-white shadow-glow"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-slate-600">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">Cockpit Mode</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Keep the signal clean. Capture, guide, review, correct.
          </p>
        </div>
      </div>
    </aside>
  );
}
