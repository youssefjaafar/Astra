"use client";

import { usePathname } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shelllessRoutes = ["/", "/login", "/signup", "/onboarding"];

  if (shelllessRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <Topbar />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-14">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
