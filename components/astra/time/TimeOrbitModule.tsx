"use client";

import { AlertCircle, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { ActiveTimer } from "@/components/astra/time/ActiveTimer";
import { DailyTimeline } from "@/components/astra/time/DailyTimeline";
import { TimeBlockFormDialog } from "@/components/astra/time/TimeBlockFormDialog";
import { TimeDistributionChart } from "@/components/astra/time/TimeDistributionChart";
import { TimeInsightCards } from "@/components/astra/time/TimeInsightCards";
import { TimeSummaryCards } from "@/components/astra/time/TimeSummaryCards";
import { type AstraTimeBlock } from "@/components/astra/time/time-utils";
import { Button } from "@/components/ui/button";
import { createBrowserDbClient } from "@/lib/db/client";
import type { TimeBlockFormInput } from "@/lib/validations/time";

type TimeOrbitModuleProps = {
  initialBlocks: AstraTimeBlock[];
  initialError: string | null;
  userId: string;
};

export function TimeOrbitModule({ initialBlocks, initialError, userId }: TimeOrbitModuleProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [error, setError] = useState<string | null>(initialError);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AstraTimeBlock | null>(null);

  function openNewBlock() {
    setEditingBlock(null);
    setDialogOpen(true);
  }

  function openEditBlock(block: AstraTimeBlock) {
    setEditingBlock(block);
    setDialogOpen(true);
  }

  async function saveBlock(values: TimeBlockFormInput, block: AstraTimeBlock | null) {
    setError(null);
    setLoadingMessage(block ? "Saving time signal..." : "Logging time signal...");

    const normalized = normalizeTimeBlock(values);
    if (!normalized) {
      setLoadingMessage(null);
      setError("Add a valid start time or duration.");
      return;
    }

    if (block) {
      const { data, error: updateError } = await supabase
        .from("time_blocks")
        .update(normalized)
        .eq("id", block.id)
        .eq("user_id", userId)
        .select("*")
        .single();
      setLoadingMessage(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setBlocks((current) => current.map((item) => (item.id === data.id ? data : item)));
      setDialogOpen(false);
      setEditingBlock(null);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("time_blocks")
      .insert({
        ...normalized,
        user_id: userId,
      })
      .select("*")
      .single();

    setLoadingMessage(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setBlocks((current) => [data, ...current]);
    setDialogOpen(false);
  }

  async function deleteBlock(block: AstraTimeBlock) {
    if (!window.confirm(`Delete "${block.title}"? This removes the time signal from Astra.`)) return;

    setError(null);
    const previousBlocks = blocks;
    setBlocks((current) => current.filter((item) => item.id !== block.id));

    const { error: deleteError } = await supabase.from("time_blocks").delete().eq("id", block.id).eq("user_id", userId);

    if (deleteError) {
      setBlocks(previousBlocks);
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader title="Time Orbit" subtitle="See where your hours are actually going." />
        <Button onClick={openNewBlock} type="button">
          <Plus className="h-4 w-4" />
          Log Time Block
        </Button>
      </div>

      {error ? (
        <GlassCard className="flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </GlassCard>
      ) : null}

      {loadingMessage ? (
        <GlassCard className="p-4">
          <p className="text-sm text-slate-400">{loadingMessage}</p>
        </GlassCard>
      ) : null}

      <TimeSummaryCards blocks={blocks} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ActiveTimer onCreated={(block) => setBlocks((current) => [block, ...current])} onError={setError} userId={userId} />
        <CourseCorrectionCard />
      </div>

      <TimeDistributionChart blocks={blocks} />
      <TimeInsightCards blocks={blocks} />
      <DailyTimeline blocks={blocks} onDelete={deleteBlock} onEdit={openEditBlock} onNewBlock={openNewBlock} />

      <TimeBlockFormDialog
        block={editingBlock}
        onClose={() => {
          setDialogOpen(false);
          setEditingBlock(null);
        }}
        onSubmit={saveBlock}
        open={dialogOpen}
      />
    </div>
  );
}

function CourseCorrectionCard() {
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-violet-300/20" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">Course Correction</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Attention drift scan</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
          <Sparkles className="h-5 w-5 text-cyan-200" />
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-300">
        Notice where your attention drifted. Tomorrow, protect one focused block before distractions begin.
      </p>
    </GlassCard>
  );
}

function normalizeTimeBlock(values: TimeBlockFormInput) {
  const startTime = values.startTime ? new Date(values.startTime) : new Date();
  const endTime = values.endTime ? new Date(values.endTime) : null;
  const calculatedDuration = endTime ? Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 60000)) : null;
  const durationMinutes = calculatedDuration ?? values.durationMinutes ?? null;

  if (!durationMinutes && !values.startTime) return null;

  return {
    title: values.title.trim(),
    category: values.category,
    start_time: startTime.toISOString(),
    end_time: endTime?.toISOString() ?? null,
    duration_minutes: durationMinutes,
    quality_score: values.qualityScore ?? null,
    notes: values.notes?.trim() || null,
  };
}
