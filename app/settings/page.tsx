import { Database, KeyRound, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionGrid } from "@/components/section-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        description="Configure preferences, data readiness, and integration placeholders without storing secrets in the repository."
        eyebrow="Settings"
        signal="Local mock data"
        title="Control Panel"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard helper=".env.example included" icon={KeyRound} label="Environment" progress={60} tone="cyan" value="Ready" />
        <MetricCard helper="Client factory returns null until configured" icon={Database} label="Supabase" progress={35} tone="blue" value="Stubbed" />
        <MetricCard helper="No shame, no noisy notifications" icon={ShieldCheck} label="UX Guardrails" progress={100} tone="emerald" value="Set" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionGrid description="Tune the operating system to your rhythm." title="Preferences">
          {["Start day at 6:30 AM", "Weekly report on Sunday evening", "Reduce notification volume", "Default focus block: 50 minutes"].map((item) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4" key={item}>
              <span className="text-sm text-slate-200">{item}</span>
              <Badge tone="neutral">Mock</Badge>
            </div>
          ))}
          <Button variant="secondary">
            <SlidersHorizontal className="h-4 w-4" />
            Save Preferences
          </Button>
        </SectionGrid>

        <SectionGrid description="A clean path for replacing mock data with real records." title="Integration Readiness">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">Supabase</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` when the database is ready.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">OpenAI-compatible AI API</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Add `OPENAI_COMPATIBLE_API_BASE_URL`, `OPENAI_COMPATIBLE_API_KEY`, and `AI_MODEL` later.
            </p>
          </div>
        </SectionGrid>
      </div>
    </>
  );
}
