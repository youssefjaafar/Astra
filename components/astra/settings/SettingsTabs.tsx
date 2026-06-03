"use client";

import { Bot, Database, SlidersHorizontal, Sparkles, Target, UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/components/astra/settings/settings-utils";

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof UserCircle }> = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "targets", label: "Targets", icon: Target },
  { id: "ai", label: "AI Copilot", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Sparkles },
  { id: "data", label: "Data", icon: Database },
];

type SettingsTabsProps = {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/50 p-1 backdrop-blur-xl">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition",
                active ? "bg-cyan-300/10 text-cyan-100 shadow-glow" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
              )}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              {tab.id === "targets" ? <SlidersHorizontal className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
