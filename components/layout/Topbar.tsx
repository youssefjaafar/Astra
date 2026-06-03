"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Search, Signal, Sparkles, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { LiveDateTime } from "@/components/layout/LiveDateTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Commander");
  const [timezone, setTimezone] = useState("America/Detroit");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("display_name, timezone")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!cancelled) {
          setDisplayName(data?.display_name || user.email?.split("@")[0] || "Commander");
          setTimezone(data?.timezone || "America/Detroit");
        }
      } catch {
        setDisplayName("Commander");
        setTimezone("America/Detroit");
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl lg:left-72">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] lg:hidden">
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <LiveDateTime timezone={timezone} />
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
          <Badge className="hidden md:inline-flex" tone="neutral">
            <UserCircle className="mr-1 h-3 w-3" />
            {displayName}
          </Badge>
          <Button asChild className="hidden sm:inline-flex" size="sm">
            <Link href="/ai" prefetch>
              Quick Capture
            </Link>
          </Button>
          <Button aria-label="Log out" onClick={handleLogout} size="icon" type="button" variant="secondary">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
