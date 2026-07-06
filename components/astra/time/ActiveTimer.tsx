"use client";

import { Loader2, Play, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { categoryLabels, formatMinutes } from "@/components/astra/time/time-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserDbClient } from "@/lib/db/client";
import { cn } from "@/lib/utils";
import { timeCategories, type TimeCategory } from "@/lib/validations/time";

type ActiveTimerState = {
  title: string;
  category: TimeCategory;
  startedAt: string;
};

type ActiveTimerProps = {
  userId: string;
  onCreated: (block: import("@/components/astra/time/time-utils").AstraTimeBlock) => void;
  onError: (message: string | null) => void;
};

export function ActiveTimer({ userId, onCreated, onError }: ActiveTimerProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const storageKey = useMemo(() => `astra.activeTimeTimer.${userId}`, [userId]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TimeCategory>("deep_work");
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as ActiveTimerState;
      setActiveTimer(parsed);
      setTitle(parsed.title);
      setCategory(parsed.category);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(activeTimer.startedAt).getTime()) / 1000)));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  function startTimer() {
    const nextTimer = {
      title: title.trim() || categoryLabels[category],
      category,
      startedAt: new Date().toISOString(),
    };
    setActiveTimer(nextTimer);
    window.localStorage.setItem(storageKey, JSON.stringify(nextTimer));
    onError(null);
  }

  async function stopTimer() {
    if (!activeTimer) return;

    setSaving(true);
    onError(null);
    const stoppedAt = new Date();
    const durationMinutes = Math.max(1, Math.round((stoppedAt.getTime() - new Date(activeTimer.startedAt).getTime()) / 60000));

    const { data, error } = await supabase
      .from("time_blocks")
      .insert({
        user_id: userId,
        title: activeTimer.title,
        category: activeTimer.category,
        start_time: activeTimer.startedAt,
        end_time: stoppedAt.toISOString(),
        duration_minutes: durationMinutes,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      onError(error.message);
      return;
    }

    setActiveTimer(null);
    setTitle("");
    window.localStorage.removeItem(storageKey);
    onCreated(data);
  }

  return (
    <GlassCard className="relative overflow-hidden p-5" glow={Boolean(activeTimer)}>
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full border border-cyan-300/20" />
      <div className="pointer-events-none absolute -right-4 top-8 h-20 w-20 rounded-full border border-violet-300/15" />

      <SectionHeader
        title="Active Timer"
        subtitle={activeTimer ? "Timer is holding this orbit in local memory." : "Start one focused signal and stop when complete."}
      />

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_0.9fr_auto]">
        <Input disabled={Boolean(activeTimer)} onChange={(event) => setTitle(event.target.value)} placeholder="Title, e.g. Morning deep work" value={title} />
        <select
          className={cn("h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm capitalize text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20")}
          disabled={Boolean(activeTimer)}
          onChange={(event) => setCategory(event.target.value as TimeCategory)}
          value={category}
        >
          {timeCategories.map((item) => (
            <option key={item} value={item}>
              {categoryLabels[item]}
            </option>
          ))}
        </select>
        {activeTimer ? (
          <Button disabled={saving} onClick={stopTimer} type="button" variant="secondary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            Stop
          </Button>
        ) : (
          <Button onClick={startTimer} type="button">
            <Play className="h-4 w-4" />
            Start
          </Button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Current orbit</p>
          <p className="mt-1 text-sm text-slate-300">{activeTimer ? activeTimer.title : "No active timer"}</p>
        </div>
        <p className="text-2xl font-semibold text-white">{formatElapsed(elapsedSeconds)}</p>
      </div>
    </GlassCard>
  );
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes >= 60) return formatMinutes(minutes);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
