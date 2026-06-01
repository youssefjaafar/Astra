import { GlassCard, SectionHeader } from "@/components/astra";
import { Textarea } from "@/components/ui/textarea";

const prompts = [
  "What went well today?",
  "What drained your energy?",
  "What should change tomorrow?",
];

export function DailyDebriefPreview() {
  return (
    <GlassCard className="p-5">
      <SectionHeader title="Daily Debrief Preview" subtitle="Three prompts to close the loop gently." />
      <div className="mt-5 grid gap-3">
        {prompts.map((prompt) => (
          <label className="space-y-2" key={prompt}>
            <span className="text-sm font-medium text-white">{prompt}</span>
            <Textarea className="min-h-24" placeholder="Capture a short signal..." />
          </label>
        ))}
      </div>
    </GlassCard>
  );
}
