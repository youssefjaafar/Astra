"use client";

import { Check, Loader2, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserDbClient } from "@/lib/db/client";
import { saveInsightSchema, type CopilotAnswer } from "@/lib/validations/copilot";
import type { AIInsight } from "@/components/astra/ai/ai-utils";

type SaveInsightButtonProps = {
  answer: CopilotAnswer;
  userId: string;
  relatedPeriodStart: string | null;
  relatedPeriodEnd: string | null;
  onSaved: (insight: AIInsight) => void;
  onError: (message: string) => void;
};

export function SaveInsightButton({ answer, userId, relatedPeriodStart, relatedPeriodEnd, onSaved, onError }: SaveInsightButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveInsight() {
    setSaving(true);
    setSaved(false);

    const parsed = saveInsightSchema.safeParse({
      user_id: userId,
      insight_type: answer.insight_type,
      title: answer.title,
      body: answer.answer,
      confidence: answer.confidence,
      suggested_action: answer.suggested_action,
      related_period_start: relatedPeriodStart,
      related_period_end: relatedPeriodEnd,
    });

    if (!parsed.success) {
      setSaving(false);
      onError("Astra could not save this insight because the response shape was invalid.");
      return;
    }

    const supabase = createBrowserDbClient();
    const { data, error } = await supabase
      .from("ai_insights")
      .insert({
        user_id: userId,
        ...parsed.data,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      onError(error.message);
      return;
    }

    setSaved(true);
    onSaved(data);
  }

  return (
    <Button disabled={saving || saved} onClick={saveInsight} size="sm" type="button" variant="secondary">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {saved ? "Saved" : "Save Insight"}
    </Button>
  );
}
