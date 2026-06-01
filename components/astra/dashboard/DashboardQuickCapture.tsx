"use client";

import { SendHorizonal, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const examples = [
  "I drank 500ml water",
  "I worked out chest for 45 minutes",
  "I read 12 pages",
  "Remind me to call Alex tomorrow at 3",
  "I wasted 2 hours scrolling",
  "I prayed Fajr",
  "I meditated for 10 minutes",
];

type SignalEntry = {
  id: number;
  text: string;
};

export function DashboardQuickCapture() {
  const [entry, setEntry] = useState("");
  const [signals, setSignals] = useState<SignalEntry[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = entry.trim();

    if (!trimmed) {
      return;
    }

    setSignals((current) => [{ id: Date.now(), text: trimmed }, ...current].slice(0, 6));
    setEntry("");
  }

  return (
    <GlassCard glow className="p-5">
      <SectionHeader
        title="Quick Capture"
        subtitle="Drop natural-language life signals here. Structured AI parsing will arrive later."
        action={<Badge tone="violet">AI parsing coming soon</Badge>}
      />
      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <Textarea
          onChange={(event) => setEntry(event.target.value)}
          placeholder={examples[0]}
          value={entry}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap gap-2">
            {examples.slice(0, 3).map((example) => (
              <button
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400 transition hover:border-cyan-200/30 hover:text-cyan-100"
                key={example}
                onClick={() => setEntry(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
          <Button className="shrink-0" type="submit">
            <SendHorizonal className="h-4 w-4" />
            Capture Signal
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-200" />
          <p className="text-sm font-medium text-white">Recent Signals</p>
        </div>
        <div className="space-y-2">
          {signals.length > 0 ? (
            signals.map((signal) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300" key={signal.id}>
                {signal.text}
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-500">
              No signals captured in this session yet. Try &quot;I prayed Fajr&quot; or &quot;I wasted 2 hours scrolling&quot;.
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
