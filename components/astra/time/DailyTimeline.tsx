"use client";

import { Edit3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState, GlassCard, SectionHeader } from "@/components/astra";
import {
  categoryColors,
  categoryLabels,
  formatMinutes,
  formatTimeRange,
  getBlockDuration,
  sortChronological,
  type AstraTimeBlock,
} from "@/components/astra/time/time-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DailyTimelineProps = {
  blocks: AstraTimeBlock[];
  onEdit: (block: AstraTimeBlock) => void;
  onDelete: (block: AstraTimeBlock) => Promise<void>;
  onNewBlock: () => void;
};

export function DailyTimeline({ blocks, onEdit, onDelete, onNewBlock }: DailyTimelineProps) {
  const sorted = sortChronological(blocks);

  if (sorted.length === 0) {
    return (
      <EmptyState
        actionLabel="Log Time Block"
        description="No time signals logged yet. Start tracking one block to bring your day into orbit."
        onAction={onNewBlock}
        title="Your time map is clear."
      />
    );
  }

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Daily Timeline" subtitle="Chronological signals from today's orbit." />
      <div className="mt-5 space-y-3">
        {sorted.map((block, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[1fr_auto]"
            data-testid="time-block-card"
            initial={{ opacity: 0, y: 8 }}
            key={block.id}
            transition={{ delay: index * 0.03, duration: 0.25 }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[block.category] }} />
                <h3 className="truncate text-base font-semibold text-white">{block.title}</h3>
                <Badge tone={block.category === "scrolling" ? "amber" : "cyan"}>{categoryLabels[block.category]}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {formatTimeRange(block)} · {formatMinutes(getBlockDuration(block))}
                {block.quality_score ? ` · Quality ${block.quality_score}/10` : ""}
              </p>
              {block.notes ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{block.notes}</p> : null}
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button aria-label={`Edit ${block.title}`} onClick={() => onEdit(block)} size="icon" type="button" variant="ghost">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button aria-label={`Delete ${block.title}`} onClick={() => onDelete(block)} size="icon" type="button" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
