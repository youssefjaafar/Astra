"use client";

import { Brain, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserDbClient } from "@/lib/db/client";
import { meditationLogSchema } from "@/lib/validations/habits";

type MeditationQuickLogProps = {
  userId: string;
  onError: (message: string) => void;
};

const quickDurations = [5, 10, 15];

export function MeditationQuickLog({ userId, onError }: MeditationQuickLogProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [customMinutes, setCustomMinutes] = useState("");
  const [saving, setSaving] = useState<number | "custom" | null>(null);
  const [lastLog, setLastLog] = useState<string | null>(null);

  async function saveMeditation(durationMinutes: number, source: number | "custom") {
    const parsed = meditationLogSchema.safeParse({ durationMinutes, technique: "", notes: "" });
    if (!parsed.success) {
      onError(parsed.error.issues[0]?.message ?? "Check the meditation duration.");
      return;
    }

    setSaving(source);
    onError("");

    const { error } = await supabase.from("meditation_logs").insert({
      user_id: userId,
      duration_minutes: parsed.data.durationMinutes,
      technique: null,
      notes: null,
      logged_at: new Date().toISOString(),
    });

    setSaving(null);
    if (error) {
      onError(error.message);
      return;
    }

    setLastLog(`${parsed.data.durationMinutes} min meditation logged`);
    if (source === "custom") setCustomMinutes("");
  }

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Mindfulness" subtitle="Quick log a calm reset." />
      <div className="mt-5 flex flex-wrap gap-2">
        {quickDurations.map((minutes) => (
          <Button disabled={Boolean(saving)} key={minutes} onClick={() => saveMeditation(minutes, minutes)} type="button" variant="secondary">
            {saving === minutes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {minutes} min
          </Button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          min={1}
          onChange={(event) => setCustomMinutes(event.target.value)}
          placeholder="Custom minutes"
          type="number"
          value={customMinutes}
        />
        <Button
          disabled={Boolean(saving) || !customMinutes}
          onClick={() => saveMeditation(Number(customMinutes), "custom")}
          type="button"
        >
          {saving === "custom" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Log
        </Button>
      </div>
      <p className="mt-4 text-sm text-slate-400">{lastLog ?? "A few minutes can still stabilize the day."}</p>
    </GlassCard>
  );
}
