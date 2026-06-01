"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, ListChecks, Orbit, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const mobileItems = [
  { href: "/dashboard", label: "Center", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/time", label: "Orbit", icon: Orbit },
  { href: "/ai", label: "AI", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-xl border border-white/10 bg-slate-950/85 p-1 shadow-panel backdrop-blur-xl lg:hidden">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] transition",
              active ? "bg-cyan-200/10 text-cyan-100" : "text-slate-500 hover:text-slate-200",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
