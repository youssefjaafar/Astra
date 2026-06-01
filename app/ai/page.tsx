import { Brain, MessageSquareText, Route, WandSparkles } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { QuickCapture } from "@/components/quick-capture";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";

const aiFeatures = [
  {
    icon: MessageSquareText,
    title: "Quick Capture Parser",
    body: "Turn plain language into structured water, workout, reminder, reading, task, or screen-time records.",
  },
  {
    icon: Route,
    title: "Daily Planning",
    body: "Generate a simple plan from tasks, habits, schedule, priorities, and recovery state.",
  },
  {
    icon: WandSparkles,
    title: "Course Correction",
    body: "Suggest one small adjustment that improves tomorrow without flooding the user with advice.",
  },
];

export default function AiPage() {
  return (
    <>
      <PageHeader
        description="The AI Copilot is designed to interpret life signals, summarize patterns, and keep feedback supportive and practical."
        eyebrow="AI Copilot"
        signal="Mock mode"
        title="Guidance Layer"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard helper="Local parser contract" icon={Brain} label="Capture Support" progress={70} tone="cyan" value="Ready" />
        <MetricCard helper="Prompt path prepared" icon={Route} label="Daily Plan" progress={45} tone="blue" value="Draft" />
        <MetricCard helper="OpenAI-compatible later" icon={WandSparkles} label="Debrief AI" progress={35} tone="violet" value="Planned" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <QuickCapture />

        <SectionGrid description="Prepared as product contracts before backend integration." title="AI Feature Map">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={feature.title}>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md border border-cyan-200/20 bg-cyan-200/10">
                    <Icon className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="text-sm font-medium text-white">{feature.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.body}</p>
              </div>
            );
          })}
          <div className="rounded-lg border border-violet-200/20 bg-violet-200/10 p-4">
            <Badge tone="violet">Feedback principle</Badge>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Be supportive and honest. Recommend small course corrections, not overwhelming life overhauls.
            </p>
          </div>
        </SectionGrid>
      </div>
    </>
  );
}
