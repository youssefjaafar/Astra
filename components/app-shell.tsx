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
  Sparkles,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex min-w-0 items-center gap-3" href="/dashboard">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-200/30 bg-cyan-200/10 shadow-glow">
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">
                Astra
              </p>
              <p className="truncate text-xs text-slate-400">Personal mission control</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <Badge tone="cyan">Systems calm</Badge>
            <Button asChild size="sm" variant="secondary">
              <Link href="/ai">Quick Capture</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const Icon = navIcons[item.href as keyof typeof navIcons] ?? Home;
              const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

              return (
                <Link
                  className={cn(
                    "flex min-w-48 items-center gap-3 rounded-md border px-3 py-3 text-sm transition lg:min-w-0",
                    active
                      ? "border-cyan-200/30 bg-cyan-200/10 text-white shadow-glow"
                      : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/14 hover:bg-white/8",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-slate-500">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 pb-14">{children}</main>
      </div>
    </div>
  );
}
