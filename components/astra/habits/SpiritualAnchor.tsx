"use client";

import { Check, Loader2, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import type { PrayerLog } from "@/components/astra/habits/habit-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createBrowserDbClient } from "@/lib/db/client";
import { cn } from "@/lib/utils";

const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

type SpiritualAnchorProps = {
  userId: string;
  initialPrayerLogs: PrayerLog[];
  onError: (message: string) => void;
};

export function SpiritualAnchor({ userId, initialPrayerLogs, onError }: SpiritualAnchorProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [logs, setLogs] = useState(initialPrayerLogs);
  const [savingPrayer, setSavingPrayer] = useState<string | null>(null);

  const latestByPrayer = useMemo(() => {
    return logs.reduce<Record<string, PrayerLog>>((acc, log) => {
      const existing = acc[log.prayer_name];
      if (!existing || new Date(log.logged_at ?? 0) > new Date(existing.logged_at ?? 0)) {
        acc[log.prayer_name] = log;
      }
      return acc;
    }, {});
  }, [logs]);

  async function togglePrayer(prayerName: string) {
    setSavingPrayer(prayerName);
    onError("");

    const existing = latestByPrayer[prayerName];
    const nextCompleted = !existing?.completed;

    if (existing) {
      const { data, error } = await supabase
        .from("prayer_logs")
        .update({ completed: nextCompleted, logged_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("user_id", userId)
        .select("*")
        .single();

      setSavingPrayer(null);
      if (error) {
        onError(error.message);
        return;
      }
      setLogs((current) => current.map((log) => (log.id === data.id ? data : log)));
      return;
    }

    const { data, error } = await supabase
      .from("prayer_logs")
      .insert({
        user_id: userId,
        prayer_name: prayerName,
        completed: true,
        logged_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    setSavingPrayer(null);
    if (error) {
      onError(error.message);
      return;
    }
    setLogs((current) => [data, ...current]);
  }

  const completedCount = prayers.filter((prayer) => latestByPrayer[prayer]?.completed).length;

  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="Spiritual Anchor"
        subtitle="Prayer signals for the day, tracked without pressure."
        action={<Badge tone={completedCount === prayers.length ? "emerald" : "cyan"}>{completedCount}/5 complete</Badge>}
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {prayers.map((prayer) => {
          const completed = Boolean(latestByPrayer[prayer]?.completed);
          const saving = savingPrayer === prayer;

          return (
            <Button
              className={cn(
                "h-auto flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-4 text-slate-200 hover:bg-white/[0.08]",
                completed && "border-cyan-300/40 bg-cyan-300/10 text-white shadow-glow",
              )}
              disabled={Boolean(savingPrayer)}
              key={prayer}
              onClick={() => togglePrayer(prayer)}
              type="button"
              variant="ghost"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-slate-950/60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin text-cyan-200" /> : completed ? <Check className="h-4 w-4 text-cyan-200" /> : <ScrollText className="h-4 w-4 text-cyan-200" />}
              </span>
              <span>{prayer}</span>
            </Button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-slate-400">Return to the anchor gently. Every completed signal is useful data.</p>
    </GlassCard>
  );
}
