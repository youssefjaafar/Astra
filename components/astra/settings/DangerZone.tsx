"use client";

import { LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { appearanceStorageKey } from "@/components/astra/settings/settings-utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DangerZoneProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export function DangerZone({ onSuccess, onError }: DangerZoneProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      onError(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  function deleteLocalPreferences() {
    window.localStorage.removeItem(appearanceStorageKey);
    onSuccess("Local UI preferences deleted.");
  }

  return (
    <GlassCard className="border-amber-300/20 bg-amber-300/[0.04] p-5">
      <SectionHeader title="Danger Zone" subtitle="Account and local interface controls." />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button
          className="flex min-h-28 flex-col items-start justify-between rounded-lg border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-cyan-200/30 hover:bg-cyan-200/10"
          onClick={signOut}
          type="button"
        >
          <LogOut className="h-5 w-5 text-cyan-200" />
          <span>
            <span className="block text-sm font-semibold text-white">Sign out</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">End this cockpit session.</span>
          </span>
        </button>
        <button
          className="flex min-h-28 flex-col items-start justify-between rounded-lg border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-violet-200/30 hover:bg-violet-200/10"
          onClick={deleteLocalPreferences}
          type="button"
        >
          <Trash2 className="h-5 w-5 text-violet-200" />
          <span>
            <span className="block text-sm font-semibold text-white">Delete local UI preferences</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">Clears appearance settings stored in this browser.</span>
          </span>
        </button>
        <div className="flex min-h-28 flex-col items-start justify-between rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
          <ShieldAlert className="h-5 w-5 text-amber-200" />
          <span>
            <span className="block text-sm font-semibold text-white">Account deletion</span>
            <span className="mt-1 block text-xs leading-5 text-amber-100/80">
              Placeholder only. Destructive account deletion is not implemented without explicit confirmation.
            </span>
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={signOut} type="button" variant="secondary">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </GlassCard>
  );
}
