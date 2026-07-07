"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Brain, Dumbbell, Home, ListChecks, Moon, Orbit, Settings, Utensils } from "lucide-react";

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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/85 p-1 shadow-panel backdrop-blur-xl lg:hidden">
      <div className="flex min-w-max gap-1">
        {navItems.map((item) => {
          const Icon = navIcons[item.href as keyof typeof navIcons] ?? Home;
          const active = pathname === item.href;

          return (
            <Link
              className={cn(
                "flex min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] transition",
                active ? "bg-cyan-200/10 text-cyan-100" : "text-slate-500 hover:text-slate-200",
              )}
              href={item.href}
              key={item.href}
              prefetch
            >
              <span className="relative">
                <Icon className="h-4 w-4" />
                <NavPendingSpinner className="absolute inset-0 h-4 w-4 bg-slate-950/85" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
