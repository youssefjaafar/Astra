import { ClipboardCheck, Compass, Moon, TrendingUp } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewPrompts, weeklySignals } from "@/lib/mock-data";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        description="Close the loop: review what happened, name the pattern, and choose one realistic correction for tomorrow or next week."
        eyebrow="Daily Debrief"
        signal="Honest, supportive review"
        title="Reviews"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard helper="Short review, high signal" icon={Moon} label="Daily Review" progress={80} tone="cyan" value="4 min" />
        <MetricCard helper="Ready on Sunday" icon={TrendingUp} label="Weekly Report" progress={58} tone="violet" value="58%" />
        <MetricCard helper="One adjustment queued" icon={Compass} label="Course Correction" progress={100} tone="emerald" value="1" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <SectionGrid description="Capture enough truth to improve tomorrow." title="Daily Debrief">
          {reviewPrompts.map((item) => (
            <div className="space-y-2" key={item.title}>
              <label className="text-sm font-medium text-white">{item.title}</label>
              <Textarea placeholder={item.prompt} />
            </div>
          ))}
          <Button>
            <ClipboardCheck className="h-4 w-4" />
            Save Debrief
          </Button>
        </SectionGrid>

        <SectionGrid description="Patterns across time, habits, meals, workouts, reading, and spiritual anchors." title="Weekly Mission Report">
          {weeklySignals.map((signal) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={signal.label}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{signal.label}</p>
                <Badge tone="neutral">{signal.value}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{signal.delta}</p>
            </div>
          ))}
        </SectionGrid>
      </div>
    </>
  );
}
