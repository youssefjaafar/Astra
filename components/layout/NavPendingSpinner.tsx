"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Must be rendered as a descendant of <Link>: useLinkStatus reports that
// link's in-flight navigation, giving click feedback before the route
// responds (loading.tsx can only paint once the server starts streaming).
export function NavPendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return <Loader2 className={cn("h-4 w-4 shrink-0 animate-spin text-cyan-200", className)} />;
}
